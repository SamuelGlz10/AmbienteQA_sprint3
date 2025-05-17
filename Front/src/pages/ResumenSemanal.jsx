import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import '../css/Biometricos.css';

const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Datos simulados
const data = {
  ritmo: [72, 74, 76, 75, 73, 77, 74],
  estres: [2, 3, 2, 1, 2, 3, 2],
  energia: [80, 85, 78, 90, 88, 82, 87],
  pasos: [7000, 8000, 7500, 9000, 8500, 9500, 7200],
  sueno: [6.5, 7, 6.8, 7.2, 6.9, 7.1, 6.7],
};

const ResumenSemanal = () => {
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null); // 'ritmo', 'estres', 'energia', 'pasos', 'sueno'

  // Popup content generator
  const renderPopup = () => {
    if (!popup) return null;
    let title = '', color = '#7a5a96', values = [], unit = '', extra = null;
    switch (popup) {
      case 'ritmo':
        title = 'Ritmo Cardíaco (bpm)';
        values = data.ritmo;
        unit = 'bpm';
        color = '#7a5a96';
        extra = (
          <div className="popup-stats">
            <div className="stat-item">
              <span className="stat-label">Promedio</span>
              <span className="stat-value">{Math.round(values.reduce((a,b)=>a+b,0)/values.length)} bpm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">{Math.max(...values)} bpm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">{Math.min(...values)} bpm</span>
            </div>
          </div>
        );
        break;
      case 'estres':
        title = 'Estrés (1-5)';
        values = data.estres;
        color = '#7a5a96';
        extra = (
          <div className="popup-stats">
            <div className="stat-item">
              <span className="stat-label">Promedio</span>
              <span className="stat-value">{Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">{Math.max(...values)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">{Math.min(...values)}</span>
            </div>
          </div>
        );
        break;
      case 'energia':
        title = 'Nivel de Energía (%)';
        values = data.energia;
        color = '#7a5a96';
        extra = (
          <div className="popup-stats">
            <div className="stat-item">
              <span className="stat-label">Promedio</span>
              <span className="stat-value">{Math.round(values.reduce((a,b)=>a+b,0)/values.length)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">{Math.max(...values)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">{Math.min(...values)}%</span>
            </div>
          </div>
        );
        break;
      case 'pasos':
        title = 'Pasos';
        values = data.pasos;
        color = '#7a5a96';
        extra = (
          <div className="popup-stats">
            <div className="stat-item">
              <span className="stat-label">Promedio</span>
              <span className="stat-value">{Math.round(values.reduce((a,b)=>a+b,0)/values.length)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">{Math.max(...values)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">{Math.min(...values)}</span>
            </div>
          </div>
        );
        break;
      case 'sueno':
        title = 'Sueño Profundo (h)';
        values = data.sueno;
        color = '#7a5a96';
        extra = (
          <div className="popup-stats">
            <div className="stat-item">
              <span className="stat-label">Promedio</span>
              <span className="stat-value">{Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10} h</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Máximo</span>
              <span className="stat-value">{Math.max(...values)} h</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo</span>
              <span className="stat-value">{Math.min(...values)} h</span>
            </div>
          </div>
        );
        break;
      default:
        return null;
    }
    return (
      <div className="popup-overlay" onClick={() => setPopup(null)}>
        <div className="popup-content" onClick={e => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setPopup(null)}>&times;</button>
          <h2 style={{color, marginBottom: 18}}>{title}</h2>
          <div className="graph-container">
            {(() => {
              // Escalado dinámico Y
              const minY = Math.min(...values);
              const maxY = Math.max(...values);
              const yStart = 30; // margen superior
              const yEnd = 150; // margen inferior
              const yRange = maxY - minY === 0 ? 1 : maxY - minY;
              // Función para mapear valor a Y
              const mapY = v => yEnd - ((v - minY) / yRange) * (yEnd - yStart);
              // Puntos para polyline y área
              const points = values.map((v,i)=>`${i*58},${mapY(v)}`).join(' ');
              const areaPath = `M0,${yEnd} ${values.map((v,i)=>`L${i*58},${mapY(v)}`).join(' ')} L${(values.length-1)*58},${yEnd} Z`;
              return (
                <svg width="100%" height="180" viewBox="0 0 350 180">
                  {/* Grid lines */}
                  <g className="grid-lines">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="0" y1={yStart + i*(yEnd-yStart)/4} x2="350" y2={yStart + i*(yEnd-yStart)/4} stroke="#ede3f6" strokeWidth="1" />
                    ))}
                  </g>
                  {/* Main line */}
                  <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
                  {/* Area under the line */}
                  <path d={areaPath} fill={color} fillOpacity="0.1" />
                  {/* Data points */}
                  {values.map((v, i) => (
                    <g key={i}>
                      <circle cx={i*58} cy={mapY(v)} r="6" fill={color} opacity="0.2" />
                      <circle cx={i*58} cy={mapY(v)} r="3" fill={color} />
                    </g>
                  ))}
                  {/* Day labels */}
                  {dias.map((d, i) => (
                    <text key={d+i} x={i*58} y={170} fontSize="14" fill={color}>{d}</text>
                  ))}
                </svg>
              );
            })()}
          </div>
          {extra}
        </div>
      </div>
    );
  };

  return (
    <>
      <TopAppBar />
      <div className="main-title" style={{marginBottom: 30}}>
        <h1>RESUMEN SEMANAL DE BIOMÉTRICOS</h1>
      </div>
      <div className="biometricos-container" style={{maxWidth: 900, margin: '0 auto'}}>
        <div className="biometricos-main-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
          {/* Ritmo Cardíaco */}
          <div className="biometricos-section" style={{cursor: 'pointer'}} onClick={() => setPopup('ritmo')}>
            <h2 className="biometricos-dashboard-title" style={{color: '#7a5a96'}}>Ritmo Cardíaco (bpm)</h2>
            <svg width="100%" height="80" viewBox="0 0 350 80">
              <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points={data.ritmo.map((v,i)=>`${i*58},${80-(v-65)*7}`).join(' ')} />
              {data.ritmo.map((v, i) => (
                <circle key={i} cx={i*58} cy={80-(v-65)*7} r="4" fill="#bba6d6" />
              ))}
              {dias.map((d, i) => (
                <text key={d+i} x={i*58} y={78} fontSize="12" fill="#bba6d6">{d}</text>
              ))}
            </svg>
          </div>
          {/* Estrés */}
          <div className="biometricos-section" style={{cursor: 'pointer'}} onClick={() => setPopup('estres')}>
            <h2 className="biometricos-dashboard-title" style={{color: '#7a5a96'}}>Estrés (1-5)</h2>
            <svg width="100%" height="80" viewBox="0 0 350 80">
              <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points={data.estres.map((v,i)=>`${i*58},${80-(v*15)}`).join(' ')} />
              {data.estres.map((v, i) => (
                <circle key={i} cx={i*58} cy={80-(v*15)} r="4" fill="#bba6d6" />
              ))}
              {dias.map((d, i) => (
                <text key={d+i} x={i*58} y={78} fontSize="12" fill="#bba6d6">{d}</text>
              ))}
            </svg>
          </div>
          {/* Energía */}
          <div className="biometricos-section" style={{cursor: 'pointer'}} onClick={() => setPopup('energia')}>
            <h2 className="biometricos-dashboard-title" style={{color: '#7a5a96'}}>Nivel de Energía (%)</h2>
            <svg width="100%" height="80" viewBox="0 0 350 80">
              <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points={data.energia.map((v,i)=>`${i*58},${80-v*0.7}`).join(' ')} />
              {data.energia.map((v, i) => (
                <rect key={i} x={i*58-10} y={80-v*0.7} width="20" height={v*0.7} fill="#bba6d6" />
              ))}
              {dias.map((d, i) => (
                <text key={d+i} x={i*58} y={78} fontSize="12" fill="#bba6d6">{d}</text>
              ))}
            </svg>
          </div>
          {/* Actividad Física */}
          <div className="biometricos-section" style={{cursor: 'pointer'}} onClick={() => setPopup('pasos')}>
            <h2 className="biometricos-dashboard-title" style={{color: '#7a5a96'}}>Pasos</h2>
            <svg width="100%" height="80" viewBox="0 0 350 80">
              <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points={data.pasos.map((v,i)=>`${i*58},${80-(v-6500)*0.01}`).join(' ')} />
              {data.pasos.map((v, i) => (
                <rect key={i} x={i*58-10} y={80-(v-6500)*0.01} width="20" height={(v-6500)*0.01} fill="#bba6d6" />
              ))}
              {dias.map((d, i) => (
                <text key={d+i} x={i*58} y={78} fontSize="12" fill="#bba6d6">{d}</text>
              ))}
            </svg>
          </div>
          {/* Sueño */}
          <div className="biometricos-section" style={{cursor: 'pointer'}} onClick={() => setPopup('sueno')}>
            <h2 className="biometricos-dashboard-title" style={{color: '#7a5a96'}}>Sueño Profundo (h)</h2>
            <svg width="100%" height="80" viewBox="0 0 350 80">
              <polyline fill="none" stroke="#7a5a96" strokeWidth="3" points={data.sueno.map((v,i)=>`${i*58},${80-v*10}`).join(' ')} />
              {data.sueno.map((v, i) => (
                <rect key={i} x={i*58-10} y={80-v*10} width="20" height={v*10} fill="#bba6d6" />
              ))}
              {dias.map((d, i) => (
                <text key={d+i} x={i*58} y={78} fontSize="12" fill="#bba6d6">{d}</text>
              ))}
            </svg>
          </div>
        </div>
        <button className="main-button" style={{margin: '30px auto 0 auto', display: 'block'}} onClick={() => navigate('/biometricos')}>Volver a mis biométricos</button>
      </div>
      {renderPopup()}
    </>
  );
};

export default ResumenSemanal; 