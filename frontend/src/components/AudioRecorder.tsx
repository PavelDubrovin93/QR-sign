import { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaStopCircle,
  FaPlayCircle,
  FaDownload,
  FaTrashAlt,
} from "react-icons/fa";

function AudioRecorder({
  onRecordingComplete,
  onRecordingDelete,
  currentAudioUrl,
}: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [localAudioBlob, setLocalAudioBlob] = useState<Blob | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!currentAudioUrl && localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
      setLocalAudioUrl(null);
      setLocalAudioBlob(null);
    }
  }, [currentAudioUrl, localAudioUrl]);

  const startRecording = async () => {
    try {
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
      setLocalAudioBlob(null);
      setLocalAudioUrl(null);
      if (onRecordingDelete) {
        onRecordingDelete();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const newAudioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(newAudioBlob);

        setLocalAudioBlob(newAudioBlob);
        setLocalAudioUrl(url);

        if (onRecordingComplete) {
          onRecordingComplete(url);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Ошибка доступа к микрофону:", err);
      alert("Не удалось получить доступ к микрофону. Проверьте разрешения.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (localAudioUrl) {
      const audio = new Audio(localAudioUrl);
      audio.play();
    }
  };

  const downloadRecording = () => {
    if (localAudioUrl && localAudioBlob) {
      const a = document.createElement("a");
      a.href = localAudioUrl;
      a.download = `audio-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const deleteRecording = () => {
    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
      setLocalAudioUrl(null);
      setLocalAudioBlob(null);
    }
    if (onRecordingDelete) {
      onRecordingDelete();
    }
  };

  const hasLocalRecording = !!localAudioUrl;

  return (
    <div className="flex flex-col items-start">
      <div
        className="flex items-center"
        onClick={!isRecording ? startRecording : stopRecording}
      >
        {!isRecording ? (
          <div className="mr-2 cursor-pointer">
            <FaMicrophone size={25} color="#408ae2" />
          </div>
        ) : (
          <div className="mr-2 cursor-pointer">
            <FaStopCircle size={25} color="#d9534f" />
          </div>
        )}
        <p className="text-white">
          {isRecording
            ? "Идёт запись..."
            : hasLocalRecording
            ? "Запись готова."
            : "Нажмите, чтобы начать запись"}
        </p>
      </div>

      {/* {hasLocalRecording && !isRecording && (
        <div className="mt-4 flex items-center">
          <p className="mr-2 text-white">Предпросмотр:</p>
          <div className="cursor-pointer mr-2" onClick={playRecording}>
            <FaPlayCircle size={25} color="#408ae2" />
          </div>
          <div className="cursor-pointer mr-2" onClick={downloadRecording}>
            <FaDownload size={25} color="#408ae2" />
          </div>
          <div className="cursor-pointer" onClick={deleteRecording}>
            <FaTrashAlt size={25} color="#d9534f" />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default AudioRecorder;
