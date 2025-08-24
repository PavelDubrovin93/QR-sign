import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function ScanPage() {
    const navigate = useNavigate();
    const webapp = window.Telegram?.WebApp;

    const handlePopupClosed = useCallback(() => {
        window.location.href = "/"; // kostil pizdes, navigate doesnt work coz of many rerenders??
        webapp?.closeScanQrPopup();
        
    }, [navigate]);

    const handleQrTextReceived = useCallback((qrData: any) => {
        webapp?.showAlert('Получен QR-код:', qrData);
        window.location.href = qrData;
        webapp?.closeScanQrPopup()
        
        return true;
    }, []);

    useEffect(() => {
        if (webapp) {
            const popupParams = { text: "Отсканируйте QR-код объекта" };
        
            webapp.showScanQrPopup(popupParams, handleQrTextReceived);
            webapp.onEvent("scanQrPopupClosed", handlePopupClosed);

            // return () => {
            //     webapp.offEvent("scanQrPopupClosed", handlePopupClosed);
            // };
        }
    }, [webapp, handlePopupClosed, handleQrTextReceived]);

    return (
        <div>
            <p>Пожалуйста, отсканируйте QR-код.</p>
        </div>
    );
}

export default ScanPage;