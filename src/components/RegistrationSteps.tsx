import { useState, useEffect, useRef } from "react";
import { Button, Input, Modal, Radio } from "@telegram-apps/telegram-ui";
import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/slices/entities/user/userSlice";
import { registerUserCold, registerUserHot } from "../api/user/register-user";
import { createCompany } from "../api/company/create-company";

interface RegistrationStepsProps {
  showModal?: boolean;
  onClose?: () => void;
}

const RegistrationSteps = ({ 
  showModal = false,
  onClose
}: RegistrationStepsProps) => {
  const dispatch = useDispatch();
  const telegramData = getTelegramData();
  const webapp = window.Telegram?.WebApp;


  const [isModalOpen, setIsModalOpen] = useState(showModal);
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [companyChoice, setCompanyChoice] = useState<"join" | "create" | "">("join");
  const [companyCode, setCompanyCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    companyChoice: false,
    companyCode: false,
    companyName: false,
    api: "",
  });
  
  const [modalMinHeight, setModalMinHeight] = useState('auto');
  const lastViewportHeight = useRef(0);

  useEffect(() => {
    if (webapp) {
      lastViewportHeight.current = webapp.viewportHeight;

      const initialStableHeight = webapp.viewportStableHeight;
      setModalMinHeight(`${initialStableHeight * 0.9}px`);

      const handleViewportChanged = () => {
        const currentHeight = webapp.viewportHeight;
        const stableHeight = webapp.viewportStableHeight;
        setModalMinHeight(`${stableHeight * 0.9}px`);

        if (currentHeight > lastViewportHeight.current) {
          setTimeout(() => {
            webapp.ready();
          }, 0);
          setTimeout(() => {
            webapp.expand();
          }, 0);
        }
        lastViewportHeight.current = currentHeight;
      };

      webapp.onEvent('viewportChanged', handleViewportChanged);
      return () => {
        webapp.offEvent('viewportChanged', handleViewportChanged);
      };
    }
  }, [webapp]);

  useEffect(() => {
    setIsModalOpen(showModal);
  }, [showModal]);

  const handleCompanyChoiceSelect = (choice: "join" | "create") => {
    setCompanyChoice(choice);
    setErrors(prev => ({ ...prev, companyChoice: false, api: "" }));
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!userName.trim()) {
        setErrors(prev => ({ ...prev, name: true }));
        return;
      }
      setCurrentStep(2);
    } else {
      handleCompleteRegistration();
    }
  };

  const handleCompleteRegistration = async () => {
    if (companyChoice === "join" && !companyCode.trim()) {
      setErrors(prev => ({ ...prev, companyCode: true }));
      return;
    }
    
    if (companyChoice === "create" && !companyName.trim()) {
      setErrors(prev => ({ ...prev, companyName: true }));
      return;
    }

    if (!companyChoice) {
      setErrors(prev => ({ ...prev, companyChoice: true }));
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, api: "" }));

    try {
      const telegramUserId = webapp?.initDataUnsafe?.user?.id || 4444444444;
      const telegramPhotoUrl = "";
      
      if (!telegramUserId) {
        throw new Error("Telegram user ID not found");
      }

      const registrationData = {
        tg_id: telegramUserId,
        name: userName.trim(),
        photo_url: telegramPhotoUrl || "",
      };

      let userData;

      if (companyChoice === "create") {
        const registrationResponse = await registerUserCold(registrationData);
        
        if (registrationResponse.data) {
          userData = {
            id: registrationResponse.data.id,
            user_id: registrationResponse.data.id,
            default_company_choice: null as number | null,
            default_color: "#2a90ff",
            current_role: "employer",
            name_for_admin: userName.trim(),
          };

          const companyData = {
            title: companyName.trim(),
            description: `Компания создана пользователем ${userName.trim()}`,
            subscription_type: "basic",
            qr_code: "222",
          };

          const companyResponse = await createCompany(companyData);
          
          if (companyResponse.data) {
            userData.current_role = "admin";
            userData.default_company_choice = companyResponse.data.id as number;
          }
        }
      } else if (companyChoice === "join") {
        const companyId = parseInt(companyCode.trim());
        
        if (isNaN(companyId)) {
          throw new Error("Код компании должен быть числом.");
        }
        
        try {
          const hotRegistrationResponse = await registerUserHot(companyId, registrationData);
          
          if (hotRegistrationResponse.data) {
            userData = {
              id: hotRegistrationResponse.data.id,
              user_id: hotRegistrationResponse.data.id,
              default_company_choice: companyId,
              default_color: "#2a90ff",
              current_role: "pending",
              name_for_admin: userName.trim(),
            };
          }
        } catch (companyError: any) {
          throw new Error("Компания с таким кодом не найдена. Проверьте правильность кода.");
        }
      }

      if (userData) {
        dispatch(setUserProfile(userData));
        setIsModalOpen(false);
        onClose?.();
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      setErrors(prev => ({ 
        ...prev, 
        api: error?.message || error?.response?.data?.message || "Ошибка при регистрации. Попробуйте еще раз." 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setErrors(prev => ({ ...prev, api: "" }));
    }
  };

  const renderStep1 = () => (
    <div>
      <h3 className="text-center text-lg font-bold mb-6">
        Укажите ваше имя
      </h3>

      <Input
        placeholder="Введите ваше имя"
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);
          setErrors(prev => ({ ...prev, name: false, api: "" }));
        }}
        status={errors.name ? "error" : "focused"}
        className="mb-4"
      />

      {errors.name && (
        <p className="text-red-500 text-sm mb-4 text-center">
          Пожалуйста, введите ваше имя
        </p>
      )}

      {errors.api && (
        <p className="text-red-500 text-sm mb-4 text-center">
          {errors.api}
        </p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-center text-lg font-bold mb-6">
        Компания
      </h3>

      <div className="space-y-3">
        <div
          className={`
              flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200
              ${errors.companyChoice && companyChoice !== "join" ? 'bg-red-50 ring-1 ring-red-500' : 'bg-gray-100 dark:bg-gray-700'}
              ${companyChoice === "join" ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-500' : ''}
          `}
          onClick={() => handleCompanyChoiceSelect("join")}
        >
          <Radio
            name="companyChoice"
            value="join"
            checked={companyChoice === "join"}
            className="mr-5"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Присоединиться к компании</p>
            <p className="text-sm text-gray-500">Введите числовой код компании для присоединения</p>
          </div>
        </div>

        <div
          className={`
              flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200
              ${errors.companyChoice && companyChoice !== "create" ? 'bg-red-50 ring-1 ring-red-500' : 'bg-gray-100 dark:bg-gray-700'}
              ${companyChoice === "create" ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-500' : ''}
          `}
          onClick={() => handleCompanyChoiceSelect("create")}
        >
          <Radio
            name="companyChoice"
            value="create"
            checked={companyChoice === "create"}
            className="mr-5"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Создать свою компанию</p>
            <p className="text-sm text-gray-500">Создайте новую компанию и управляйте командой</p>
          </div>
        </div>
      </div>

      {errors.companyChoice && (
        <p className="text-red-500 text-sm mt-2 text-center">
          Пожалуйста, выберите вариант
        </p>
      )}

      {/* Company code input for joining */}
      {companyChoice === "join" && (
        <div className="mt-4">
          <Input
            placeholder="Код компании (например: 123)"
            value={companyCode}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers, its good rn
              setCompanyCode(value);
              setErrors(prev => ({ ...prev, companyCode: false, api: "" }));
            }}
            status={errors.companyCode ? "error" : "focused"}
            className="mb-2"
          />
          {errors.companyCode && (
            <p className="text-red-500 text-sm text-center">
              Пожалуйста, введите числовой код компании
            </p>
          )}
        </div>
      )}

      {/* Company name input for creating */}
      {companyChoice === "create" && (
        <div className="mt-4">
          <Input
            placeholder="Название компании"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              setErrors(prev => ({ ...prev, companyName: false, api: "" }));
            }}
            status={errors.companyName ? "error" : "focused"}
            className="mb-2"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm text-center">
              Пожалуйста, введите название компании
            </p>
          )}
        </div>
      )}

      {errors.api && (
        <p className="text-red-500 text-sm mb-4 text-center">
          {errors.api}
        </p>
      )}
    </div>
  );

  const renderStepButtons = () => (
    <div className="flex items-center justify-between mt-6">
      {currentStep === 2 && (
        <Button
          mode="bezeled"
          onClick={handlePreviousStep}
          disabled={isLoading}
          className="mr-2"
        >
          Назад
        </Button>
      )}
      
      <Button
        stretched={currentStep === 1}
        onClick={handleNextStep}
        disabled={isLoading}
        className={currentStep === 2 ? "ml-2" : ""}
      >
        {isLoading ? "Сохранение..." : (currentStep === 1 ? "Далее" : "Завершить")}
      </Button>
    </div>
  );

  return (
    <>
      {/* Blurred backdrop overlay */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 998,
            transition: "all 0.3s ease-in-out",
            pointerEvents: "none",
          }}
        />
      )}
      
      <Modal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        dismissible={false}
        modal={true}
        preventScrollRestoration={true}
        style={{ zIndex: 1000, minHeight: modalMinHeight, }}
      >
        <div
          style={{
            
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            backgroundColor: telegramData?.themeParams?.bg_color,
            position: "relative",
            zIndex: 1001,
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
            filter: "none",
          }}
          className="py-6 px-4"
        >

        <div className="mb-4">
          <div className="flex justify-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep >= 1 ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full ${
                currentStep >= 2 ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Шаг {currentStep} из 2
          </p>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {renderStepButtons()}
      </div>
    </Modal>
    </>
  );
};

export default RegistrationSteps;

// import React, { useState, useEffect, useRef } from "react";
// import { Button, Input, Modal, Radio } from "@telegram-apps/telegram-ui";
// import { getTelegramData } from "@telegram-apps/telegram-ui/dist/helpers/telegram";
// import { useDispatch } from "react-redux";
// import { setUserProfile } from "../store/slices/entities/user/userSlice";
// import { registerUserCold, registerUserHot } from "../api/user/register-user";
// import { createCompany } from "../api/company/create-company";

// interface RegistrationStepsProps {
//   showModal?: boolean; // Это свойство теперь будет управлять открытием Изначальной модалки
//   onClose?: () => void;
// }

// const RegistrationSteps = ({
//   showModal = false,
//   onClose
// }: RegistrationStepsProps) => {
//   const dispatch = useDispatch();
//   const telegramData = getTelegramData();
//   const webapp = window.Telegram?.WebApp;

//   // --- СОСТОЯНИЯ ДЛЯ УПРАВЛЕНИЯ ДВУМЯ МОДАЛКАМИ ---
//   const [isModal1Open, setIsModal1Open] = useState(showModal); // Для первого шага
//   const [isModal2Open, setIsModal2Open] = useState(false);     // Для второго шага
//   // -----------------------------------------------------

//   const [userName, setUserName] = useState("");
//   const [companyChoice, setCompanyChoice] = useState<"join" | "create" | "">("join");
//   const [companyCode, setCompanyCode] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState({
//     name: false,
//     companyChoice: false,
//     companyCode: false,
//     companyName: false,
//     api: "",
//   });

//   const lastViewportHeight = useRef(0);
//   const [modalCurrentMaxHeight, setModalCurrentMaxHeight] = useState<number | 'auto'>('auto');


//   // Синхронизируем начальное состояние из props
//   useEffect(() => {
//     setIsModal1Open(showModal);
//     if (!showModal) {
//       setIsModal2Open(false); // Закрываем вторую, если первая закрывается извне
//       // При закрытии модалок извне, сбрасываем все состояния для чистого старта
//       setUserName("");
//       setCompanyChoice("join");
//       setCompanyCode("");
//       setCompanyName("");
//       setErrors({
//         name: false,
//         companyChoice: false,
//         companyCode: false,
//         companyName: false,
//         api: "",
//       });
//       setIsLoading(false);
//     }
//   }, [showModal]);

//   // Эффект для управления высотой WebView и модалки
//   useEffect(() => {
//     if (webapp) {
//       // Инициализируем lastViewportHeight при первом запуске
//       lastViewportHeight.current = webapp.viewportHeight;

//       // Устанавливаем начальную maxHeight на основе stableHeight (допустим 95% от stableHeight)
//       // Это обеспечит, что модалка всегда будет ограничена размером видимой области без клавиатуры.
//       setModalCurrentMaxHeight(webapp.viewportStableHeight * 0.95);

//       const handleViewportChanged = () => {
//         const currentHeight = webapp.viewportHeight;
//         const stableHeight = webapp.viewportStableHeight;

//         // Всегда обновляем maxHeight модалки, опираясь на stableHeight
//         setModalCurrentMaxHeight(stableHeight * 0.95);

//         // Если текущая высота вьюпорта стала больше, чем была в прошлый раз,
//         // это означает, что клавиатура, вероятно, скрылась.
//         if (currentHeight > lastViewportHeight.current) {
//           // Откладываем вызов ready() и expand() на следующий тик Event Loop,
//           // чтобы дать WebView время на стабилизацию размеров.
//           setTimeout(() => {
//             webapp.ready();
//             webapp.expand();
//           }, 0); 
//         } else if (currentHeight < lastViewportHeight.current) {
//           // Клавиатура появилась. Вызываем ready() для перерасчета, но не expand(),
//           // чтобы WebView мог сжаться под клавиатуру.
//           setTimeout(() => {
//             webapp.ready();
//           }, 0);
//         }
//         // Обновляем последнюю высоту вьюпорта для следующего изменения
//         lastViewportHeight.current = currentHeight;
//       };

//       webapp.onEvent('viewportChanged', handleViewportChanged);
//       return () => {
//         webapp.offEvent('viewportChanged', handleViewportChanged);
//       };
//     }
//   }, [webapp]);

//   // Вызываем webapp.ready() и webapp.expand() при открытии любой модалки
//   // или при переключении между ними
//   useEffect(() => {
//     if (webapp) {
//       // Небольшая задержка, чтобы React успел обновить DOM перед тем, как Telegram WebApp
//       // пересчитает размеры.
//       const timer = setTimeout(() => {
//         if (isModal1Open || isModal2Open) {
//           webapp.ready();
//           webapp.expand();
//         }
//       }, 50); 
//       return () => clearTimeout(timer);
//     }
//   }, [webapp, isModal1Open, isModal2Open]); // Зависимости от состояния обеих модалок


//   const handleCompanyChoiceSelect = (choice: "join" | "create") => {
//     setCompanyChoice(choice);
//     setErrors(prev => ({ ...prev, companyChoice: false, api: "" }));
//   };

//   // --- ЛОГИКА ПЕРЕХОДА НА СЛЕДУЮЩИЙ ШАГ (ОТКРЫВАЕМ ВТОРУЮ МОДАЛКУ) ---
//   const handleNextStep1To2 = async () => {
//     if (!userName.trim()) {
//       setErrors(prev => ({ ...prev, name: true }));
//       return;
//     }
//     setErrors(prev => ({ ...prev, name: false, api: "" })); // Очищаем ошибку имени

//     setIsModal1Open(false); // Закрываем первую модалку
//     setIsModal2Open(true);  // Открываем вторую модалку
//   };

//   // --- ЛОГИКА ЗАВЕРШЕНИЯ РЕГИСТРАЦИИ (ВТОРАЯ МОДАЛКА) ---
//   const handleCompleteRegistration = async () => {
//     if (companyChoice === "join" && !companyCode.trim()) {
//       setErrors(prev => ({ ...prev, companyCode: true }));
//       return;
//     }

//     if (companyChoice === "create" && !companyName.trim()) {
//       setErrors(prev => ({ ...prev, companyName: true }));
//       return;
//     }

//     if (!companyChoice) { // Это условие менее вероятно, так как "join" дефолтный
//       setErrors(prev => ({ ...prev, companyChoice: true }));
//       return;
//     }

//     setIsLoading(true);
//     setErrors(prev => ({ ...prev, api: "" }));

//     try {
//       const telegramUserId = webapp?.initDataUnsafe?.user?.id || 4444444444; // Fallback для тестирования
//       const telegramPhotoUrl = ""; // Можно добавить логику получения фото

//       if (!telegramUserId) {
//         throw new Error("Telegram user ID not found");
//       }

//       const registrationData = {
//         tg_id: telegramUserId,
//         name: userName.trim(),
//         photo_url: telegramPhotoUrl || "",
//       };

//       let userData;

//       if (companyChoice === "create") {
//         const registrationResponse = await registerUserCold(registrationData);

//         if (registrationResponse.data) {
//           userData = {
//             id: registrationResponse.data.id,
//             user_id: registrationResponse.data.id,
//             default_company_choice: null as number | null,
//             default_color: "#2a90ff",
//             current_role: "employer",
//             name_for_admin: userName.trim(),
//           };

//           const companyData = {
//             title: companyName.trim(),
//             description: `Компания создана пользователем ${userName.trim()}`,
//             subscription_type: "basic",
//             qr_code: "222",
//           };

//           const companyResponse = await createCompany(companyData);

//           if (companyResponse.data) {
//             userData.current_role = "admin";
//             userData.default_company_choice = companyResponse.data.id as number;
//           }
//         }
//       } else if (companyChoice === "join") {
//         const companyId = parseInt(companyCode.trim());

//         if (isNaN(companyId)) {
//           throw new Error("Код компании должен быть числом.");
//         }

//         try {
//           const hotRegistrationResponse = await registerUserHot(companyId, registrationData);

//           if (hotRegistrationResponse.data) {
//             userData = {
//               id: hotRegistrationResponse.data.id,
//               user_id: hotRegistrationResponse.data.id,
//               default_company_choice: companyId,
//               default_color: "#2a90ff",
//               current_role: "pending",
//               name_for_admin: userName.trim(),
//             };
//           }
//         } catch (companyError: any) {
//           throw new Error("Компания с таким кодом не найдена. Проверьте правильность кода.");
//         }
//       }

//       if (userData) {
//         dispatch(setUserProfile(userData));
//         setIsModal2Open(false); // Закрываем вторую модалку
//         onClose?.(); // Вызываем внешний onClose
//       }
//     } catch (error: any) {
//       console.error("Registration failed:", error);

//       setErrors(prev => ({
//         ...prev,
//         api: error?.message || error?.response?.data?.message || "Ошибка при регистрации. Попробуйте еще раз."
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- ЛОГИКА КНОПКИ "НАЗАД" (ИЗ ВТОРОЙ МОДАЛКИ В ПЕРВУЮ) ---
//   const handlePreviousStep2To1 = () => {
//     setIsModal2Open(false); // Закрываем вторую модалку
//     setIsModal1Open(true);  // Открываем первую модалку
//     setErrors(prev => ({ ...prev, api: "" })); // Очищаем ошибки API
//   };

//   // Функции рендеринга шагов (почти без изменений, но теперь они внутри отдельных модалок)
//   const renderStep1Content = () => (
//     <>
//       <div className="mb-4">
//         <div className="flex justify-center space-x-2">
//           <div className="w-3 h-3 rounded-full bg-blue-500" />
//           <div className="w-3 h-3 rounded-full bg-gray-300" />
//         </div>
//         <p className="text-center text-sm text-gray-500 mt-2">
//           Шаг 1 из 2
//         </p>
//       </div>

//       <div>
//         <h3 className="text-center text-lg font-bold mb-6">
//           Укажите ваше имя
//         </h3>

//         <Input
//           placeholder="Введите ваше имя"
//           value={userName}
//           onChange={(e) => {
//             setUserName(e.target.value);
//             setErrors(prev => ({ ...prev, name: false, api: "" }));
//           }}
//           status={errors.name ? "error" : "focused"}
//           className="mb-4"
//         />

//         {errors.name && (
//           <p className="text-red-500 text-sm mb-4 text-center">
//             Пожалуйста, введите ваше имя
//           </p>
//         )}

//         {errors.api && (
//           <p className="text-red-500 text-sm mb-4 text-center">
//             {errors.api}
//           </p>
//         )}
//       </div>

//       <div className="flex items-center justify-end mt-6"> {/* Только кнопка Далее */}
//         <Button
//           stretched
//           onClick={handleNextStep1To2}
//           disabled={isLoading}
//         >
//           Далее
//         </Button>
//       </div>
//     </>
//   );

//   const renderStep2Content = () => (
//     <>
//       <div className="mb-4">
//         <div className="flex justify-center space-x-2">
//           <div className="w-3 h-3 rounded-full bg-blue-500" />
//           <div className="w-3 h-3 rounded-full bg-blue-500" /> {/* Второй кружок тоже активный */}
//         </div>
//         <p className="text-center text-sm text-gray-500 mt-2">
//           Шаг 2 из 2
//         </p>
//       </div>

//       <div>
//         <h3 className="text-center text-lg font-bold mb-6">
//           Компания
//         </h3>

//         <div className="space-y-3">
//           <div
//             className={`
//               flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200
//               ${errors.companyChoice && companyChoice !== "join" ? 'bg-red-50 ring-1 ring-red-500' : 'bg-gray-100 dark:bg-gray-700'}
//               ${companyChoice === "join" ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-500' : ''}
//             `}
//             onClick={() => handleCompanyChoiceSelect("join")}
//             style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
//           >
//             <Radio
//               name="companyChoice"
//               value="join"
//               checked={companyChoice === "join"}
//               onChange={() => handleCompanyChoiceSelect("join")}
//               className="mr-3"
//             />
//             <div className="flex-1 min-w-0">
//               <p className="font-medium text-gray-900 dark:text-gray-100">Присоединиться к компании</p>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Введите числовой код компании для присоединения</p>
//             </div>
//           </div>

//           <div
//             className={`
//               flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200
//               ${errors.companyChoice && companyChoice !== "create" ? 'bg-red-50 ring-1 ring-red-500' : 'bg-gray-100 dark:bg-gray-700'}
//               ${companyChoice === "create" ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-500' : ''}
//             `}
//             onClick={() => handleCompanyChoiceSelect("create")}
//             style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
//           >
//             <Radio
//               name="companyChoice"
//               value="create"
//               checked={companyChoice === "create"}
//               onChange={() => handleCompanyChoiceSelect("create")}
//               className="mr-3"
//             />
//             <div className="flex-1 min-w-0">
//               <p className="font-medium text-gray-900 dark:text-gray-100">Создать свою компанию</p>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Создайте новую компанию и управляйте командой</p>
//             </div>
//           </div>
//         </div>

//         {errors.companyChoice && (
//           <p className="text-red-500 text-sm mt-2 text-center">
//             Пожалуйста, выберите вариант
//           </p>
//         )}

//         {companyChoice === "join" && (
//           <div className="mt-4">
//             <Input
//               placeholder="Код компании (например: 123)"
//               value={companyCode}
//               onChange={(e) => {
//                 const value = e.target.value.replace(/[^0-9]/g, '');
//                 setCompanyCode(value);
//                 setErrors(prev => ({ ...prev, companyCode: false, api: "" }));
//               }}
//               status={errors.companyCode ? "error" : "focused"}
//               className="mb-2"
//             />
//             {errors.companyCode && (
//               <p className="text-red-500 text-sm text-center">
//                 Пожалуйста, введите числовой код компании
//               </p>
//             )}
//           </div>
//         )}

//         {companyChoice === "create" && (
//           <div className="mt-4">
//             <Input
//               placeholder="Название компании"
//               value={companyName}
//               onChange={(e) => {
//                 setCompanyName(e.target.value);
//                 setErrors(prev => ({ ...prev, companyName: false, api: "" }));
//               }}
//               status={errors.companyName ? "error" : "focused"}
//               className="mb-2"
//             />
//             {errors.companyName && (
//               <p className="text-red-500 text-sm text-center">
//                 Пожалуйста, введите название компании
//               </p>
//             )}
//           </div>
//         )}

//         {errors.api && (
//           <p className="text-red-500 text-sm mb-4 text-center">
//             {errors.api}
//           </p>
//         )}
//       </div>

//       <div className="flex items-center justify-between mt-6">
//         <Button
//           mode="bezeled"
//           stretched
//           onClick={handlePreviousStep2To1}
//           disabled={isLoading}
//           className="mr-2"
//         >
//           Назад
//         </Button>

//         <Button
//           stretched
//           onClick={handleCompleteRegistration}
//           disabled={isLoading}
//           className="ml-2"
//         >
//           {isLoading ? "Сохранение..." : "Завершить"}
//         </Button>
//       </div>
//     </>
//   );

//   const commonModalContentStyle: React.CSSProperties = { // Explicitly define type here
//     borderTopLeftRadius: "15px",
//     borderTopRightRadius: "15px",
//     backgroundColor: telegramData?.themeParams?.bg_color,
//     position: "relative", // This was the problematic line for TS
//     zIndex: 1001,
//     boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
//     filter: "none",
//   };

//   return (
//     <>
//       {/* Задний фон для обеих модалок */}
//       {(isModal1Open || isModal2Open) && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//             backdropFilter: "blur(12px)",
//             WebkitBackdropFilter: "blur(12px)",
//             zIndex: 998,
//             transition: "all 0.3s ease-in-out",
//             pointerEvents: "none",
//           }}
//         />
//       )}

//       {/* --- МОДАЛКА ДЛЯ ШАГА 1 --- */}
//       <Modal
//         open={isModal1Open}
//         onOpenChange={setIsModal1Open}
//         dismissible={false}
//         modal={true}
//         preventScrollRestoration={true}
//         style={{
//           zIndex: 1000,
//           maxHeight: modalCurrentMaxHeight, // Применяем max-height, которую рассчитываем
//           overflowY: 'auto', // Включаем прокрутку, если контент не помещается
//           transition: 'height 0.2s ease-out', // Плавный переход
//         }}
//       >
//         <div 
//           key="step1" // Уникальный ключ для принудительного перемонтирования
//           style={{
//             ...commonModalContentStyle,
//             // minHeight: '220px', // Минимальная высота для Step 1 (можно настроить)
//             height: 'auto', // Высота по контенту
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'flex-start',
//           }} 
//           className="py-6 px-4"
//         >
//           {renderStep1Content()}
//         </div>
//       </Modal>

//       {/* --- МОДАЛКА ДЛЯ ШАГА 2 --- */}
//       <Modal
//         open={isModal2Open}
//         onOpenChange={setIsModal2Open}
//         dismissible={false}
//         modal={true}
//         preventScrollRestoration={true}
//         style={{
//           zIndex: 1000,
//           maxHeight: modalCurrentMaxHeight, // Применяем max-height, которую рассчитываем
//           overflowY: 'auto', // Включаем прокрутку, если контент не помещается
//           transition: 'height 0.2s ease-out', // Плавный переход
//         }}
//       >
//         <div 
//           key="step2" // Уникальный ключ для принудительного перемонтирования
//           style={{
//             ...commonModalContentStyle,
//             // minHeight: '400px', // Явная минимальная высота для Step 2 (можно настроить)
//             height: 'auto', // Высота по контенту
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'flex-start',
//           }} 
//           className="py-6 px-4"
//         >
//           {renderStep2Content()}
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default RegistrationSteps;