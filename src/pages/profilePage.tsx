import {
  Select,
  Section,
  ColorInput,
  Cell,
  Radio,
  Input,
} from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useCallback, useEffect, useState } from "react";
import { getCompaniesByClient } from "../api/company/get-companies-byClient";
import { updateUserProfile } from "../api/user/update-userProfile";
import { useSelector } from "react-redux";

function ProfilePage() {
  const { id, user_id, current_role, default_company_choice } = useSelector(
    (state: any) => state.entities.user
  );
  const [companies, setCompanies] = useState<
    { value: number; label: string }[] | []
  >([
    { label: "Компания 1", value: 1 },
    { label: "Компания 2", value: 2 },
  ]);
  const [defaultColor, setDefaultColor] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<number | undefined>(default_company_choice);
  const [nameForAdmin, setNameForAdmin] = useState<string>("");
  const telegramData = getTelegramData();
//   console.log(selectedCompany, "selectedCompany");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCompaniesByClient();
        if (res.data) {
          setCompanies(res.data);
          setSelectedCompany(res.data[0].value);
        } else {
          setCompanies([]);
        }
      } catch (e: any) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  const handleUpdateSettings = useCallback(async () => {
    if (
      selectedCompany === undefined ||
      id === undefined ||
      user_id === undefined ||
      !current_role
    ) {
      return;
    }

    const dataToSend = {
      id: id,
      user_id: user_id,
      default_company_choice: selectedCompany,
      default_color: defaultColor,
      current_role: current_role,
      name_for_admin: nameForAdmin,
    };

    try {
      await updateUserProfile(dataToSend);
    } catch (e: any) {
      console.error(e);
    }
  }, [id, user_id, defaultColor, selectedCompany, current_role, nameForAdmin]);

  useEffect(() => {
    if (
      selectedCompany === undefined ||
      id === undefined ||
      user_id === undefined ||
      !current_role
    ) {
      console.log(id, user_id, current_role, "values");
      return;
    }

    const handler = setTimeout(() => {
      handleUpdateSettings();
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [defaultColor, selectedCompany, nameForAdmin, id, user_id, current_role]);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDefaultColor(e.target.value);
    },
    []
  );
  const handleCompanyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCompany(Number(e.target.value));
    },
    []
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNameForAdmin(e.target.value);
    },
    []
  );

  return (
    <>
      <Section className="pb-6">
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Цвет по умолчанию
        </Section.Header>

        <div
          style={{
            backgroundColor: "${telegramData?.themeParams.section_bg_color}",
            color: "var(--tgui--bg_color)",
          }}
        >
          <ColorInput
            status="focused"
            placeholder={telegramData?.themeParams.link_color}
            // value={telegramData?.themeParams.link_color}
            value={defaultColor}
            onChange={handleColorChange}
          />
        </div>

        <Section.Footer
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Цвет приложения, по умолчанию - основные цвета телеграма
        </Section.Footer>
      </Section>

      <Section className="pb-6">
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Организация по умолчанию
        </Section.Header>

        <div
          style={{
            backgroundColor: "${telegramData?.themeParams.section_bg_color}",
            color: "var(--tgui--bg_color)",
          }}
        >
          <Select
            status="focused"
            style={{ border: "none", color: "var(--tgui--text_color)" }}
            value={selectedCompany !== undefined ? selectedCompany : ""}
            onChange={handleCompanyChange}
          >
            {companies.length === 0 ? (
              <option value="" disabled>
                Загрузка компаний...
              </option>
            ) : selectedCompany === undefined ? (
              <option value="" disabled>
                Выберите компанию
              </option>
            ) : null}
            {companies.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Section.Footer
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Компания, задачи которой будут отображаться вам в первую очередь.
        </Section.Footer>
      </Section>

      <Section className="pb-6">
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          ФИО для администратора
        </Section.Header>

        <div
          style={{
            backgroundColor: "${telegramData?.themeParams.section_bg_color}",
            color: "var(--tgui--bg_color)",
          }}
        >
          <Input
            placeholder="Введите ФИО"
            status="focused"
            value={nameForAdmin}
            onChange={handleNameChange}
          />
        </div>
        <Section.Footer
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Имя, которое будет отображаться вашему администратору.
        </Section.Footer>
      </Section>

      <Section>
        <Section.Header
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          Выполнение задания
        </Section.Header>

        <div
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          <Cell
            className="flex items-center justify-between"
            Component="label"
            before={<Radio name="radio" value="1" />}
          >
            <p style={{ color: "var(--tgui--text_color)" }}>Чекбоксы</p>
          </Cell>
          <Cell
            Component="label"
            before={<Radio name="radio" value="2" />}
            multiline
          >
            <p style={{ color: "var(--tgui--text_color)" }}>Цвета</p>
          </Cell>
        </div>

        <Section.Footer
          style={
            telegramData?.colorScheme === "dark"
              ? { backgroundColor: "var(--tgui--bg_color)" }
              : {}
          }
        >
          При выборе цветов задания будут отмечены соответствующим цветом
          (зеленый / красный). Настройка цветов будет расширена.
        </Section.Footer>
      </Section>
    </>
  );
}

export default ProfilePage;
