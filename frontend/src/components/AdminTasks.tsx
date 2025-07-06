import { useSelector } from "react-redux";
import TaskCard from "../components/TaskCard";
import type { RootState } from "../store/rootReducer";

const AdminTasks = () => {
  const { data: dataTasks, isLoading: _ } = useSelector(
    (state: RootState) => state.entities.tasksBoard
  );

  //   if (isLoadingTasks) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <Loading size={24} color={"#2a90ff"} />
  //       </div>
  //     );
  //   }
  return (
    <>
      {dataTasks?.map((task) => {
        return <TaskCard data={task} path={`/admin-taskboard/${task.id}`} />;
      })}
    </>
  );
};

export default AdminTasks;
