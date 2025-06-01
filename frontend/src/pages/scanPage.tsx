import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ScanPage() {
    const navigate = useNavigate();
    const webapp = window.Telegram?.WebApp;

    useEffect(() => {
        const text = { text: "Отсканируйте QR-код объекта" };
        webapp?.showScanQrPopup(text);

        const handleQrPopupClosed = () => {
            navigate("/profile");
        };

        webapp?.onEvent('scanQrPopupClosed', handleQrPopupClosed);

        // Очистка обработчика при размонтировании компонента
        return () => {
            webapp?.offEvent('scanQrPopupClosed', handleQrPopupClosed);
        };
    }, [navigate, webapp]);

    return (
        <div>
            {/* Ваш контент здесь */}
        </div>
    );
}

export default ScanPage;
