import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getCompaniesByClient } from '../../api/company/get-companies-byClient';
import { setUserCompanies, setIsLoadingCompanies } from '../../store/slices/entities/user_companies/user_companiesSlice';
import { useApiWithRetry } from './useApiWithRetry';
import { getSelectedCompany, setSelectedCompany } from '../selectedCompany';
import type { UserCompanies } from '../../@types/user';

export const useCompanyData = () => {
  const dispatch = useDispatch();
  const { retryApiCall } = useApiWithRetry();

  const fetchCompanies = useCallback(async (
    setSelectedValue?: (value: string | number) => void,
    setModalSelectedCompanyId?: (value: string | number) => void
  ) => {
    dispatch(setIsLoadingCompanies(true));
    
    try {
      const res = await retryApiCall(() => getCompaniesByClient());
      
      if (res.data) {
        dispatch(setUserCompanies(res.data));
        
        // Логика выбора компании
        if (setSelectedValue) {
          const savedCompanyId = getSelectedCompany();
          const validSavedCompany = savedCompanyId && res.data.find((c: UserCompanies) => 
            String(c.company_id) === savedCompanyId
          );
          
          if (validSavedCompany) {
            setSelectedValue(savedCompanyId);
            setModalSelectedCompanyId?.(savedCompanyId);
          } else if (res.data.length > 0) {
            const firstCompanyId = res.data[0].company_id || "";
            setSelectedValue(firstCompanyId);
            setModalSelectedCompanyId?.(firstCompanyId);
            setSelectedCompany(firstCompanyId);
          }
        }
      }
    } catch (e: any) {
      console.error("Ошибка загрузки компаний:", e);
      
      const isConnectionError = 
        e?.response?.data?.message?.includes('ConnectionDoesNotExistError') ||
        e?.response?.data?.message?.includes('connection was closed') ||
        e?.response?.data?.error === 'Internal Server Error';
      
      if (isConnectionError) {
        console.log("Не удалось загрузить компании после нескольких попыток. Проблемы с подключением к серверу.");
      }
    } finally {
      dispatch(setIsLoadingCompanies(false));
    }
  }, [dispatch, retryApiCall]);

  return {
    fetchCompanies,
  };
}; 