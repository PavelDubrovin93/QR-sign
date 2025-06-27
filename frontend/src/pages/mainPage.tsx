import { useEffect, useState } from "react";
import { Select, Section } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";

import TaskCard from "../components/TaskCard";
import { getTasks } from "../api/task/get-tasks";
import { setTasksBoard } from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import { useDispatch, useSelector } from "react-redux";
// import type { Task } from "../@types/task";

function HomePage() {
  const dispatch = useDispatch();
  const [company, setCompany] = useState("");
  const [selectComponentColor, setSelectComponentColor] = useState("");

  const tasksRedux = useSelector(
    (state: any) => state.entities.tasksBoard.data
  );

  const telegramData = getTelegramData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTasks();
        if (res.data) {
          dispatch(setTasksBoard(res.data));
        }
      } catch (e: any) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Организация
        </Section.Header>
        <Select
          status="focused"
          style={{ border: "none", color: "var(--tgui--text_color)" }}
        >
          <option>Компания А</option>
          <option>Компания Б</option>
        </Select>
      </Section>

      {/* {tasksRedux.lenght > 0 ? (
        tasksRedux?.map((elm: Task) => {
          return <TaskCard key={elm.id} path={`/taskboard/${elm.id}`} />;
        })
      ) : (
        <p className="text-sm" color={telegramData?.themeParams.text_color}>
          "Нет задач"
        </p>
      )} */}

      <TaskCard path={`/taskboard/${1}`} />
      <TaskCard path={"/taskboard/${task.id}"} />
    </>
  );
}

export default HomePage;
