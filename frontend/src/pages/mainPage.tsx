import { useEffect, useState } from 'react';
import { Select, Section, Cell } from '@telegram-apps/telegram-ui';
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';

import TaskCard from '../components/TaskCard'
import { getTasks } from '../api/task/get-tasks';

function HomePage() {
    const [company, setCompany] = useState('');
    const [selectComponentColor, setSelectComponentColor] = useState('');

    const telegramData = getTelegramData();

    const getTasksData = () => {
     return getTasks()
          .then((res) => {
              // setTasksData(res.data) - либо через локальное состояние,
              // dispatch(action(res.data)) - либо через Redux
            })

      }

    useEffect(() => {
      const fetchData = async () => {
          try {
             await getTasksData();
          } catch (e: any) {
              console.log(e);
          }
      };

      fetchData();
    }, [])

    return (
          <>
          <Section>
            <Section.Header style={telegramData?.colorScheme === "dark" ? { backgroundColor: 'var(--tgui--bg_color)' } : {}}>
              Организация
            </Section.Header>
              <Select status='focused' style={{ border: 'none', color: 'var(--tgui--text_color)' }}>
                <option>Компания А</option>
                <option>Компания Б</option>
              </Select>
          </Section>  
          {/* hard code */}
          <TaskCard path={"/taskboard/${task.id}"}/>
          <TaskCard path={"/taskboard/${task.id}"}/>
          <TaskCard path={"/taskboard/${task.id}"}/>
          <TaskCard path={"/taskboard/${task.id}"}/>

          </>
    );
}

export default HomePage;