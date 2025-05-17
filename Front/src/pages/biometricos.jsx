import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Biometricos.css';
import TopAppBar from '../components/TopAppBar';

const Biometricos = () => {
  // Simulación de datos
  const usuariosOnline = 7;
  const usuariosOffline = 5;
  const ritmoCardiaco = 76;
  const nivelEstres = 3; // Escala 1-5

  // Estados para los popups de cada tarjeta
  const [showHeartPopup, setShowHeartPopup] = useState(false);
  const [showStressPopup, setShowStressPopup] = useState(false);
  const [showEnergyPopup, setShowEnergyPopup] = useState(false);
  const [showActivityPopup, setShowActivityPopup] = useState(false);
  const [showSleepPopup, setShowSleepPopup] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);

  // Saber si hay algún popup abierto
  const anyPopupOpen = showHeartPopup || showStressPopup || showEnergyPopup || showActivityPopup || showSleepPopup || showSummaryPopup;

  const navigate = useNavigate();

  return (
    <>
      <TopAppBar />
      <div className="main-title">
        <h1>REGISTRO DE BIOMÉTRICOS</h1>
      </div>
      <div className="biometricos-container">
        <div className="biometricos-section">
          <div className="biometricos-main-grid">
            {/* Ritmo Cardíaco */}
            <div className="biometricos-dashboard-card" style={{cursor: 'pointer'}} onClick={() => setShowHeartPopup(true)}>
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>favorite</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">RITMO CARDÍACO</div>
                <div className="biometricos-dashboard-value">{ritmoCardiaco} <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>bpm</span></div>
              </div>
            </div>
            {/* Estatus de Estrés */}
            <div className="biometricos-dashboard-card" style={{cursor: 'pointer'}} onClick={() => setShowStressPopup(true)}>
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>mood</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">ESTATUS DE ESTRÉS</div>
                <div className="biometricos-dashboard-value">Neutro</div>
              </div>
            </div>
            {/* Nivel de Energía */}
            <div className="biometricos-dashboard-card" style={{cursor: 'pointer'}} onClick={() => setShowEnergyPopup(true)}>
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>bolt</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">NIVEL DE ENERGÍA</div>
                <div className="biometricos-dashboard-value">Alto</div>
              </div>
            </div>
            {/* Actividad Física */}
            <div className="biometricos-dashboard-card" style={{cursor: 'pointer'}} onClick={() => setShowActivityPopup(true)}>
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>directions_walk</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">ACTIVIDAD FÍSICA</div>
                <div className="biometricos-dashboard-value">7,234 <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>pasos</span></div>
                <div className="biometricos-dashboard-value" style={{fontSize: '1.1rem', color: '#bba6d6'}}>420 kcal activas</div>
              </div>
            </div>
            {/* Calidad del Sueño */}
            <div className="biometricos-dashboard-card" style={{cursor: 'pointer'}} onClick={() => setShowSleepPopup(true)}>
              <div className="biometricos-dashboard-icon" style={{background: '#f4f0fa'}}>
                <span className="material-icons" style={{color: '#7a5a96', fontSize: '2.2rem'}}>hotel</span>
              </div>
              <div className="biometricos-dashboard-info">
                <div className="biometricos-dashboard-title">CALIDAD DEL SUEÑO</div>
                <div className="biometricos-dashboard-value">6.5h <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>sueño profundo</span></div>
                <div className="biometricos-dashboard-value" style={{fontSize: '1.1rem', color: '#bba6d6'}}>Última noche: 7h 10min</div>
              </div>
            </div>
            {/* Resumen Semanal */}
            <div className="biometricos-dashboard-card" style={{cursor: 'pointer'}} onClick={() => navigate('/biometricos/resumen')}>
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
      {/* Mostrar solo el popup si alguno está abierto */}
      {anyPopupOpen && (
        <>
          {showHeartPopup && (
            <div className="popup-overlay" onClick={() => setShowHeartPopup(false)}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setShowHeartPopup(false)}>&times;</button>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
                  <span className="material-icons" style={{color: '#7a5a96', fontSize: '3.2rem', marginBottom: 8}}>favorite</span>
                  <div style={{fontSize: '2.5rem', fontWeight: 700, color: '#7a5a96'}}>76 <span style={{fontSize: '1.2rem', color: '#bba6d6'}}>bpm</span></div>
                  {/* Barra de rango */}
                  <div style={{width: 180, height: 10, borderRadius: 6, background: 'linear-gradient(90deg,#e57373 0%,#ffe082 50%,#81c784 100%)', margin: '10px 0'}}>
                    <div style={{width: '60%', height: '100%', background: '#7a5a96', borderRadius: 6}}></div>
                  </div>
                  {/* Mini-gráfica SVG */}
                  <svg width="180" height="40" style={{margin: '8px 0'}}>
                    <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points="0,30 20,10 40,20 60,12 80,25 100,8 120,18 140,10 160,30 180,15" />
                  </svg>
                  {/* Estado de humor */}
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0'}}>
                    <span className="material-icons" style={{color: '#e57373'}}>sentiment_very_dissatisfied</span>
                    <span className="material-icons" style={{color: '#ffd600'}}>sentiment_neutral</span>
                    <span className="material-icons" style={{color: '#81c784'}}>sentiment_satisfied</span>
                  </div>
                  <div style={{color: '#bba6d6', fontSize: '1rem', marginTop: 8}}>Última medición: hace 2 min</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Promedio semanal: 74 bpm</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Rango normal: 60 - 100 bpm</div>
                </div>
              </div>
            </div>
          )}
          {showStressPopup && (
            <div className="popup-overlay" onClick={() => setShowStressPopup(false)}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setShowStressPopup(false)}>&times;</button>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
                  <span className="material-icons" style={{color: '#ffd600', fontSize: '3.2rem', marginBottom: 8}}>mood</span>
                  <div style={{fontSize: '2.2rem', fontWeight: 700, color: '#7a5a96'}}>Neutro</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0'}}>
                    <span className="material-icons" style={{color: '#e57373'}}>sentiment_very_dissatisfied</span>
                    <span className="material-icons" style={{color: '#ffd600'}}>sentiment_neutral</span>
                    <span className="material-icons" style={{color: '#81c784'}}>sentiment_satisfied</span>
                  </div>
                  <div style={{color: '#bba6d6', fontSize: '1rem', marginTop: 8}}>Última medición: hace 2 min</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Promedio semanal: Leve</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Rango: Bajo - Alto</div>
                </div>
              </div>
            </div>
          )}
          {showEnergyPopup && (
            <div className="popup-overlay" onClick={() => setShowEnergyPopup(false)}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setShowEnergyPopup(false)}>&times;</button>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
                  <span className="material-icons" style={{color: '#7a5a96', fontSize: '3.2rem', marginBottom: 8}}>bolt</span>
                  <div style={{fontSize: '2.2rem', fontWeight: 700, color: '#7a5a96'}}>Alto</div>
                  {/* Barra de energía */}
                  <div style={{width: 180, height: 10, borderRadius: 6, background: '#ede3f6', margin: '10px 0'}}>
                    <div style={{width: '85%', height: '100%', background: '#7a5a96', borderRadius: 6}}></div>
                  </div>
                  {/* Factores */}
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '10px 0'}}>
                    <div style={{color: '#bba6d6', fontSize: '1rem'}}>Movimiento: 7,234 pasos</div>
                    <div style={{color: '#bba6d6', fontSize: '1rem'}}>Ritmo cardiaco: 76 bpm</div>
                    <div style={{color: '#bba6d6', fontSize: '1rem'}}>Sueño profundo: 6.5h</div>
                  </div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Recuperación nocturna: 85%</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Última actualización: hace 2 min</div>
                </div>
              </div>
            </div>
          )}
          {showActivityPopup && (
            <div className="popup-overlay" onClick={() => setShowActivityPopup(false)}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setShowActivityPopup(false)}>&times;</button>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
                  <span className="material-icons" style={{color: '#7a5a96', fontSize: '3.2rem', marginBottom: 8}}>directions_walk</span>
                  <div style={{fontSize: '2.2rem', fontWeight: 700, color: '#7a5a96'}}>7,234 <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>pasos</span></div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>420 kcal activas</div>
                  {/* Mini-gráfica SVG de pasos */}
                  <svg width="180" height="40" style={{margin: '8px 0'}}>
                    <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points="0,30 20,20 40,25 60,18 80,30 100,15 120,28 140,20 160,30 180,18" />
                  </svg>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Meta diaria: 10,000 pasos</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Última actualización: hace 2 min</div>
                </div>
              </div>
            </div>
          )}
          {showSleepPopup && (
            <div className="popup-overlay" onClick={() => setShowSleepPopup(false)}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setShowSleepPopup(false)}>&times;</button>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
                  <span className="material-icons" style={{color: '#7a5a96', fontSize: '3.2rem', marginBottom: 8}}>hotel</span>
                  <div style={{fontSize: '2.2rem', fontWeight: 700, color: '#7a5a96'}}>6.5h <span style={{fontSize: '1.1rem', color: '#bba6d6'}}>sueño profundo</span></div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Última noche: 7h 10min</div>
                  {/* Barra de sueño */}
                  <div style={{width: 180, height: 10, borderRadius: 6, background: '#ede3f6', margin: '10px 0'}}>
                    <div style={{width: '81%', height: '100%', background: '#7a5a96', borderRadius: 6}}></div>
                  </div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Promedio semanal: 6.8h</div>
                  <div style={{color: '#bba6d6', fontSize: '1rem'}}>Meta diaria: 8h</div>
                </div>
              </div>
            </div>
          )}
          {showSummaryPopup && (
            <div className="popup-overlay" onClick={() => setShowSummaryPopup(false)}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setShowSummaryPopup(false)}>&times;</button>
                <h2>RESUMEN SEMANAL</h2>
                <div style={{margin: '18px 0 10px 0', fontSize: '2.2rem', color: '#7a5a96', fontWeight: 700}}>Resumen de la semana</div>
                <div style={{marginBottom: 12, color: '#7a5a96', fontWeight: 500}}>Promedios y tendencias</div>
                <div style={{marginTop: 18, color: '#bba6d6', fontSize: '0.95rem'}}>Pronto podrás ver análisis avanzados y comparativas semanales.</div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Biometricos;

