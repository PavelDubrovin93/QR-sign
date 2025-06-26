export type Task = {
  id: string;
  // other fields...
};

type GeoCoordinates = [number, number];

type ImagePointCoordinates = [number, number];

interface TaskPoint {
  id: number;
  title: string;
  taskboard_id: number;
  thumbnails: string;
  mark_icon: string;
  coordinates: GeoCoordinates;
  points: ImagePointCoordinates;
  qrcode: string;
  description: string;
  voice_message: string;
  done_at: string;
  issued_at: string;
  warning_at: string;
}

// у таски нет поля isCompleted
export interface TaskBoard {
  id: number;
  title: string;
  company_id: number;
  work_group_id: number;
  image: string;
  location: GeoCoordinates;
  type: string;
  description: string;
  done_at: string;
  task_points: TaskPoint[];
}
