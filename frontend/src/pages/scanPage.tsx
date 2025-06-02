import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ScanPage() {
    const navigate = useNavigate();
    const webapp = window.Telegram?.WebApp;
    
    const text = { text: "Отсканируйте QR-код объекта" };
    
    webapp?.showScanQrPopup(text);
    
    webapp?.onEvent("scanQrPopupClosed", (event) => {
        navigate("/");
    });

    return (
        <div>
            {/* Ваш контент здесь */}
        </div>
    );
}

export default ScanPage;
