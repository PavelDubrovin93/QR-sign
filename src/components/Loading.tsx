import React from "react";
import { ClipLoader } from "react-spinners";

interface LoadingProps {
  size?: number;
  color?: string;
  speedMultiplier?: number;
}

const Loading: React.FC<LoadingProps> = ({
  size = 10,
  color = "var(--tgui--accent_color)",
  speedMultiplier = 1,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      role="status"
      aria-label="Loading"
    >
      <ClipLoader color={color} size={size} speedMultiplier={speedMultiplier} />
      <span
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        Загрузка...
      </span>
    </div>
  );
};

export default Loading;
