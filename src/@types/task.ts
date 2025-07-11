export interface Task {
  id: number;
  title: string;
  company_id: number;
  work_group_id: number;
  image: string;
  location: GeoCoordinates;
  type: string;
  description: string;
  done_at: string | null;
  task_points: TaskPoint[];
}

type GeoCoordinates = readonly [number, number] | [number, number];

export interface TaskPoint {
  id: number;
  title: string;
  taskboard_id: number;
  thumbnails: string;
  mark_icon: string;
  coordinates: GeoCoordinates;
  qrcode: string;
  points: any[];
  description: string;
  voice_message: string | null;
  done_at: string | null;
  issued_at: string | null;
  warning_at: string | null;
  completed: boolean;
  x: number;
  y: number;
  locked?: boolean;
}

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

export interface AmountTasks {
  count: number;
}

export interface CreateTaskPayload {
  title: string;
  company_id: number;
  work_group_id: number;
  image: string;
  location: GeoCoordinates;
  type: string;
  description: string;
  task_points: Array<{
    title: string;
    coordinates: GeoCoordinates;
    qrcode: string;
    description: string;
    voice_message: string | null;
    thumbnails: string;
    mark_icon: string;
    points: any[];
  }>;
}
