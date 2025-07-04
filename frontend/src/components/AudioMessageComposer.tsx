import { useState, useCallback } from "react";
import AudioRecorder from "./AudioRecorder";
import Waveform from "./Waveform";
import { FaTrashAlt } from "react-icons/fa";

const AudioMessageComposer = () => {
  const [isEditAudio, setIsEditAudio] = useState<boolean>(true);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const handleRecordingComplete = useCallback((url: string) => {
    setRecordedAudioUrl(url);
    setIsEditAudio(false);
  }, []);

  const handleRecordingDelete = useCallback(() => {
    setRecordedAudioUrl(null);
    setIsEditAudio(true);
  }, []);

  const handleWaveformDelete = useCallback(() => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setIsEditAudio(true);
  }, [recordedAudioUrl]);

  return (
    <div className="p-2 bg-gray-900 rounded-lg shadow-lg flex flex-col items-start">
      {isEditAudio ? (
        <div className="w-full">
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            onRecordingDelete={handleRecordingDelete}
            currentAudioUrl={recordedAudioUrl}
          />
        </div>
      ) : recordedAudioUrl ? (
        <div className="w-full">
          <Waveform audioUrl={recordedAudioUrl} />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleWaveformDelete}
              className="text-red-500 hover:text-red-400 text-sm px-2 py-1 rounded"
            >
              <FaTrashAlt className="inline mr-1" /> Удалить запись
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">Запись не найдена.</div>
      )}
    </div>
  );
};

export default AudioMessageComposer;
