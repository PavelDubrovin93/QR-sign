import { useEffect, useState } from "react";
import { Select, Section } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import TaskCard from "../components/TaskCard";
import { setTasksBoardByCompany } from "../store/slices/entities/tasksBoard/tasksBoardSlice";
import { setUserCompanies } from "../store/slices/entities/user_companies/user_companiesSlice";
import { useDispatch, useSelector } from "react-redux";
import type { Task } from "../@types/task";
import Loading from "../components/Loading";
import type { UserCompanies } from "../@types/user";
import type { WorkGroup } from "../@types/group";
import { getCompaniesByClient } from "../api/company/get-companies-byClient";
import { getTasksByCompany } from "../api/task/get-tasksByCompany";
import { getWorkGroupsSelect } from "../api/work_group/get-work_groupsSelect";

// Импорт оптимизированных хуков
// import { useTelegram, useCompanyData, useWorkGroups } from "../utils/hooks";

function HomePage() {
  const dispatch = useDispatch();
  const [selectedValue, setSelectedValue] = useState<string | number>("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState<string | number>("");

  console.log("СОСТОЯНИЕ: selectedValue =", selectedValue, "workGroups.length =", workGroups.length);

  const dataCompanies: UserCompanies[] = useSelector(
    (state: any) => state.entities.user_companies.data
  );

  const tasksRedux: Task[] = useSelector(
    (state: any) => state.entities.tasksBoard.data
  );

  console.log(tasksRedux, 'tasksRedux')
  console.log("Рендер mainPage: workGroups =", workGroups, "selectedValue =", selectedValue);
  const telegramData = getTelegramData();

  useEffect(() => {
    console.log("апуск первого useEffect (загрузка компаний)");
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const res = await getCompaniesByClient();
        if (res.data) {
          console.log("Компании загружены:", res.data);
          dispatch(setUserCompanies(res.data));
          if (res.data.length > 0) {
            const companyId = res.data[0].company_id || "";
            console.log("Устанавливаем selectedValue =", companyId, "тип:", typeof companyId);
            setSelectedValue(companyId);
          } else {
            console.log("Нет компаний в res.data");
          }
        } else {
          console.log("res.data пустой");
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
    console.log("seEffect: selectedValue изменился на:", selectedValue);
    if (
      selectedValue !== "" &&
      selectedValue !== null &&
      selectedValue !== undefined
    ) {
      console.log("Условие выполнено, загружаем данные для компании:", selectedValue);
      const fetchTasksAndWorkGroups = async () => {
        setIsLoadingTasks(true);
        try {
          console.log("Отправляем запросы для компании:", selectedValue);
          const [tasksResponse, workGroupsResponse] = await Promise.allSettled([
            getTasksByCompany(String(selectedValue)),
            getWorkGroupsSelect(String(selectedValue))
          ]);
          
          console.log("Получены ответы:", { tasksResponse, workGroupsResponse });

          if (tasksResponse.status === "fulfilled" && tasksResponse.value.data) {
            dispatch(setTasksBoardByCompany(tasksResponse.value.data));
          }

                    if (workGroupsResponse.status === "fulfilled" && workGroupsResponse.value.data) {
            console.log("WorkGroups загружены:", workGroupsResponse.value.data);
            setWorkGroups(workGroupsResponse.value.data);
          } else {
            console.log("❌ Ошибка загрузки workGroups:", workGroupsResponse);
            setWorkGroups([]);
          }
        } catch (e: any) {
          console.error("Ошибка загрузки данных:", e);
        } finally {
          setIsLoadingTasks(false);
        }
      };

      fetchTasksAndWorkGroups();
    } else {
      console.log("❌ Условие НЕ выполнено! selectedValue =", selectedValue, "тип:", typeof selectedValue);
    }
  }, [selectedValue]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
    setSelectedWorkGroup(""); // Сбрасываем выбранную workgroup при смене компании
    console.log("Selected company ID:", event.target.value);
  };

  const handleWorkGroupSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWorkGroup(event.target.value);
    console.log("Selected workgroup ID:", event.target.value);
  };

  // Фильтрация задач по выбранной workgroup
  const filteredTasks = selectedWorkGroup === "" || selectedWorkGroup === "all" 
    ? tasksRedux 
    : tasksRedux.filter((task: Task) => String(task.work_group_id) === String(selectedWorkGroup));

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

      {/* Фильтр по рабочим группам */}
      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Рабочая группа
        </Section.Header>
        <div style={{ height: "84px" }}>
          <Select
            status="focused"
            value={selectedWorkGroup}
            onChange={handleWorkGroupSelectChange}
          >
            <option value="">Все группы</option>
            {workGroups.map((workGroup: WorkGroup) => {
              console.log("Рендерим option для группы:", workGroup);
              return (
                <option key={workGroup.id} value={workGroup.id}>
                  {workGroup.title}
                </option>
              );
            })}
          </Select>
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

        
      </Section>
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
            {filteredTasks.length > 0 ? (
              filteredTasks?.map((elm: Task, index: number) => {
                console.log("Рендерим TaskCard для задачи:", elm.title, "work_group_id:", elm.work_group_id, "workGroups:", workGroups);
                //@ts-ignore
                return <TaskCard data={elm} key={elm.id || `task-${index}`} path={`/taskboard/${elm.id}`} workGroups={workGroups} />;
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
    </>
  );
}

export default HomePage;
