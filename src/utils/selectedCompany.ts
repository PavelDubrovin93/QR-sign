const SELECTED_COMPANY_KEY = 'selectedCompanyId';

export const getSelectedCompany = (): string | null => {
  try {
    return localStorage.getItem(SELECTED_COMPANY_KEY);
  } catch (error) {
    console.warn('Failed to get selected company from localStorage:', error);
    return null;
  }
};

export const setSelectedCompany = (companyId: string | number): void => {
  try {
    localStorage.setItem(SELECTED_COMPANY_KEY, String(companyId));
  } catch (error) {
    console.warn('Failed to save selected company to localStorage:', error);
  }
};

export const clearSelectedCompany = (): void => {
  try {
    localStorage.removeItem(SELECTED_COMPANY_KEY);
  } catch (error) {
    console.warn('Failed to clear selected company from localStorage:', error);
  }
}; 