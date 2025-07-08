import base64
import io
import uuid
from PIL import Image
from typing import Optional
from urllib.parse import urlparse
import boto3
from botocore.exceptions import ClientError
from environs import Env
import hashlib

# Инициализируем Environs для работы с переменными окружения
env = Env()
env.read_env()

def calculate_sha256(content):
    hasher = hashlib.sha256()
    hasher.update(content)
    return hasher.hexdigest()


BASE64_PATTERN = r'^data:image/(png|jpeg|gif);base64,'

class S3Service:
    """Сервис для работы с Amazon S3"""

    def __init__(self):
        """
        Инициализирует сервис, используя переменные окружения.
        """
        self._configure()

    def _configure(self):
        """
        Внутренний метод для настройки подключения к S3.
        """
        # Читаем конфигурацию из переменных окружения
        access_key = env.str("AWS_ACCESS_KEY_ID")
        secret_key = env.str("AWS_SECRET_ACCESS_KEY")
        bucket_name = env.str("AWS_S3_BUCKET_NAME")
        region = env.str("AWS_REGION")
        endpoint_url = env.str("S3_url")

        # Создаем клиента S3
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
            endpoint_url=endpoint_url
        )
        self.bucket_name = bucket_name

    def upload_image(self, file_b64: str) -> Optional[str]:
        """
        Загружает изображение в S3, принимая его в формате Base64, перекодирует в WebP .Возвращает URL.

        :param file_b64: Изображение в формате Base64
        :param filename: Имя файла (используется как ключ в S3)
        :return: Постоянный URL загруженного файла или None в случае ошибки
        """
        # Декодируем изображение из Base64
        _, file = file_b64.split(";base64,")
        file_binary = base64.b64decode(file)

        # Преобразование изображения в WebP с качеством 95%
        img = Image.open(io.BytesIO(file_binary))
        buffer = io.BytesIO()
        img.save(buffer, format="WebP", quality=95)
        processed_image = buffer.getvalue()
        sha256_value = calculate_sha256(processed_image)
        filename = f"{uuid.uuid4()}.webp"
        # Загружаем файл в S3
        self.s3_client.put_object(Bucket=self.bucket_name,
                                  Key=filename,
                                  Body=processed_image,
                                  ContentType="image/webp",
                                  ChecksumSHA256=sha256_value,
                                  ACL='public-read')
        # Генерация постоянного публичного URL
        public_url = f"{env.str("S3_url")}/{self.bucket_name}/{filename}"
        return public_url

    def delete_image(self, url: str) -> bool:
        """
        Удаляет изображение из S3 по переданному URL.

        :param url: URL изображения
        :return: True, если удаление выполнено успешно, иначе False
        """
        try:
            # Парсим URL, чтобы получить имя файла (ключ)
            parsed_url = urlparse(url)
            filename = parsed_url.path.split("/")[-1]

            # Удаляем файл из S3
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=filename)
            return True
        except ClientError as e:
            print(f"Ошибка при удалении файла: {e}")
            return False
