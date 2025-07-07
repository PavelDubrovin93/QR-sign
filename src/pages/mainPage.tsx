import { useEffect, useState } from "react";
import { Select, Section } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";

import TaskCard from "../components/TaskCard";
import { getTasksByCompany } from "../api/task/get-tasksByCompany";
import { setTasksBoardByCompany } from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import { useDispatch, useSelector } from "react-redux";
import { getCompaniesByClient } from "../api/company/get-companies-byClient";
import { setUserCompanies } from "../store/slices/entities/user_companies/user_companiesSlice";
import type { Task } from "../@types/task";
import Loading from "../components/Loading";
import type { UserCompanies } from "../@types/user";

function HomePage() {
  const dispatch = useDispatch();
  const [selectedValue, setSelectedValue] = useState<string | number>("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);

  const dataCompanies: UserCompanies[] = useSelector(
    (state: any) => state.entities.user_companies.data
  );

  const tasksRedux: Task[] = useSelector(
    (state: any) => state.entities.tasksBoard.data
  );

  console.log(tasksRedux, 'tasksRedux')
  const telegramData = getTelegramData();

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const res = await getCompaniesByClient();
        if (res.data) {
          dispatch(setUserCompanies(res.data));
          if (res.data.length > 0) {
            setSelectedValue(res.data[0].company_id || "");
          }
        }
      } catch (e: any) {
        console.error("Ошибка загрузки компаний:", e);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    if (
      selectedValue !== "" &&
      selectedValue !== null &&
      selectedValue !== undefined
    ) {
      const fetchTasks = async () => {
        setIsLoadingTasks(true);
        try {
          const res = await getTasksByCompany(String(selectedValue));
          if (res.data) {
            dispatch(setTasksBoardByCompany(res.data));
          }
        } catch (e: any) {
          console.error("Ошибка загрузки задач:", e);
        } finally {
          setIsLoadingTasks(false);
        }
      };

      fetchTasks();
    }
  }, [selectedValue]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
    console.log("Selected company ID:", event.target.value);
  };

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
        <div style={{ height: "84px" }}>
          {isLoadingCompanies ? (
            <div
              style={{
                padding: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Loading size={30} color={"#2a90ff"} />
              <span
                style={{ marginLeft: "10px", color: "var(--tgui--text_color)" }}
              >
                Загрузка компаний...
              </span>
            </div>
          ) : (
            <Select
              status="focused"
              value={selectedValue}
              onChange={handleSelectChange}
              disabled={dataCompanies?.length === 0}
            >
              {dataCompanies?.map((company: UserCompanies) => (
                <option
                  key={company.company_id}
                  value={company.company_id || ""}
                >
                  {company.company_name}
                </option>
              ))}
              {dataCompanies?.length === 0 && (
                <option disabled>Нет доступных компаний</option>
              )}
            </Select>
          )}
        </div>
      </Section>

      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Задачи
        </Section.Header>

        {isLoadingTasks ? (
          <div
            style={{
              padding: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Loading size={30} color={"#2a90ff"} />
            <span
              style={{ marginLeft: "10px", color: "var(--tgui--text_color)" }}
            >
              Загрузка задач...
            </span>
          </div>
        ) : (
          <>
            {tasksRedux.length > 0 ? (
              tasksRedux?.map((elm: Task) => {
                //@ts-ignore
                return <TaskCard data={elm} key={elm.id} path={`/taskboard/${elm.id}`} />;
              })
            ) : (
              <div className="flex justify-center items-center">
                <p
                  className="text-sm flex items-center justify-center"
                  style={{
                    color: telegramData?.themeParams?.text_color || "gray",
                    height: "50px",
                  }}
                >
                  Нет задач
                </p>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}

export default HomePage;
