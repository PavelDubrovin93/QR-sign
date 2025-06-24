import { useState, useRef } from "react";
import {
  FaMicrophone,
  FaStopCircle,
  FaPlayCircle,
  FaDownload,
  FaTrashAlt,
} from "react-icons/fa";

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
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
        setAudioBlob(newAudioBlob);

        const url = URL.createObjectURL(newAudioBlob);
        setAudioUrl(url);
        setHasRecorded(true);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      setHasRecorded(false);
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
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const downloadRecording = () => {
    if (audioUrl && audioBlob) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `audio-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setHasRecorded(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        {!isRecording ? (
          <div className="mr-2 cursor-pointer" onClick={startRecording}>
            <FaMicrophone size={25} color="#408ae2" />
          </div>
        ) : (
          <div className="mr-2 cursor-pointer" onClick={stopRecording}>
            <FaStopCircle size={25} color="#408ae2" />
          </div>
        )}
        <p>
          {isRecording
            ? "Идёт запись..."
            : hasRecorded
            ? "Запись готова."
            : "Нажмите, чтобы начать запись"}
        </p>
      </div>

      {audioUrl && !isRecording && hasRecorded && (
        <div className="mt-4 flex items-center">
          <p className="mr-2">Запись:</p>
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
      )}
    </div>
  );
}

export default AudioRecorder;
