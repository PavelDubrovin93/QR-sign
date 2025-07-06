// import { useState } from 'react';
// import { Select, Section, Cell } from '@telegram-apps/telegram-ui';
// import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';

import TaskCardOpened from '../components/TaskCardOpened'

function TaskboardPage() {
    // const [company, setCompany] = useState('');
    // const [selectComponentColor, setSelectComponentColor] = useState('');

    // const telegramData = getTelegramData();

    return (
          <>
          <TaskCardOpened editMode={false}/>
          </>
    );
}

export default TaskboardPage;