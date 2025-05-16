import React from 'react';
import '../css/Biometricos.css';
import TopAppBar from '../components/TopAppBar';

const Biometricos = () => {
  // Simulación de datos
  const usuariosOnline = 7;
  const usuariosOffline = 5;
  const ritmoCardiaco = 76;
  const nivelEstres = 3; // Escala 1-5

  return (
    <>
      <TopAppBar />
      <div className="main-title">
        <h1>REGISTRO DE BIOMÉTRICOS</h1>
      </div>
      <div className="biometricos-container">
        <div className="biometricos-section">
          <div className="biometricos-main-grid">
            <div className="biometricos-dashboard-card">
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>favorite</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">RITMO CARDÍACO</div>
                <div className="biometricos-dashboard-value">{ritmoCardiaco} <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>bpm</span></div>
              </div>
            </div>
            <div className="biometricos-dashboard-card">
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>mood</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">ESTATUS DE ESTRÉS</div>
                <div className="biometricos-dashboard-value">Neutro</div>
              </div>
            </div>
            <div className="biometricos-dashboard-card">
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>bolt</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">NIVEL DE ENERGÍA</div>
                <div className="biometricos-dashboard-value">Alto</div>
              </div>
            </div>
            <div className="biometricos-dashboard-card">
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>directions_walk</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">ACTIVIDAD FÍSICA</div>
                <div className="biometricos-dashboard-value">7,234 <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>pasos</span></div>
                <div className="biometricos-dashboard-value" style={{fontSize: '1.1rem', color: '#bba6d6'}}>420 kcal activas</div>
              </div>
            </div>
            <div className="biometricos-dashboard-card">
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>hotel</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">CALIDAD DEL SUEÑO</div>
                <div className="biometricos-dashboard-value">6.5h <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>sueño profundo</span></div>
                <div className="biometricos-dashboard-value" style={{fontSize: '1.1rem', color: '#bba6d6'}}>Última noche: 7h 10min</div>
              </div>
            </div>
            <div className="biometricos-dashboard-card">
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>insights</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">RESUMEN SEMANAL</div>
                <svg viewBox="0 0 160 80" className="biometricos-dashboard-svg" style={{width: '100%', height: '80px', marginTop: '10px'}}>
                  <defs>
                    <linearGradient id="biometricosGraphGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bba6d6" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="160" height="80" fill="url(#biometricosGraphGradient)" />
                  <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points="10,60 35,40 60,45 85,30 110,45 135,20 150,10" />
                  <line x1="10" y1="70" x2="150" y2="70" stroke="#ece6f6" strokeWidth="2" />
                  <text x="10" y="78" fontSize="10" fill="#bba6d6">L</text>
                  <text x="35" y="78" fontSize="10" fill="#bba6d6">M</text>
                  <text x="60" y="78" fontSize="10" fill="#bba6d6">M</text>
                  <text x="85" y="78" fontSize="10" fill="#bba6d6">J</text>
                  <text x="110" y="78" fontSize="10" fill="#bba6d6">V</text>
                  <text x="135" y="78" fontSize="10" fill="#bba6d6">S</text>
                  <text x="150" y="78" fontSize="10" fill="#bba6d6">D</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Biometricos;

