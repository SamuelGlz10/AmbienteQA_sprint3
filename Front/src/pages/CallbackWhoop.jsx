import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import whoopService from '../services/whoopService';

const CallbackWhoop = () => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');

            if (error) {
                setError(`Autorización fallida: ${errorDescription || error}`);
                return;
            }
            if (!code) {
                setError('No se recibió el código de autorización.');
                return;
            }
            if (!state) {
                setError('No se recibió el parámetro de estado.');
                return;
            }
            try {
                await whoopService.handleAuthCallback(code);
                navigate('/biometricos');
            } catch (err) {
                setError('Error al autenticar con WHOOP.');
            }
        };
        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
                <h2 style={{ color: 'red' }}>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/whoop-login')}>Volver a intentar</button>
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
            <h2>Conectando con WHOOP...</h2>
            <p>Por favor espera un momento.</p>
        </div>
    );
};

export default CallbackWhoop; 