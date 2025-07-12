// import { useState } from 'react';
// import { Select, Section, Cell } from '@telegram-apps/telegram-ui';
// import { getTelegramData } from '@telegram-apps/telegram-ui/dist/helpers/telegram';

import TaskCardOpened from '../components/TaskCardOpened'
// import { useParams } from 'react-router-dom';

function TaskboardPage() {
    // const { id } = useParams();

    return (
        <>
            <TaskCardOpened editMode={false} />
        </>
    );
}

export default TaskboardPage;