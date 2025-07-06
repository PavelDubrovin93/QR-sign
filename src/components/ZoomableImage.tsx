import React, { useState } from 'react';

interface TaskPoint {
  id: number;
  x: number; // % от ширины изображения
  y: number; // % от высоты изображения
  title: string;
}

export default function ImageWithTaskPoints() {
  const imageSrc = 'test_image.jpeg'; // Путь к картинке в public/
  const [selectedTask, setSelectedTask] = useState<TaskPoint | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const taskPoints: TaskPoint[] = [
    { id: 1, x: 30, y: 40, title: 'Убрать цветок' },
    { id: 2, x: 70, y: 60, title: 'Замена фасала' },
    { id: 3, x: 50, y: 80, title: 'Перекрасить в синий' },
  ];

  const handlePointClick = (task: TaskPoint) => {
    setSelectedTask(task);
    setIsZoomed(true);
  };

  const resetZoom = () => {
    setIsZoomed(false);
    setSelectedTask(null);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative w-full h-auto overflow-hidden rounded-lg shadow-md">
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Автомобиль"
          className={`w-full h-auto transition-transform duration-500 ${
            isZoomed ? 'scale-150' : ''
          }`}
          style={{
            transformOrigin: isZoomed && selectedTask
              ? `${selectedTask.x}% ${selectedTask.y}%`
              : 'center center',
          }}
        />

        {taskPoints.map((point) => (
          <button
            key={point.id}
            onClick={() => handlePointClick(point)}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-70%, -70%)',
            }}
            className="absolute z-10 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md hover:bg-indigo-600 active:scale-110 transition-all"
            aria-label={point.title}
          >
            {point.id}
          </button>
        ))}
      </div>

      {selectedTask && (
        <div
          className="mt-4 p-3 bg-white border border-gray-300 rounded-md shadow-md text-sm text-gray-700"
          style={{
            left: `${selectedTask.x}%`,
            top: `${selectedTask.y + 10}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {selectedTask.title}
        </div>
      )}

      {isZoomed && (
        <button
          onClick={resetZoom}
          className="mt-4 block mx-auto px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Вернуться
        </button>
      )}
    </div>
  );
}