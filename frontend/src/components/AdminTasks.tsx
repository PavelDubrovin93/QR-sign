import type { Task } from "../@types/task";
import TaskCard from "../components/TaskCard";

interface AdminTasksProps {
  data: Task[];
  loading: boolean;
}

const AdminTasks = ({ data, loading }: AdminTasksProps) => {
    console.log(loading, 'loading')
  return (
    <>
      <TaskCard path={"/admin-taskboard/${task.id}"} />
      <TaskCard path={"/admin-taskboard/${task.id}"} />
    </>
  );
};

export default AdminTasks;
