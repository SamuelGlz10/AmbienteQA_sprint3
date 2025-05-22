import React from 'react';
import { useNavigate } from 'react-router-dom';
import whoopService from '../services/whoopService';

const LoginWhoop = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        window.location.href = whoopService.getAuthUrl();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
            <h2>Conecta tu cuenta de WHOOP</h2>
            <p>Inicia sesión con tu cuenta de WHOOP para ver tus datos biométricos.</p>
            <button onClick={handleLogin} style={{ padding: '10px 30px', fontSize: 18, background: '#7a5a96', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Conectar con WHOOP
            </button>
        </div>
    );
};

export default LoginWhoop; 