import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";
import formatTime from "../utils/formatToMinSec";

type WaveFormProps = {
  audioUrl: string;
};

const Waveform = ({ audioUrl }: WaveFormProps) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [duration, setDuration] = useState<string>("0:00");
  const waveformRef = useRef(null);
  console.log(isLoading, "isLoading");
  const buttonBgColor = "none";
  const iconAndBorderColor = "#418be1";
  const waveColor = "#606a74";
  const progressColor = "#418be1";

  const wavesurferInstance = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    if (!wavesurferInstance.current) {
      wavesurferInstance.current = WaveSurfer.create({
        barWidth: 2,
        barRadius: 2,
        barGap: 1.5,
        barHeight: 1.5,
        cursorWidth: 0,
        container: waveformRef.current,
        backend: "WebAudio",
        height: 30,
        progressColor: progressColor,
        waveColor: waveColor,
        cursorColor: "transparent",
        interact: true,
        hideScrollbar: true,
      });

      wavesurferInstance.current.on("ready", () => {
        const audioDuration = wavesurferInstance.current?.getDuration();
        if (audioDuration !== undefined) {
          setDuration(formatTime(audioDuration));
        }
        setIsLoading(false);
      });

      wavesurferInstance.current.on("play", () => {
        setPlaying(true);
      });

      wavesurferInstance.current.on("pause", () => {
        setPlaying(false);
      });

      wavesurferInstance.current.on("finish", () => {
        setPlaying(false);
        wavesurferInstance.current?.seekTo(0);
      });

      wavesurferInstance.current.on("error", (error) => {
        console.error("Wavesurfer error:", error);
        setIsLoading(false);
        setDuration("Error");
      });
    }
    setIsLoading(true);
    wavesurferInstance.current.load(audioUrl);

    return () => {
      if (wavesurferInstance.current) {
        wavesurferInstance.current.destroy();
        wavesurferInstance.current = null;
      }
    };
  }, [audioUrl, waveColor, progressColor]);

  const handlePlay = useCallback(() => {
    if (!isLoading) {
      wavesurferInstance.current?.playPause();
    }
  }, [isLoading]);

  return (
    <div className="flex items-center w-full bg-[#202730] px-2 py-2 rounded-lg">
      <button
        onClick={handlePlay}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "36px",
          height: "36px",
          background: buttonBgColor,
          borderRadius: "50%",
          border: `1px solid ${iconAndBorderColor}`,
          outline: "none",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          paddingLeft: playing ? "0px" : "3px",
          flexShrink: 0,
        }}
        disabled={isLoading}
      >
        {playing ? (
          <FaPause size={16} color={iconAndBorderColor} />
        ) : (
          <FaPlay size={16} color={iconAndBorderColor} />
        )}
      </button>
      <div
        className="flex-grow h-[30px] ml-3"
        id="waveform"
        ref={waveformRef}
      />
      {isLoading ? (
        <>загрузка...</>
      ) : (
        <div className="text-sm text-gray-400 ml-1">{duration}</div>
      )}
    </div>
  );
};

export default Waveform;

{
  /* {isLoading ? (
        <div className="flex-grow h-[30px] ml-3 flex items-center justify-center text-sm text-gray-400">
          Идет получение данных...
        </div>
      ) : (
        <> */
}
