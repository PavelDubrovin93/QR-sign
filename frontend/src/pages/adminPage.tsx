import { useEffect, useState } from 'react';
import { Select, Section, Cell, Input, Button } from '@telegram-apps/telegram-ui';
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';
import { getTasks } from '../api/task/get-tasks';

import TaskCard from '../components/TaskCard'
import AdminGroupCard from '../components/AdminGroupCard';

const AdminPage = () => {
    const [company, setCompany] = useState('');
    const [selectComponentColor, setSelectComponentColor] = useState('');

    const telegramData = getTelegramData();


    return (
          <>
          <div className='flex w-full justify-center px-5'>
            <Button className='mb-4 w-full'>Добавить группу</Button>
          </div>
          <Section>
            <Section.Header style={telegramData?.colorScheme === "dark" ? { backgroundColor: 'var(--tgui--bg_color)' } : {}}>
              Компания
            </Section.Header>
              <Select status='focused' style={{ border: 'none', color: 'var(--tgui--text_color)' }}>
                <option>Компания А</option>
                <option>Компания Б</option>
              </Select>
              <Input status='focused' placeholder='Поиск'/>
          </Section>  

          <AdminGroupCard />
          </>
    );
};

export default AdminPage;
