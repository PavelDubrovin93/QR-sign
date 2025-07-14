import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import TaskCard from "../components/TaskCard";
import type { RootState } from "../store/rootReducer";
import { createQRCodes } from "../api/task/create-qr-codes";
import { downloadFile, init } from '@telegram-apps/sdk';


const AdminTasks = () => {
  const telegramData = getTelegramData();
  const [selectedTaskBoards, setSelectedTaskBoards] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const { data: dataTasks, isLoading: _ } = useSelector(
    (state: RootState) => state.entities.tasksBoard
  );

  const handleLongPress = (taskBoardId: number) => {
    setSelectionMode(true);
    const newSelected = new Set(selectedTaskBoards);
    if (newSelected.has(taskBoardId)) {
      newSelected.delete(taskBoardId);
    } else {
      newSelected.add(taskBoardId);
    }
    setSelectedTaskBoards(newSelected);
  };

  const handleTaskBoardSelect = (taskBoardId: number) => {
    if (!selectionMode) return;
    
    const newSelected = new Set(selectedTaskBoards);
    if (newSelected.has(taskBoardId)) {
      newSelected.delete(taskBoardId);
    } else {
      newSelected.add(taskBoardId);
    }
    setSelectedTaskBoards(newSelected);
    
    // Если больше нет выделенных элементов, выходим из режима выделения
    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const handleGenerateQR = async () => {
    if (selectedTaskBoards.size === 0) return;

    setIsGeneratingQR(true);
    try {
      const payload = {
        task_board_ids: Array.from(selectedTaskBoards)
      };
      
      const blob = await createQRCodes(payload);
      const url = window.URL.createObjectURL(blob);
      
      try {
        // Пытаемся инициализировать SDK и использовать downloadFile
        init();
        downloadFile(url, 'qr_codes.pdf');
      } catch (error) {
        // Fallback: обычное скачивание через DOM
        console.log('SDK downloadFile failed, using fallback:', error);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr_codes.pdf';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      setSelectedTaskBoards(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Ошибка генерации QR кодов:', error);
      alert(`Ошибка при генерации QR кодов: ${error}`);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedTaskBoards(new Set());
    setSelectionMode(false);
  };

  //   if (isLoadingTasks) {
  //     return (
  //       <div className="flex items-center justify-center min-h-screen">
  //         <Loading size={24} color={"#2a90ff"} />
  //       </div>
  //     );
  //   }
  return (
    <div onClick={selectionMode ? handleCancelSelection : undefined}>
      {dataTasks?.map((task) => {
        return (
          <TaskCard 
            key={task.id} 
            data={task} 
            path={`/admin-taskboard/${task.id}`}
            isSelected={selectedTaskBoards.has(task.id)}
            selectionMode={selectionMode}
            onLongPress={handleLongPress}
            onSelect={handleTaskBoardSelect}
          />
        );
      })}
      
      {selectionMode && (
        <div 
          className="fixed bottom-0 left-0 right-0 p-4 flex gap-2 z-51"
          style={{ 
            backgroundColor: telegramData?.themeParams.bg_color || '#ffffff',
            borderTop: `1px solid ${telegramData?.themeParams.section_separator_color || '#e5e5e5'}`
          }}
        >
          <Button 
            mode="bezeled" 
            onClick={handleCancelSelection}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button 
            mode="filled" 
            onClick={handleGenerateQR}
            disabled={selectedTaskBoards.size === 0 || isGeneratingQR}
            className="flex-1"
            style={{
              backgroundColor: selectedTaskBoards.size > 0 && !isGeneratingQR 
                ? telegramData?.themeParams.button_color || '#2a90ff'
                : undefined
            }}
          >
            {isGeneratingQR 
              ? 'Генерация...' 
              : `Сохранить ${selectedTaskBoards.size > 0 ? `(${selectedTaskBoards.size})` : ''}`
            }
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
