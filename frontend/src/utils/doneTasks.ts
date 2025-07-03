const doneTasks = (taskboards: any[]) => {
  let activeTasksCount = 0;
  let completedTasksCount = 0;

  taskboards.forEach((taskboard) => {
    if (taskboard.task_points && Array.isArray(taskboard.task_points)) {
      taskboard.task_points.forEach((taskPoint: any) => {
        if (taskPoint.done_at === null) {
          activeTasksCount++;
        } else {
          completedTasksCount++;
        }
      });
    }
  });

  return {
    activeTasks: activeTasksCount,
    completedTasks: completedTasksCount,
  };
};

export default doneTasks;
