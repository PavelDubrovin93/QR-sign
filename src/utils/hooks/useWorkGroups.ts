import { useState, useCallback } from 'react';
import { getWorkGroupsSelect } from '../../api/work_group/get-work_groupsSelect';
import { useApiWithRetry } from './useApiWithRetry';
import type { WorkGroup } from '../../@types/group';

export const useWorkGroups = () => {
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [isLoadingWorkGroups, setIsLoadingWorkGroups] = useState(false);
  const { retryApiCall } = useApiWithRetry();

  const fetchWorkGroups = useCallback(async (
    companyId: string | number,
    setModalSelectedWorkGroupId?: (value: string | number) => void
  ) => {
    if (!companyId) {
      setWorkGroups([]);
      setModalSelectedWorkGroupId?.("");
      return;
    }

    setIsLoadingWorkGroups(true);
    try {
      const res = await retryApiCall(() => getWorkGroupsSelect(String(companyId)));
      
      if (res.data) {
        setWorkGroups(res.data);
        if (setModalSelectedWorkGroupId) {
          if (res.data.length > 0) {
            setModalSelectedWorkGroupId(res.data[0].id || "");
          } else {
            setModalSelectedWorkGroupId("");
          }
        }
      } else {
        setWorkGroups([]);
      }
    } catch (e: any) {
      console.error(
        `Ошибка загрузки рабочих групп для компании ${companyId}:`,
        e
      );
      
      const isConnectionError = 
        e?.response?.data?.message?.includes('ConnectionDoesNotExistError') ||
        e?.response?.data?.message?.includes('connection was closed') ||
        e?.response?.data?.error === 'Internal Server Error';
      
      if (isConnectionError) {
        console.log("Не удалось загрузить рабочие группы после нескольких попыток. Проблемы с подключением к серверу.");
      }
      
      setWorkGroups([]);
      setModalSelectedWorkGroupId?.("");
    } finally {
      setIsLoadingWorkGroups(false);
    }
  }, [retryApiCall]);

  const getWorkGroupName = useCallback((workGroupId: number) => {
    const workGroup = workGroups.find(wg => wg.id === workGroupId);
    return workGroup?.title || '';
  }, [workGroups]);

  return {
    workGroups,
    isLoadingWorkGroups,
    fetchWorkGroups,
    getWorkGroupName,
    setWorkGroups,
  };
}; 