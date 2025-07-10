import "@telegram-apps/telegram-ui/dist/styles.css";

import RegistrationSteps from './components/RegistrationSteps.tsx';
import TaskCard from "./components/TaskCardOpened.tsx";
import Header from "./components/Header.tsx";
import headerNavigationConfig from "./configs/header.nav.config.ts";
import { Button, Input, Modal } from "@telegram-apps/telegram-ui";

import AdminLayout from "./components/layouts/AdminLayout.tsx";
import AdminPage from "./pages/adminPage.tsx";
import AdminTaskboardPage from "./pages/adminTaskboardPage.tsx";

import UserLayout from "./components/layouts/UserLayout.tsx";

import MainPage from "./pages/mainPage.tsx";
import ScanPage from "./pages/scanPage.tsx";
import ProfilePage from "./pages/profilePage.tsx";
import TaskboardPage from "./pages/taskboardPage.tsx";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getUserProfile } from "./api/user/get-userProfile.ts";
import {
  setIsLoadingUserProfile,
  setUserProfile,
} from "./store/slices/entities/user/userSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { sessionToken } from "./utils/cookie.ts";
import type { RootState } from "./store/rootReducer.ts";
import Loading from "./components/Loading.tsx";
import { Roles } from "./@types/role.ts";
import NotApprovedLayout from "./components/layouts/NotApprovedLayout.tsx";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { checkUserExists } from "./api/user/check-user-exists.ts";
import type { UserCompanies } from "./@types/user.ts";
import { getCompaniesByClient } from "./api/company/get-companies-byClient.ts";
import { setUserCompanies } from "./store/slices/entities/user_companies/user_companiesSlice.ts";
import { createUserCompany } from "./api/company/update-user-company.ts";


function App() {
  const dispatch = useDispatch();
  const webapp = window.Telegram?.WebApp;
  const telegramData = getTelegramData();
  console.log("ci/cd check check");
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [notApprovedCompanies, setNotApprovedCompanies] = useState<UserCompanies[]>([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const hasAttemptedRoleFetch = useRef(false);

  const isLoadingProfileUser = useSelector(
    (state: RootState) => state.entities.user.isLoading
  );
  
  const userProfile = useSelector(
    (state: RootState) => state.entities.user
  );
  


  if (webapp) {
    webapp.setBackgroundColor(webapp.themeParams.secondary_bg_color);
  }

  const token_mock = webapp?.initDataUnsafe?.user?.id || 4444444444; //webapp?.initDataUnsafe?.user?.id || 4444444444;

  const fetchUserRoleByUserId = async (userId: number | null, defaultCompanyId: number | null) => {
    if (!userId) {
      setUserRole(Roles.NOT_APPROVED);
      return;
    }

    try {
      const companiesResponse = await getCompaniesByClient();
      if (companiesResponse.data && companiesResponse.data.length > 0) {
        const companies: UserCompanies[] = companiesResponse.data;
        
        let targetCompany;
        
        if (defaultCompanyId) {
          targetCompany = companies.find(company => company.company_id === defaultCompanyId);
          if (targetCompany && targetCompany.role !== Roles.NOT_APPROVED) {
            setUserRole(targetCompany.role);
            return;
          }
        }
        
        const activeCompany = companies.find(company => company.role !== Roles.NOT_APPROVED);
        
        if (activeCompany) {
          setUserRole(activeCompany.role);
        } else if (companies.length > 0) {
          setUserRole(companies[0].role);
        } else {
          setUserRole(Roles.EMPLOYER);
        }
      } else {
        setUserRole(Roles.NOT_APPROVED);
      }
    } catch (error) {
      console.error("Error fetching user companies:", error);
      setUserRole(Roles.EMPLOYER);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      sessionToken.set(token_mock?.toString() || "");
      // if(webapp?.initDataUnsafe?.user?.id) {
      // sessionToken.set(webapp?.initDataUnsafe?.user?.id.toString());
      // }


      try {
        setIsCheckingUser(true);
        const userExistsResponse = await checkUserExists(token_mock || 0);
        
        if (userExistsResponse.data.is_first_time) {
          setIsFirstTimeUser(true);
          setShowRegistrationModal(true);
          setIsCheckingUser(false);
        } else {
          setIsFirstTimeUser(false);
          try {
            const res = await getUserProfile();
            if (res.data) {
              dispatch(setUserProfile(res.data));
              await fetchUserRoleByUserId(res.data.id, res.data.default_company_choice);
            }
          } catch (e: any) {
            console.error("Error fetching user profile:", e);
          }
        }
      } catch (e: any) {
        console.error("Error checking user existence:", e);
        if (e.code === 'ERR_NETWORK' || e.message.includes('CORS')) {
          console.log("CORS error");
          setIsFirstTimeUser(true);
          setShowRegistrationModal(true);
        } else {
          try {
            const res = await getUserProfile();
            if (res.data) {
              dispatch(setUserProfile(res.data));
              setIsFirstTimeUser(false);
              await fetchUserRoleByUserId(res.data.id, res.data.default_company_choice);
            }
          } catch (profileError: any) {
            console.error("Error fetching user profile:", profileError);
            setIsFirstTimeUser(true);
            setShowRegistrationModal(true);
          }
        }
      } finally {
        setIsCheckingUser(false);
        dispatch(setIsLoadingUserProfile(false));
      }
    };

    initializeApp();
  }, [webapp?.initDataUnsafe, dispatch]);

  useEffect(() => {
    if (userProfile && userProfile.id && !userRole && !hasAttemptedRoleFetch.current) {
      hasAttemptedRoleFetch.current = true;
      fetchUserRoleByUserId(userProfile.id, userProfile.default_company_choice);
    }
  }, [userProfile?.id, userRole, userProfile?.default_company_choice]);

  useEffect(() => {
    if (userRole === Roles.NOT_APPROVED) {
      const fetchNotApprovedCompanies = async () => {
        try {
          const companiesResponse = await getCompaniesByClient();
          if (companiesResponse.data) {
            const notApproved = companiesResponse.data.filter(
              (company: UserCompanies) => company.role === Roles.NOT_APPROVED
            );
            setNotApprovedCompanies(notApproved);
            console.log(notApproved);
            
            const approved = companiesResponse.data.find(
              (company: UserCompanies) => company.role !== Roles.NOT_APPROVED
            );

            console.log(companiesResponse.data, approved);

            if (approved) {
              setUserRole(approved.role);
            }
          }
        } catch (error) {
          console.error("Error fetching not approved companies:", error);
        }
      };
      
      fetchNotApprovedCompanies();
      
      const interval = setInterval(() => {
        fetchNotApprovedCompanies();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const handleCancelRegistration = () => {
    dispatch(setUserProfile({
      id: null,
      user_id: null,
      default_company_choice: null,
      default_color: "",
      current_role: "",
      name_for_admin: "",
    }));
    
    dispatch(setUserCompanies([]));
    
    sessionToken.remove();
    
    setUserRole("");
    setIsFirstTimeUser(true);
    setShowRegistrationModal(true);
    setIsCheckingUser(false);
    hasAttemptedRoleFetch.current = false;
  };

  const handleSubmitApplication = async () => {
    if (!companyCode.trim() || !userProfile?.id) return;
    
    setIsSubmittingApplication(true);
    try {
      const userCompanyData = {
        user_id: userProfile.id,
        company_id: parseInt(companyCode),
        workgroup_id: null,
        role: Roles.NOT_APPROVED,
      };

      await createUserCompany(userCompanyData);
      
      // Reset form
      setCompanyCode("");
      setShowApplicationModal(false);
      
      // Refresh companies list to show new application
      const companiesResponse = await getCompaniesByClient();
      if (companiesResponse.data) {
        const notApproved = companiesResponse.data.filter(
          (company: UserCompanies) => company.role === Roles.NOT_APPROVED
        );
        setNotApprovedCompanies(notApproved);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      // Could add error toast here
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationModal(false);
    setIsFirstTimeUser(false);
    
    sessionToken.set(token_mock?.toString() || "");
    
    setTimeout(() => {
      getUserProfile().then(async (res) => {
        if (res.data) {
          dispatch(setUserProfile(res.data));
          await fetchUserRoleByUserId(res.data.id, res.data.default_company_choice);
        }
      }).catch((e) => {
        console.error("Error", e);
      });
    }, 2000);
  };


  if (isLoadingProfileUser || isCheckingUser || (!isFirstTimeUser && !userRole)) {  
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
        <Loading size={36} color={"#2a90ff"} />
        <span className="ml-3 text-sm" style={{color: telegramData?.themeParams?.text_color }}>
          {isCheckingUser ? "Проверяем пользователя..." : "Загрузка..."}
        </span>
        </div>
      </div>
    );
  }

  const renderLayout = () => {
    switch (userRole) {
      case Roles.ADMIN:
        return (
          <AdminLayout>
            <div className="p-4">
              <Header nav={headerNavigationConfig.admin} />
            </div>
            <Routes>
              <Route index path="/" element={<AdminPage />} />
              <Route path="/admin-taskboard" element={<AdminTaskboardPage />} />
              <Route path="/admin-taskboard/:id" element={<TaskCard editMode={true} />} />
            </Routes>
          </AdminLayout>
        );
      case Roles.EMPLOYER:
        return (
          <UserLayout>
            <div className="p-4">
              <Header nav={headerNavigationConfig.user} />
            </div>
            <Routes>
              <Route index path="/" element={<MainPage />} />
              <Route path="/taskboard/:id" element={<TaskboardPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </UserLayout>
        );
      case Roles.NOT_APPROVED:
        return (
          <NotApprovedLayout>
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <Modal
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
      >
        <div className="p-4 pt-0">
          <Input
            placeholder="Введите код компании"
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            className="mt-5"
          />
          <div className="flex gap-2 p-4 pt-0">
            <Button
              mode="outline"
              onClick={() => {
                setShowApplicationModal(false);
                setCompanyCode("");
              }}
              className="flex-1"
              style={{
                borderColor: telegramData?.themeParams.hint_color,
                color: telegramData?.themeParams.hint_color,
                borderRadius: '8px',
              }}
            >
              Отмена
            </Button>

            <Button
              mode="filled"
              onClick={handleSubmitApplication}
              disabled={!companyCode.trim() || isSubmittingApplication}
              className="flex-1"
              style={{
                backgroundColor: telegramData?.themeParams.button_color,
                color: telegramData?.themeParams.button_text_color,
                borderRadius: '8px',
              }}
            >
              {isSubmittingApplication ? "Отправляется..." : "Отправить"}
            </Button>

          </div>
        </div>
      </Modal>
              <p
                style={{
                  color: telegramData?.themeParams.text_color,
                }}
                className="text-sm text-center mb-6"
              >
                Сообщите администратору о своем вступлении
              </p>

              {notApprovedCompanies.length > 0 && (
                <div className="w-full max-w-sm mb-6">
                  
                    {notApprovedCompanies.map((company) => (
                      <div
                        key={company.company_id}
                        className="px-3 py-1 rounded-lg border"
                        style={{
                          borderRadius: '10px',
                          borderWidth: '1px', 
                          borderColor: telegramData?.themeParams.button_color,
                          backgroundColor: telegramData?.themeParams.section_bg_color,
                          color: telegramData?.themeParams.text_color,
                        }}
                      >
                        <div className="flex flex-row justify-between p-2 rounded-lg items-center">
                          <span
                            className="font-medium text-sm"
                          >
                            {company.company_name}
                          </span>
                        
                          <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                            Не подтвержден
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

              )}

              <div className="w-full max-w-sm mb-4">
                <Button
                  mode="bezeled"
                  onClick={() => setShowApplicationModal(true)}
                  className="w-full"
                  style={{
                    backgroundColor: telegramData?.themeParams.button_color,
                    color: telegramData?.themeParams.button_text_color,
                    borderRadius: '10px',
                  }}
                >
                  Добавить заявку
                </Button>
              </div>
              
              <Button
                mode="outline"
                onClick={handleCancelRegistration}
                className="w-full max-w-xs"
                style={{
                  borderColor: '#ff4757',
                  color: '#ff4757',
                  borderRadius: '10px',
                  borderWidth: '1px',
                }}
              >
                Отмена  
              </Button>
            </div>
          </NotApprovedLayout>
        );
      default:
        null;
    }
  };

  return (
    <BrowserRouter>
      {renderLayout()}
      <RegistrationSteps 
        showModal={showRegistrationModal}
        onClose={handleRegistrationComplete}
      />
    </BrowserRouter>
  );
}

export default App;
