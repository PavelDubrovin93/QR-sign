import csv
import os
from pathlib import Path
from sqlalchemy import create_engine, insert
from sqlalchemy.orm import sessionmaker

# Конфигурация подключения к базе данных
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/datadb"

# Табличные классы (опираемся на твои предыдущие модели)
# Их определения можно заменить реальными классами твоей ORM-модели
class Users:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'users'

class Company:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'companies'

class UISettings:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'ui_settings'

class UserCompany:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'user_company'

class WorkGroups:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'work_group'

class TaskBoards:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'task_boards'

class TaskPoints:
    __table_args__ = {'schema': 'public'}
    __tablename__ = 'task_points'

# Определение классов и создание сессии
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = SessionLocal()

# Функция для вставки данных
def bulk_insert(model_class, records):
    db_session.bulk_insert_mappings(model_class, records)
    db_session.commit()

# Основная логика обработки CSV-файла
def process_csv(csv_path):
    with open(csv_path, newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        current_section = None
        buffer = []
        
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            
            if row[0].startswith("SECTION"):
                # Начало новой секции
                if current_section:
                    model_class = globals()[current_section.split(":")[1].strip()]
                    bulk_insert(model_class, buffer)
                
                current_section = row[0]
                buffer.clear()
                next(reader)  # Пропускаем заголовочную строку
                columns = next(reader)
                continue
            
            # Собираем данные для текущего раздела
            record = dict(zip(columns, row))
            buffer.append(record)
        
        # Записываем последнюю секцию
        if current_section:
            model_class = globals()[current_section.split(":")[1].strip()]
            bulk_insert(model_class, buffer)

# Основной запуск программы
if __name__ == "__main__":
    csv_file_path = "./test_data.csv"
    process_csv(csv_file_path)
    print("Данные успешно загружены!")