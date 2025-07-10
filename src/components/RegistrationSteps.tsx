import { useState, useEffect } from "react";
import { Button, Input, Modal, Radio, Cell } from "@telegram-apps/telegram-ui";
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
  const [companyChoice, setCompanyChoice] = useState<"join" | "create" | "">("");
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
        <Cell
          before={
            <Radio
              name="companyChoice"
              value="join"
              checked={companyChoice === "join"}
              onChange={() => handleCompanyChoiceSelect("join")}
            />
          }
          onClick={() => handleCompanyChoiceSelect("join")}
          style={{
            backgroundColor: errors.companyChoice ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
            border: errors.companyChoice ? '1px solid red' : 'none',
            borderRadius: '8px',
            marginBottom: '8px',
          }}
        >
          <div>
            <p className="font-medium">Присоединиться к компании</p>
            <p className="text-sm text-gray-500">Введите числовой код компании для присоединения</p>
          </div>
        </Cell>

        <Cell
          before={
            <Radio
              name="companyChoice"
              value="create"
              checked={companyChoice === "create"}
              onChange={() => handleCompanyChoiceSelect("create")}
            />
          }
          onClick={() => handleCompanyChoiceSelect("create")}
          style={{
            backgroundColor: errors.companyChoice ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
            border: errors.companyChoice ? '1px solid red' : 'none',
            borderRadius: '8px',
          }}
        >
          <div>
            <p className="font-medium">Создать свою компанию</p>
            <p className="text-sm text-gray-500">Создайте новую компанию и управляйте командой</p>
          </div>
        </Cell>
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
        style={{ zIndex: 1000 }}
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
