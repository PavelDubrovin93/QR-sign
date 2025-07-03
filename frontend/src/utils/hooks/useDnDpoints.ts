import { useState, useRef, useEffect, useCallback } from "react";
import type { TaskPoint } from "../../components/TaskCardOpened";

interface RenderedImageRect {
  width: number;
  height: number;
  left: number;
  top: number;
}

interface UseDragAndDropProps {
  editMode: boolean;
  setTaskPoints: React.Dispatch<React.SetStateAction<TaskPoint[]>>;
  activePoint: TaskPoint | null;
  setActivePoint: React.Dispatch<React.SetStateAction<TaskPoint | null>>;
  renderedImageRect: RenderedImageRect;
}

const useDnDpoints = ({
  editMode,
  setTaskPoints,
  activePoint,
  setActivePoint,
  renderedImageRect,
}: UseDragAndDropProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointId, setDraggedPointId] = useState<number | null>(null);
  const [offsetPx, setOffsetPx] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, point: TaskPoint) => {
      if (!editMode || !renderedImageRect.width || !renderedImageRect.height)
        return;

      if ("touches" in e) {
        e.preventDefault();
      }

      setIsDragging(true);
      setDraggedPointId(point.id);
      setActivePoint(point);

      let clientX: number;
      let clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const pointXInPx = (point.x / 100) * renderedImageRect.width;
      const pointYInPx = (point.y / 100) * renderedImageRect.height;

      setOffsetPx({
        x: clientX - renderedImageRect.left - pointXInPx,
        y: clientY - renderedImageRect.top - pointYInPx,
      });

      e.stopPropagation();
    },
    [editMode, renderedImageRect, setActivePoint]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (
        !isDragging ||
        draggedPointId === null ||
        !renderedImageRect.width ||
        !renderedImageRect.height
      )
        return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        let clientX: number;
        let clientY: number;

        if ("touches" in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        const cursorXRelativeToImagePx = clientX - renderedImageRect.left;
        const cursorYRelativeToImagePx = clientY - renderedImageRect.top;

        let newPointXInPx = cursorXRelativeToImagePx - offsetPx.x;
        let newPointYInPx = cursorYRelativeToImagePx - offsetPx.y;

        newPointXInPx = Math.max(
          0,
          Math.min(renderedImageRect.width, newPointXInPx)
        );
        newPointYInPx = Math.max(
          0,
          Math.min(renderedImageRect.height, newPointYInPx)
        );

        const newXPercent = (newPointXInPx / renderedImageRect.width) * 100;
        const newYPercent = (newPointYInPx / renderedImageRect.height) * 100;

        setTaskPoints((prevPoints) => {
          const updatedPoints = prevPoints.map((p) =>
            p.id === draggedPointId
              ? { ...p, x: newXPercent, y: newYPercent }
              : p
          );

          if (activePoint && activePoint.id === draggedPointId) {
            setActivePoint(
              updatedPoints.find((p) => p.id === draggedPointId) || null
            );
          }
          return updatedPoints;
        });
      });
      e.preventDefault();
    },
    [
      isDragging,
      draggedPointId,
      offsetPx,
      renderedImageRect,
      activePoint,
      setTaskPoints,
      setActivePoint,
    ]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedPointId(null);
    setOffsetPx({ x: 0, y: 0 });
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return {
    isDragging,
    draggedPointId,
    handleDragStart,
    handleDragEnd,
  };
};

export default useDnDpoints;
