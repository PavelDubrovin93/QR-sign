import { useState } from 'react';
import { Select, Section, Cell } from '@telegram-apps/telegram-ui';
import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';

import TaskCard from '../components/TaskCard'

function HomePage() {
    const [company, setCompany] = useState('');
    const [selectComponentColor, setSelectComponentColor] = useState('');

    const telegramData = getTelegramData();

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

          <TaskCard />
          <TaskCard />
          <TaskCard />
          <TaskCard />

          </>
    );
}

export default HomePage;