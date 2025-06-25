import { Button } from "@telegram-apps/telegram-ui";
import TaskCard from "../components/TaskCard";

const adminTaskboardPage = () => {
  // Уже нужен редакс
  return (
    <>
      <div className="flex w-full justify-center px-5">
        <Button className="w-full">Добавить задачу</Button>
      </div>
      {/* hard code */}
      <TaskCard path={"/admin-taskboard/${task.id}"} />
      <TaskCard path={"/admin-taskboard/${task.id}"} />
    </>
  );
};

export default adminTaskboardPage;
