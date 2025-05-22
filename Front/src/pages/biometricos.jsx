import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Biometricos.css';
import TopAppBar from '../components/TopAppBar';
import whoopService from '../services/whoopService';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const metricDescriptions = {
  'VFC': 'La variabilidad de la frecuencia cardíaca (VFC) es un indicador de recuperación y adaptación del cuerpo al estrés físico y mental.',
  'FCR': 'La frecuencia cardíaca en reposo (FCR) refleja la salud cardiovascular y el nivel de recuperación.',
  'Sueño Profundo': 'El sueño profundo es la fase más reparadora del sueño, esencial para la recuperación física y mental.',
  'Duración del Sueño': 'La duración total del sueño es clave para la recuperación y el bienestar general.',
  'Calorías': 'Las calorías quemadas reflejan el gasto energético total durante el día.'
};

// --- COMPONENTES AUXILIARES ---
const MetricCard = ({label, value, unit, icon, color, expanded, onExpand, description}) => (
  <div className={`biometricos-metric-card${expanded ? ' expanded' : ''}`} onClick={onExpand} style={{cursor: 'pointer'}}>
    <span className="material-icons">{icon}</span>
    <div className="biometricos-metric-label">{label}</div>
    <div className="biometricos-metric-value">
      {value}
      <span className="biometricos-metric-unit">{unit}</span>
    </div>
    {expanded && (
      <div className="biometricos-metric-desc">{description}</div>
    )}
  </div>
);

const WeeklyBarChart = ({title, data, color, weekDays, unit}) => (
  <div className="biometricos-weekly-bar-chart">
    <div className="biometricos-weekly-bar-title">{title}</div>
    <svg width={weekDays.length*60} height="120" className="biometricos-weekly-bar-svg">
      {data.map((v,i)=>(
        <rect key={i} x={i*60+18} y={110-v} width="24" height={v} fill={color} rx={6} />
      ))}
      {data.map((v,i)=>(
        <text key={i} x={i*60+30} y={110-v-8} textAnchor="middle" fontSize="15" fill={color} fontWeight={700}>{Math.round(v)}{unit}</text>
      ))}
      {weekDays.map((d,i)=>(
        <text key={d+i} x={i*60+30} y={118} textAnchor="middle" fontSize="13" fill="#bba6d6">{d.slice(5)}</text>
      ))}
    </svg>
  </div>
);

const MainCard = ({label, value, color, onClick}) => {
  let english;
  if (label === 'RECUPERACIÓN') english = 'Recovery';
  else if (label === 'DESEMPEÑO DEL SUEÑO') english = 'Sleep Performance';
  else if (label === 'ESFUERZO') english = 'Strain';
  // Ajuste: el círculo de esfuerzo es proporcional a 21
  const maxStrain = 21;
  const circleLength = 339; // 2 * PI * r, r=54
  const strainValue = label === 'ESFUERZO' ? Math.min(value, maxStrain) : value;
  const strainDash = label === 'ESFUERZO' ? (strainValue / maxStrain) * circleLength : value * 3.39;
  return (
    <div className={`biometricos-main-card${onClick ? ' clickable' : ''}`} onClick={onClick}>
      <div className="biometricos-main-label">{label}</div>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#ede3f6" strokeWidth="8" />
        <circle 
          cx="60" 
          cy="60" 
          r="54" 
          fill="none" 
          stroke={color} 
          strokeWidth="8"
          strokeDasharray={`${strainDash} 339`}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fill={color} style={{fontSize: '36px', fontWeight: '700'}}>
          {label==='ESFUERZO' ? value : value+'%'}
        </text>
      </svg>
      {english && (
        <div style={{color: '#bba6d6', fontSize: '0.95rem', marginTop: 2, fontWeight: 500, letterSpacing: '0.5px'}}>{english}</div>
      )}
      <div className="biometricos-main-desc">{label==='ESFUERZO'?'Carga cardiovascular':'Recuperación'}</div>
    </div>
  );
};

const Biometricos = () => {
  const [sleepData, setSleepData] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('day'); // 'day' o 'week'
  const [showRecoveryPopup, setShowRecoveryPopup] = useState(false);
  const [showSleepPopup, setShowSleepPopup] = useState(false);
  const [showStrainPopup, setShowStrainPopup] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showWorkoutPopup, setShowWorkoutPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!whoopService.isAuthenticated()) {
      navigate('/whoop-login');
      return;
    }
    const fetchData = async () => {
      try {
        const end = new Date();
        const start = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 días para asegurar semana completa
        const [sleep, cycles, rec, profile, workoutsResp] = await Promise.all([
          whoopService.getSleepData(start.toISOString(), end.toISOString()),
          whoopService.getCycles(start.toISOString(), end.toISOString()),
          whoopService.getRecoveryData(start.toISOString(), end.toISOString()),
          whoopService.getProfile(),
          whoopService.getWorkouts(start.toISOString(), end.toISOString())
        ]);
        setSleepData(sleep?.records || []);
        setCycleData(cycles?.records || []);
        setRecoveryData(rec?.records || []);
        setUserProfile(profile);
        setWorkouts(workoutsResp?.records || []);
        setError(null);
      } catch (err) {
        setError('Error al obtener datos de WHOOP.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // --- DATOS DEL DÍA ANTERIOR ---
  const getYesterday = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday;
  };
  const yesterday = getYesterday();
  const yesterdayStr = yesterday.toISOString().slice(0,10);

  // Ciclo y recovery del día anterior (score_state === 'SCORED')
  const yesterdayCycle = cycleData.find(c => c.start.slice(0,10) === yesterdayStr && c.score_state === 'SCORED');
  const yesterdayRecovery = recoveryData.find(r => r.created_at.slice(0,10) === yesterdayStr && r.score_state === 'SCORED');
  const yesterdaySleep = sleepData.filter(s => !s.nap && s.start.slice(0,10) === yesterdayStr && s.score_state === 'SCORED')[0];

  // Métricas del día anterior
  const recoveryPct = yesterdayRecovery?.score?.recovery_score || 0;
  const sleepPerfPct = yesterdaySleep?.score?.sleep_performance_percentage ?? yesterdayRecovery?.score?.sleep_performance_percentage ?? 0;
  const hrv = Math.round(yesterdayRecovery?.score?.hrv_rmssd_milli || 0);
  const rhr = Math.round(yesterdayRecovery?.score?.resting_heart_rate || 0);
  const strain = yesterdayCycle?.score?.strain ? Number(yesterdayCycle.score.strain.toFixed(2)) : 0;
  const calories = yesterdayCycle?.score?.calories ? 
      Number(yesterdayCycle.score.calories) : 
      (yesterdayCycle?.score?.kilojoule ? 
          Number((yesterdayCycle.score.kilojoule * 0.239006).toFixed(0)) : 0);
  const validatedCalories = calories;
  const sleepDeep = yesterdaySleep?.score?.stage_summary?.total_slow_wave_sleep_time_milli ? (yesterdaySleep.score.stage_summary.total_slow_wave_sleep_time_milli / (1000*60*60)).toFixed(1) : 0;
  const sleepDuration = yesterdaySleep ? ((new Date(yesterdaySleep.end) - new Date(yesterdaySleep.start)) / (1000*60*60)).toFixed(1) : 0;

  // --- DATOS SEMANALES ---
  const groupByDay = (arr, key='start') => {
    const map = {};
    arr.forEach(item => {
      const day = item[key].slice(0,10);
      if (!map[day]) map[day] = [];
      map[day].push(item);
    });
    return map;
  };

  const weekDays = Array.from({length:7}, (_,i)=>{
    const d = new Date(yesterday);
    d.setDate(d.getDate() - (6-i));
    return d.toISOString().slice(0,10);
  });

  const recoveryByDay = groupByDay(recoveryData, 'created_at');
  const sleepByDay = groupByDay(sleepData, 'start');
  const cycleByDay = groupByDay(cycleData, 'start');

  // Process sleep performance data
  const sleepPerfWeek = weekDays.map(day => {
    const sleep = (sleepByDay[day]||[]).find(s => !s.nap && s.score_state === 'SCORED');
    return sleep?.score?.sleep_performance_percentage ?? 0;
  });

  // Process recovery data
  const recoveryPctWeek = weekDays.map(day => {
    const rec = (recoveryByDay[day]||[]).find(r => r.score_state === 'SCORED');
    return rec?.score?.recovery_score ?? 0;
  });

  // Process calories data - ensure precise conversion from kilojoules if needed
  const caloriesWeek = weekDays.map(day => {
    const cyc = (cycleByDay[day]||[]).find(c => c.score_state === 'SCORED');
    if (!cyc) return 0;
    
    // Get raw calories or convert from kilojoules if needed
    if (cyc.score?.calories !== undefined) {
      return Number(cyc.score.calories);
    } else if (cyc.score?.kilojoule !== undefined) {
      return Number((cyc.score.kilojoule * 0.239006).toFixed(0));
    }
    return 0;
  });

  // --- DATOS SEMANALES DE WORKOUTS ---
  // Filtrar workouts de la semana (score_state === 'SCORED')
  const weekWorkouts = workouts.filter(w => w.score_state === 'SCORED');
  // Map de deportes
  const sportMap = {
    '-1': 'Actividad', '0': 'Correr', '1': 'Ciclismo', '16': 'Béisbol', '17': 'Básquetbol', '18': 'Remo', '19': 'Esgrima', '20': 'Hockey', '21': 'Fútbol Americano', '22': 'Golf', '24': 'Hockey sobre hielo', '25': 'Lacrosse', '27': 'Rugby', '28': 'Vela', '29': 'Esquí', '30': 'Fútbol', '31': 'Softbol', '32': 'Squash', '33': 'Natación', '34': 'Tenis', '35': 'Atletismo', '36': 'Voleibol', '37': 'Waterpolo', '38': 'Lucha', '39': 'Boxeo', '42': 'Danza', '43': 'Pilates', '44': 'Yoga', '45': 'Pesas', '47': 'Esquí de fondo', '48': 'Fitness funcional', '49': 'Duatlón', '51': 'Gimnasia', '52': 'Senderismo', '53': 'Equitación', '55': 'Kayak', '56': 'Artes marciales', '57': 'Ciclismo de montaña', '59': 'Powerlifting', '60': 'Escalada', '61': 'Paddleboard', '62': 'Triatlón', '63': 'Caminata', '64': 'Surf', '65': 'Elíptica', '66': 'Stairmaster', '70': 'Meditación', '71': 'Otro', '73': 'Buceo', '74': 'Operaciones tácticas', '75': 'Operaciones médicas', '76': 'Operaciones aéreas', '77': 'Operaciones acuáticas', '82': 'Ultimate', '83': 'Escalador', '84': 'Saltar la cuerda', '85': 'Fútbol australiano', '86': 'Skateboarding', '87': 'Entrenador', '88': 'Baño de hielo', '89': 'Commuting', '90': 'Gaming', '91': 'Snowboard', '92': 'Motocross', '93': 'Caddie', '94': 'Carrera de obstáculos', '95': 'Motor Racing', '96': 'HIIT'
  };
  // Tipo de entrenamiento más frecuente
  const sportCount = {};
  weekWorkouts.forEach(w => {
    const s = w.sport_id;
    sportCount[s] = (sportCount[s] || 0) + 1;
  });
  const mostFrequentSportId = Object.entries(sportCount).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const mostFrequentSport = sportMap[mostFrequentSportId] || 'Otro';
  // Esfuerzo total (strain), minutos y calorías
  const totalStrain = weekWorkouts.reduce((a,w)=>a+(w.score?.strain||0),0);
  const totalMinutes = weekWorkouts.reduce((a,w)=>a+((new Date(w.end)-new Date(w.start))/(1000*60)),0);
  const totalCalories = weekWorkouts.reduce((a,w)=>a+(w.score?.calories || (w.score?.kilojoule ? w.score.kilojoule*0.239006 : 0)),0);
  // Interpretación
  let interpretacionWorkout = 'Actividad física baja esta semana.';
  if (totalMinutes >= 150) interpretacionWorkout = '¡Excelente! Cumpliste la recomendación de actividad física semanal.';
  else if (totalMinutes >= 90) interpretacionWorkout = 'Actividad física moderada, sigue así.';
  else if (totalMinutes > 0) interpretacionWorkout = 'Podrías aumentar tu nivel de actividad física.';

  // --- COMPONENTE TARJETA SEMANAL ---
  const WeeklyMetricCard = ({title, icon, color, value, change, unit, onClick}) => (
    <div className="biometricos-main-card clickable" onClick={onClick} style={{height: 320, minWidth: 260, maxWidth: 340, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0}}>
      <span className="material-icons" style={{fontSize: 44, color, marginBottom: 8}}>{icon}</span>
      <div className="biometricos-main-label" style={{fontSize: 18, marginBottom: 4, textAlign: 'center'}}>{title}</div>
      <div className="biometricos-main-value" style={{fontSize: 48, fontWeight: 700, color: '#302041', lineHeight: 1, margin: '8px 0'}}>
        {Number(value).toFixed(2)} <span className="biometricos-metric-unit" style={{fontSize: 18, color: '#bba6d6', fontWeight: 500}}>{unit}</span>
      </div>
      <div style={{fontSize: 15, color: change > 0 ? '#00b894' : change < 0 ? '#e17055' : '#bba6d6', fontWeight: 600, marginTop: 2, marginBottom: 4, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%'}}>
        {isNaN(change) ? '' : `${change > 0 ? '+' : ''}${Number(change).toFixed(2)}% vs semana anterior`}
      </div>
    </div>
  );

  // --- POPUP DETALLADO SEMANAL ---
  const WeeklyDetailPopup = ({open, onClose, title, data, color, weekDays, unit}) => {
    if (!open) return null;
    
    // Calculate statistics with precise decimal handling
    const avg = Number((data.reduce((a,b)=>a+b,0)/data.length).toFixed(2));
    const min = Number(Math.min(...data).toFixed(2));
    const max = Number(Math.max(...data).toFixed(2));
    
    // Detect significant changes between consecutive days (15% threshold)
    const changes = data.map((v, i) =>
      i > 0 && Math.abs(v - data[i-1]) > 0.15 * data[i-1] ? i : null
    ).filter(i => i !== null);

    // Set display maximum with appropriate scaling
    let displayMax = max;
    if (unit === '%') {
      displayMax = Math.min(100, max * 1.1); // Cap at 100% for percentages
    } else {
      displayMax = max * 1.1; // Add 10% margin for better visualization
    }

    // Format the data for display
    const formattedData = data.map(v => Number(v.toFixed(2)));
    const formattedMax = Number(displayMax.toFixed(2));
    const formattedMin = Number(min.toFixed(2));
    const formattedAvg = Number(avg.toFixed(2));

    // Get days with drastic changes
    const drasticDays = changes.map(i => weekDays[i]?.slice(5)).filter(Boolean);

    return (
      <div className="biometricos-popup-overlay" onClick={onClose}>
        <div className="biometricos-popup-content" onClick={e=>e.stopPropagation()} style={{
          maxWidth: '90%',
          width: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '40px',
          margin: '20px auto',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(158, 114, 190, 0.15)'
        }}>
          <button className="biometricos-popup-close" onClick={onClose}>&times;</button>
          <h2 className="biometricos-popup-title" style={{fontSize: 32, marginBottom: 24, color: '#7a5a96'}}>{title}</h2>
          <div className="biometricos-popup-metrics" style={{
            marginBottom: 32,
            fontSize: 20,
            background: '#faf7fd',
            borderRadius: '12px',
            padding: '24px',
            border: '1.5px solid #f4f2f6'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              color: '#7a5a96',
              fontSize: 20,
              marginBottom: 12
            }}>
              <span>Promedio: <b style={{color: '#302041'}}>{formattedAvg} {unit}</b></span>
              <span>Máximo: <b style={{color: '#302041'}}>{formattedMax} {unit}</b></span>
              <span>Mínimo: <b style={{color: '#302041'}}>{formattedMin} {unit}</b></span>
            </div>
            <div style={{
              marginTop: 8,
              color: avg > data[0] ? '#00b894' : avg < data[0] ? '#e17055' : '#bba6d6',
              fontWeight: 700,
              fontSize: 18
            }}>
              {isNaN(avg) ? '' : `${avg > data[0] ? '+' : ''}${Number((avg - data[0]).toFixed(2))}% vs inicio de semana`}
            </div>
          </div>
          {/* Graph component with precise data */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 16px #ede3f6',
            padding: 32,
            marginBottom: 32
          }}>
            {(() => {
              const width = 60 * (formattedData.length-1) + 100;
              const height = 220;
              const leftPad = 50;
              const rightPad = 50;
              const topPad = 30;
              const bottomPad = 40;
              
              // Precise scaling calculations
              const maxValue = formattedMax;
              const minValue = Math.min(...formattedData, 0);
              const y = v => topPad + (height-topPad-bottomPad) * (1 - (v-minValue)/(maxValue-minValue||1));
              const x = i => leftPad + i * ((width-leftPad-rightPad)/(formattedData.length-1||1));
              
              // Generate precise points for the line
              const points = formattedData.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
              
              return (
                <svg width={width} height={height} style={{display: 'block', margin: '0 auto', maxWidth: '100%'}}>
                  {/* Reference lines with precise values */}
                  <text x={10} y={y(maxValue)} fontSize={16} fill="#7a5a96">{formattedMax}{unit}</text>
                  <line x1={leftPad} y1={y(maxValue)} x2={width-rightPad} y2={y(maxValue)} stroke="#ede3f6" strokeDasharray="4" />
                  
                  <text x={10} y={y((maxValue+minValue)/2)} fontSize={16} fill="#7a5a96">
                    {Number(((maxValue+minValue)/2).toFixed(2))}{unit}
                  </text>
                  <line x1={leftPad} y1={y((maxValue+minValue)/2)} x2={width-rightPad} y2={y((maxValue+minValue)/2)} stroke="#ede3f6" strokeDasharray="4" />
                  
                  <text x={10} y={y(minValue)} fontSize={16} fill="#7a5a96">{formattedMin}{unit}</text>
                  <line x1={leftPad} y1={y(minValue)} x2={width-rightPad} y2={y(minValue)} stroke="#ede3f6" strokeDasharray="4" />
                  
                  {/* Main data line */}
                  <polyline fill="none" stroke="#7a5a96" strokeWidth={3} points={points} />
                  
                  {/* Data points with precise positioning */}
                  {formattedData.map((v,i)=>{
                    const isChange = changes.includes(i);
                    return (
                      <g key={i}>
                        <circle cx={x(i)} cy={y(v)} r={7} fill={isChange ? '#e3d6f2' : '#7a5a96'} stroke="#fff" strokeWidth={2}/>
                      </g>
                    );
                  })}
                  
                  {/* X-axis labels with precise dates */}
                  {weekDays.map((d,i)=>(
                    <text key={d+i} x={x(i)} y={height-10} textAnchor="middle" fontSize={15} fill="#bba6d6">{d.slice(5)}</text>
                  ))}
                </svg>
              );
            })()}
          </div>
          {/* Legend section */}
          <div style={{
            marginTop: 24,
            padding: '16px 24px',
            background: '#faf7fd',
            borderRadius: '12px',
            border: '1.5px solid #f4f2f6',
            fontSize: 16,
            color: '#7a5a96',
            fontWeight: 600
          }}>
            <div style={{display: 'flex', gap: 24, alignItems: 'center', marginBottom: 8}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{width: 16, height: 16, background: '#7a5a96', borderRadius: 4}}></div>
                <span>Valor normal</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{width: 16, height: 16, background: '#e3d6f2', borderRadius: 4}}></div>
                <span>Cambio drástico</span>
              </div>
            </div>
            {/* Days with drastic changes */}
            Cambios drásticos: {
              drasticDays.length > 0
                ? drasticDays.join(', ')
                : 'Ninguno'
            }
          </div>
        </div>
      </div>
    );
  };

  // Ensure consistent data handling for all metrics
  const processMetricData = (data, unit) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(value => {
      if (value === null || value === undefined) return 0;
      const numValue = Number(value);
      return isNaN(numValue) ? 0 : Number(numValue.toFixed(2));
    });
  };

  // Process all weekly data consistently
  const processedSleepPerfWeek = processMetricData(sleepPerfWeek, '%');
  const processedRecoveryPctWeek = processMetricData(recoveryPctWeek, '%');
  const processedCaloriesWeek = processMetricData(caloriesWeek, 'kcal');

  // Update the weekly summary section to use processed data
  const renderWeeklySummary = () => (
    <div className="biometricos-week-summary" style={{ marginTop: 0 }}>
      <h2>Resumen Semanal</h2>
      <div className="biometricos-day-cards">
        <WeeklyMetricCard
          title="Desempeño del Sueño"
          icon="hotel"
          color="#7a5a96"
          value={processedSleepPerfWeek.reduce((a,b)=>a+b,0)/processedSleepPerfWeek.length || 0}
          change={((processedSleepPerfWeek.reduce((a,b)=>a+b,0)/processedSleepPerfWeek.length - 80)/80*100)}
          unit="%"
          onClick={() => setExpandedMetric('Desempeño del Sueño')}
        />
        <WeeklyMetricCard
          title="Recuperación"
          icon="favorite"
          color="#a892c5"
          value={processedRecoveryPctWeek.reduce((a,b)=>a+b,0)/processedRecoveryPctWeek.length || 0}
          change={((processedRecoveryPctWeek.reduce((a,b)=>a+b,0)/processedRecoveryPctWeek.length - 80)/80*100)}
          unit="%"
          onClick={() => setExpandedMetric('Recuperación')}
        />
        <WeeklyMetricCard
          title="Esfuerzo"
          icon="trending_up"
          color="#a892c5"
          value={processedCaloriesWeek.reduce((a,b)=>a+b,0)/processedCaloriesWeek.length || 0}
          change={((processedCaloriesWeek.reduce((a,b)=>a+b,0)/processedCaloriesWeek.length - 80)/80*100)}
          unit="kcal"
          onClick={() => setExpandedMetric('Esfuerzo')}
        />
        <WeeklyMetricCard
          title="Actividad Física"
          icon="directions_run"
          color="#7a5a96"
          value={totalStrain}
          change={weekWorkouts.length}
          unit="strain"
          onClick={() => setShowWorkoutPopup(true)}
        />
      </div>
    </div>
  );

  const getInterpretacion = (key, value) => {
    switch (key) {
      case 'Recuperación':
        if (value >= 67) return 'Óptima. Tu cuerpo está bien recuperado.';
        if (value >= 34) return 'Moderada. Escucha a tu cuerpo y ajusta la intensidad.';
        return 'Baja. Prioriza descanso y recuperación.';
      case 'Desempeño del Sueño':
        if (value >= 85) return 'Excelente sueño. Tu cuerpo está bien recuperado.';
        if (value >= 70) return 'Buen sueño, pero puedes mejorar la consistencia.';
        return 'Moderado. Intenta mejorar la consistencia y eficiencia.';
      case 'Esfuerzo':
        if (value >= 10) return 'Alta carga cardiovascular, tu cuerpo ha trabajado duro.';
        if (value >= 6) return 'Carga moderada, buen trabajo.';
        return 'Carga baja, considera aumentar la actividad física si tu recuperación lo permite.';
      case 'Calorías':
        if (value > 3500) return 'Gasto calórico muy alto, asegúrate de reponer energía.';
        if (value > 2000) return 'Gasto calórico adecuado para actividad física.';
        return 'Gasto calórico bajo, revisa tu nivel de actividad.';
      case 'VFC':
        if (value > 60) return 'Excelente variabilidad, buen estado de recuperación.';
        if (value > 30) return 'VFC adecuada, sigue monitoreando.';
        return 'VFC baja, posible fatiga o estrés.';
      case 'Sueño Profundo':
        if (value >= 1.5) return 'Sueño profundo suficiente para recuperación.';
        return 'Sueño profundo bajo, intenta mejorar hábitos de sueño.';
      case 'Duración del Sueño':
        if (value >= 7) return 'Duración adecuada para adultos.';
        return 'Duración insuficiente, procura dormir más.';
      default:
        return '';
    }
  };

  const drawLineChart = (doc, x, y, width, height, data, color, label, unit) => {
    // Ejes
    doc.setDrawColor(180, 166, 214);
    doc.line(x, y, x, y + height); // Y
    doc.line(x, y + height, x + width, y + height); // X
    // Datos
    const max = Math.max(...data);
    const min = Math.min(...data);
    const stepX = width / (data.length - 1);
    const scaleY = height / (max - min || 1);
    doc.setDrawColor(122, 90, 150);
    doc.setLineWidth(1.5);
    data.forEach((v, i) => {
      if (i > 0) {
        const prevX = x + (i - 1) * stepX;
        const prevY = y + height - (data[i - 1] - min) * scaleY;
        const currX = x + i * stepX;
        const currY = y + height - (v - min) * scaleY;
        doc.line(prevX, prevY, currX, currY);
      }
    });
    // Puntos
    data.forEach((v, i) => {
      const cx = x + i * stepX;
      const cy = y + height - (v - min) * scaleY;
      doc.setFillColor(122, 90, 150);
      doc.circle(cx, cy, 2, 'F');
    });
    // Etiquetas
    doc.setFontSize(9);
    doc.setTextColor(122, 90, 150);
    doc.text(label, x, y - 2);
    doc.text(`${max.toFixed(1)}${unit}`, x + width + 2, y + 4);
    doc.text(`${min.toFixed(1)}${unit}`, x + width + 2, y + height);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      // Logo clásico
      doc.addImage('/softedge_logo.png', 'PNG', 10, 8, 25, 15);
      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('REPORTE MÉDICO DE BIOMÉTRICOS', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Usuario: ${userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Usuario'}`, 10, 30);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 30);
      doc.setDrawColor(180, 166, 214);
      doc.setLineWidth(0.8);
      doc.line(10, 34, 200, 34);
      // Tabla de métricas principales (con iconos PNG muy pequeños)
      const iconMap = {
        'local_fire_department': 'local_fire_department.png',
        'favorite': 'favorite.png',
        'hotel': 'hotel.png',
        'schedule': 'schedule.png',
        'trending_up': 'trendingup.png',
      };
      const metricRows = [
        ['local_fire_department', 'Calorías', `${validatedCalories} kcal`],
        ['favorite', 'VFC', `${hrv} ms`],
        ['hotel', 'Sueño Profundo', `${sleepDeep} h`],
        ['schedule', 'Duración del Sueño', `${sleepDuration} h`],
        ['favorite', 'Recuperación', `${recoveryPct}%`],
        ['trending_up', 'Esfuerzo', `${strain}`],
        ['hotel', 'Desempeño del Sueño', `${sleepPerfPct}%`],
      ];
      let startY = 40;
      doc.setFontSize(12);
      doc.setTextColor(48, 32, 65);
      doc.setFillColor(245, 247, 253);
      doc.roundedRect(10, startY, 190, metricRows.length * 12 + 12, 6, 6, 'F');
      doc.setFontSize(13);
      doc.setTextColor(122, 90, 150);
      doc.text('Icono', 18, startY + 9);
      doc.text('Categoría', 48, startY + 9);
      doc.text('Valor', 140, startY + 9);
      let rowY = startY + 14;
      metricRows.forEach(([icon, categoria, valor]) => {
        // Icono muy pequeño y alineado
        const iconFile = iconMap[icon];
        if (iconFile) {
          try {
            doc.addImage(`/icons/${iconFile}`, 'PNG', 16, rowY - 4, 6, 6);
          } catch (e) {
            doc.setFontSize(9);
            doc.setTextColor(180, 166, 214);
            doc.text(icon, 18, rowY + 2);
          }
        } else {
          doc.setFontSize(9);
          doc.setTextColor(180, 166, 214);
          doc.text(icon, 18, rowY + 2);
        }
        // Categoría y valor
        doc.setFontSize(12);
        doc.setTextColor(48, 32, 65);
        doc.text(categoria, 48, rowY + 2);
        doc.text(valor, 140, rowY + 2);
        rowY += 12;
      });
      let y = startY + metricRows.length * 12 + 18;
      // Tablas semanales detalladas
      const metricsWeekly = [
        { label: 'Recuperación', data: recoveryPctWeek, unit: '%'},
        { label: 'Desempeño del Sueño', data: sleepPerfWeek, unit: '%'},
        { label: 'Calorías', data: caloriesWeek, unit: 'kcal'},
      ];
      metricsWeekly.forEach((m, idx) => {
        // Salto de página antes de la tabla de Desempeño del Sueño
        if (m.label === 'Desempeño del Sueño') {
          doc.addPage();
          y = 20;
        }
        const promedio = (m.data.reduce((a, b) => a + b, 0) / m.data.length).toFixed(2);
        const max = Math.max(...m.data).toFixed(2);
        const min = Math.min(...m.data).toFixed(2);
        const tendencia = m.data[m.data.length - 1] > m.data[0] ? '↑' : m.data[m.data.length - 1] < m.data[0] ? '↓' : '-';
        const table = weekDays.map((d, i) => [d, `${m.data[i]}${m.unit}`]);
        autoTable(doc, {
          startY: y,
          head: [[m.label, 'Valor']],
          body: table,
          theme: 'grid',
          headStyles: { fillColor: [180, 166, 214] },
          styles: { fontSize: 11, cellPadding: 2 }
        });
        y = doc.lastAutoTable.finalY + 2;
        autoTable(doc, {
          startY: y,
          head: [['Promedio', 'Máximo', 'Mínimo', 'Tendencia']],
          body: [[`${promedio}${m.unit}`, `${max}${m.unit}`, `${min}${m.unit}`, tendencia]],
          theme: 'plain',
          styles: { fontSize: 10, cellPadding: 2 }
        });
        y = doc.lastAutoTable.finalY + 8;
      });
      // --- NUEVO: Tarjeta semanal de actividad física ---
      if (weekWorkouts.length > 0) {
        doc.addPage();
        let yAF = 20;
        autoTable(doc, {
          startY: yAF,
          head: [['Tipo de actividad física', 'Fecha', 'Esfuerzo', 'Minutos', 'Calorías']],
          body: weekWorkouts.map(w => [
            sportMap[w.sport_id] || 'Otro',
            new Date(w.start).toLocaleDateString('es-MX'),
            w.score?.strain?.toFixed(1) ?? '-',
            Math.round((new Date(w.end)-new Date(w.start))/(1000*60)),
            w.score?.calories ? Math.round(w.score.calories) : (w.score?.kilojoule ? Math.round(w.score.kilojoule*0.239006) : '-')
          ]),
          theme: 'grid',
          headStyles: { fillColor: [180, 166, 214] },
          styles: { fontSize: 10, cellPadding: 2 }
        });
        y = doc.lastAutoTable.finalY + 8;
      }
      // Salto de página para explicación y recomendaciones
      doc.addPage();
      y = 20;
      doc.setFontSize(13);
      doc.setTextColor(122, 90, 150);
      doc.text('Explicación de métricas:', 10, y);
      y += 8;
      // Explicación de cada métrica en párrafos
      const metricExplanations = [
        { key: 'Calorías', desc: 'Cantidad total de energía gastada durante el día. Refleja el gasto energético por actividad física y metabolismo basal.' },
        { key: 'VFC', desc: 'Variabilidad de la Frecuencia Cardíaca. Indica el estado de recuperación y adaptación al estrés.' },
        { key: 'Sueño Profundo', desc: 'Horas de sueño profundo, fase esencial para la recuperación física y mental.' },
        { key: 'Duración del Sueño', desc: 'Cantidad total de horas dormidas. Fundamental para el bienestar general.' },
        { key: 'Recuperación', desc: 'Porcentaje que indica el nivel de recuperación del cuerpo según biomarcadores.' },
        { key: 'Esfuerzo', desc: 'Carga cardiovascular acumulada durante el día. Relacionada con la intensidad de la actividad física.' },
        { key: 'Desempeño del Sueño', desc: 'Porcentaje de cumplimiento de la meta de sueño según necesidades individuales.' },
      ];
      doc.setFontSize(11);
      doc.setTextColor(48, 32, 65);
      metricExplanations.forEach((m) => {
        const expl = doc.splitTextToSize(`${m.key}: ${m.desc}`, 170);
        doc.text(expl, 10, y);
        y += expl.length * 6 + 4;
      });
      y += 8;
      doc.setFontSize(13);
      doc.setTextColor(122, 90, 150);
      doc.text('Recomendaciones personalizadas:', 10, y);
      y += 8;
      // Recomendaciones en párrafos
      const mainMetrics = [
        { key: 'Calorías', value: validatedCalories },
        { key: 'VFC', value: hrv },
        { key: 'Sueño Profundo', value: sleepDeep },
        { key: 'Duración del Sueño', value: sleepDuration },
        { key: 'Recuperación', value: recoveryPct },
        { key: 'Esfuerzo', value: strain },
        { key: 'Desempeño del Sueño', value: sleepPerfPct },
      ];
      doc.setFontSize(11);
      doc.setTextColor(48, 32, 65);
      mainMetrics.forEach((m) => {
        const expl = doc.splitTextToSize(`${m.key}: ${getInterpretacion(m.key, m.value)}`, 170);
        doc.text(expl, 10, y);
        y += expl.length * 6 + 4;
      });
      // Guardar PDF
      doc.save(`reporte_biometrico_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert('Error al generar el PDF.');
      console.error(error);
    }
  };

  // Popup de desglose de entrenamientos
  const WorkoutDetailPopup = ({open, onClose, workouts, sportMap}) => {
    if (!open) return null;
    return (
      <div className="biometricos-popup-overlay" onClick={onClose}>
        <div className="biometricos-popup-content" onClick={e=>e.stopPropagation()} style={{maxWidth: 900, width: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: 40, borderRadius: 20}}>
          <button className="biometricos-popup-close" onClick={onClose}>&times;</button>
          <h2 className="biometricos-popup-title" style={{color: '#7a5a96', marginBottom: 24}}>Entrenamientos de la semana</h2>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 16}}>
            <thead>
              <tr style={{background: '#faf7fd', color: '#7a5a96'}}>
                <th style={{padding: 8, borderBottom: '2px solid #ede3f6'}}>Tipo</th>
                <th style={{padding: 8, borderBottom: '2px solid #ede3f6'}}>Fecha</th>
                <th style={{padding: 8, borderBottom: '2px solid #ede3f6'}}>Esfuerzo</th>
                <th style={{padding: 8, borderBottom: '2px solid #ede3f6'}}>Minutos</th>
                <th style={{padding: 8, borderBottom: '2px solid #ede3f6'}}>Calorías</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w, i) => (
                <tr key={w.id} style={{background: i%2===0 ? '#fff' : '#f7f3fa'}}>
                  <td style={{padding: 8}}>{sportMap[w.sport_id] || 'Otro'}</td>
                  <td style={{padding: 8}}>{new Date(w.start).toLocaleString('es-MX', {dateStyle:'medium', timeStyle:'short'})}</td>
                  <td style={{padding: 8}}>{w.score?.strain?.toFixed(1) ?? '-'}</td>
                  <td style={{padding: 8}}>{Math.round((new Date(w.end)-new Date(w.start))/(1000*60))}</td>
                  <td style={{padding: 8}}>{w.score?.calories ? Math.round(w.score.calories) : (w.score?.kilojoule ? Math.round(w.score.kilojoule*0.239006) : '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- NUEVO: actividad física de ayer ---
  const yesterdayWorkouts = workouts.filter(w => w.score_state === 'SCORED' && w.start.slice(0,10) === yesterdayStr);
  const actividadFisicaAyer = yesterdayWorkouts.length > 0
    ? `Actividad física: ${yesterdayWorkouts.map(w => sportMap[w.sport_id] || 'Otro').join(', ')}`
    : 'No se realizó actividad física';

  // --- UI ---
  if (loading) return <div className="biometricos-loading">Cargando datos de WHOOP...</div>;
  if (error) return <div className="biometricos-error">{error}</div>;

  return (
    <>
      <TopAppBar />
      <div className="main-title" style={{ marginBottom: '28px' }}>
        <h1>
          Biométricos{userProfile ? ` de ${userProfile.first_name} ${userProfile.last_name}` : ''}
        </h1>
      </div>
      {/* Barra de tabs y botón de descargar alineados en la misma fila, dentro del container */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1100px',
        margin: '0 auto 8px auto',
        padding: '10px 24px'
      }}>
        <div className="biometricos-tabs">
          <button onClick={()=>setTab('day')} className={tab==='day' ? 'active' : ''}>Ayer</button>
          <button onClick={()=>setTab('week')} className={tab==='week' ? 'active' : ''}>Semana</button>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="download-button" 
            onClick={generatePDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              background: '#7a5a96',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 2px 8px #ede3f6',
              letterSpacing: '0.5px'
            }}
          >
            <DownloadIcon /> Descargar PDF
          </button>
          {localStorage.getItem('role') === 'admin' && (
            <button 
              className="logout-button" 
              onClick={() => {
                whoopService.logout();
                navigate('/whoop-login');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: '#e17055',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(225, 112, 85, 0.2)',
                letterSpacing: '0.5px'
              }}
            >
              <LogoutIcon /> Cerrar Sesión
            </button>
          )}
        </div>
      </div>
      <div className="biometricos-container biometricos-content">
        {tab==='day' && (
          <>
          <div className="biometricos-day-cards">
            <div className="biometricos-day-group">
              <MainCard
                label="RECUPERACIÓN"
                value={recoveryPct}
                color="#7a5a96"
                onClick={()=>setShowRecoveryPopup(true)}
              />
                {showMetrics && (
                  <>
                    <MetricCard 
                      label="VFC" value={hrv} unit="ms" icon="favorite_border" color="#7a5a96"
                      expanded={expandedMetric === 'VFC'}
                      onExpand={() => setExpandedMetric(expandedMetric === 'VFC' ? null : 'VFC')}
                      description={metricDescriptions['VFC']}
                    />
                    <MetricCard 
                      label="FCR" value={rhr} unit="lpm" icon="favorite" color="#7a5a96"
                      expanded={expandedMetric === 'FCR'}
                      onExpand={() => setExpandedMetric(expandedMetric === 'FCR' ? null : 'FCR')}
                      description={metricDescriptions['FCR']}
                    />
                  </>
                )}
            </div>
            <div className="biometricos-day-group">
              <MainCard
                label="DESEMPEÑO DEL SUEÑO"
                value={sleepPerfPct}
                color="#7a5a96"
                onClick={()=>setShowSleepPopup(true)}
              />
                {showMetrics && (
                  <>
                    <MetricCard 
                      label="Sueño Profundo" value={sleepDeep} unit="h" icon="hotel" color="#7a5a96"
                      expanded={expandedMetric === 'Sueño Profundo'}
                      onExpand={() => setExpandedMetric(expandedMetric === 'Sueño Profundo' ? null : 'Sueño Profundo')}
                      description={metricDescriptions['Sueño Profundo']}
                    />
                    <MetricCard 
                      label="Duración del Sueño" value={sleepDuration} unit="h" icon="schedule" color="#7a5a96"
                      expanded={expandedMetric === 'Duración del Sueño'}
                      onExpand={() => setExpandedMetric(expandedMetric === 'Duración del Sueño' ? null : 'Duración del Sueño')}
                      description={metricDescriptions['Duración del Sueño']}
                    />
                  </>
                )}
            </div>
            <div className="biometricos-day-group">
              <MainCard
                label="ESFUERZO"
                value={strain}
                color="#7a5a96"
                onClick={()=>setShowStrainPopup(true)}
              />
                {showMetrics && (
                  <MetricCard 
                    label="Calorías" value={validatedCalories} unit="kcal" icon="local_fire_department" color="#7a5a96"
                    expanded={expandedMetric === 'Calorías'}
                    onExpand={() => setExpandedMetric(expandedMetric === 'Calorías' ? null : 'Calorías')}
                    description={metricDescriptions['Calorías']}
                  />
                )}
              </div>
            </div>
            <button 
              className="main-button" 
              onClick={() => setShowMetrics(!showMetrics)}
            >
              {showMetrics ? 'Ocultar métricas detalladas' : 'Ver métricas detalladas'}
            </button>
          </>
        )}
        {tab==='week' && renderWeeklySummary()}
      </div>
      {showRecoveryPopup && yesterdayRecovery && (
        <RecoveryDetailPopup onClose={()=>setShowRecoveryPopup(false)} data={yesterdayRecovery} />
      )}
      {showSleepPopup && yesterdaySleep && (
        <SleepDetailPopup onClose={()=>setShowSleepPopup(false)} data={yesterdaySleep} />
      )}
      {showStrainPopup && yesterdayCycle && (
        <StrainDetailPopup onClose={()=>setShowStrainPopup(false)} data={yesterdayCycle} yesterdayWorkouts={yesterdayWorkouts} sportMap={sportMap} />
      )}
      {expandedMetric === 'Desempeño del Sueño' && (
        <WeeklyDetailPopup
          open={true}
          onClose={()=>setExpandedMetric(null)}
          title="Desempeño del Sueño"
          data={sleepPerfWeek}
          color="#7a5a96"
          weekDays={weekDays}
          unit="%"
        />
      )}
      {expandedMetric === 'Recuperación' && (
        <WeeklyDetailPopup
          open={true}
          onClose={()=>setExpandedMetric(null)}
          title="Recuperación"
          data={recoveryPctWeek}
          color="#a892c5"
          weekDays={weekDays}
          unit="%"
        />
      )}
      {expandedMetric === 'Esfuerzo' && (
        <WeeklyDetailPopup
          open={true}
          onClose={()=>setExpandedMetric(null)}
          title="Esfuerzo"
          data={caloriesWeek}
          color="#a892c5"
          weekDays={weekDays}
          unit="kcal"
        />
      )}
      <WorkoutDetailPopup open={showWorkoutPopup} onClose={()=>setShowWorkoutPopup(false)} workouts={weekWorkouts} sportMap={sportMap} />
    </>
  );
};

const RecoveryDetailPopup = ({onClose, data}) => {
  const score = data?.score || {};
  const metrics = [
    { label: 'Variabilidad de la Frecuencia Cardíaca', value: score.hrv_rmssd_milli, unit: 'ms', format: v => Math.round(v) },
    { label: 'Frecuencia Cardíaca en Reposo', value: score.resting_heart_rate, unit: 'lpm', format: v => Math.round(v) },
    { label: 'Desempeño del Sueño', value: score.sleep_performance_percentage, unit: '%', format: v => v },
    { label: 'Horas vs Necesarias', value: score.sleep_needed?.sleep_needed_vs_actual_percentage, unit: '%', format: v => v },
    { label: 'Consistencia del Sueño', value: score.sleep_consistency_percentage, unit: '%', format: v => v },
    { label: 'Estrés de Sueño Alto', value: score.high_sleep_stress_percentage, unit: '%', format: v => v },
  ];
  return (
    <div className="biometricos-popup-overlay" onClick={onClose}>
      <div className="biometricos-popup-content" onClick={e=>e.stopPropagation()}>
        <button className="biometricos-popup-close" onClick={onClose}>&times;</button>
        <h2 className="biometricos-popup-title">RECUPERACIÓN</h2>
        <div className="biometricos-popup-value" style={{color: '#a892c5'}}>
          {score.recovery_score !== undefined ? Math.round(score.recovery_score) : '--'}%
        </div>
        <div className="biometricos-popup-metrics">
          {metrics.filter(m => m.value !== undefined).map(m => (
            <MetricRow key={m.label} label={m.label} value={m.format ? m.format(m.value) : m.value} unit={m.unit} />
          ))}
        </div>
        <div className="biometricos-popup-interpret">
          <span>Interpretación</span>
          <div>
            {score.recovery_score >= 67 ? 'Tu cuerpo está bien recuperado, ¡aprovecha para entrenar fuerte!' : score.recovery_score >= 34 ? 'Recuperación moderada, escucha a tu cuerpo y ajusta la intensidad.' : 'Recuperación baja, prioriza descanso y recuperación.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const SleepDetailPopup = ({onClose, data}) => {
  const score = data?.score || {};
  console.log('Sleep Data Score:', score);
  console.log('Sleep Consistency:', score.sleep_consistency_percentage);
  const metrics = [
    { label: 'Horas vs Necesarias', value: score.sleep_needed?.sleep_needed_vs_actual_percentage, unit: '%', format: v => v },
    { label: 'Consistencia del Sueño', value: score.sleep_consistency_percentage, unit: '%', format: v => v },
    { label: 'Eficiencia del Sueño', value: score.sleep_efficiency_percentage, unit: '%', format: v => Number(v).toFixed(2) },
    { label: 'Estrés de Sueño Alto', value: score.high_sleep_stress_percentage, unit: '%', format: v => v },
  ];
  console.log('Filtered Metrics:', metrics.filter(m => m.value !== undefined));
  let interpretacion = 'No hay suficientes datos.';
  if (score.sleep_performance_percentage >= 85) {
    interpretacion = '¡Excelente sueño! Tu cuerpo está bien recuperado.';
  } else if (score.sleep_performance_percentage >= 70) {
    interpretacion = 'Buen sueño, pero puedes mejorar la consistencia y eficiencia para optimizar tu recuperación.';
  } else if (score.sleep_performance_percentage > 0) {
    interpretacion = 'Tu sueño fue moderado. Intenta mejorar la consistencia y eficiencia para optimizar tu recuperación.';
  }
  return (
    <div className="biometricos-popup-overlay" onClick={onClose}>
      <div className="biometricos-popup-content" onClick={e=>e.stopPropagation()}>
        <button className="biometricos-popup-close" onClick={onClose}>&times;</button>
        <h2 className="biometricos-popup-title">DESEMPEÑO DEL SUEÑO</h2>
        <div className="biometricos-popup-value" style={{color: '#7a5a96'}}>
          {score.sleep_performance_percentage !== undefined ? score.sleep_performance_percentage : '--'}%
        </div>
        <div className="biometricos-popup-metrics">
          {metrics.filter(m => m.value !== undefined).map(m => (
            <MetricRow key={m.label} label={m.label} value={m.format ? m.format(m.value) : m.value} unit={m.unit} />
          ))}
        </div>
        <div className="biometricos-popup-interpret">
          <span>Interpretación</span>
          <div>{interpretacion}</div>
        </div>
      </div>
    </div>
  );
};

const StrainDetailPopup = ({onClose, data, yesterdayWorkouts = [], sportMap = {}}) => {
  const score = data?.score || {};
  const metrics = [
    { label: 'Calorías', value: score.calories ? Math.round(score.calories) : (score.kilojoule ? Math.round(score.kilojoule * 0.239006) : undefined), unit: 'kcal' },
    { label: 'Minutos en Zonas FC 1-3', value: score.zone_duration_1_3_milli ? (score.zone_duration_1_3_milli / (1000*60)).toFixed(0) : undefined, unit: 'min' },
    { label: 'Minutos en Zonas FC 4-5', value: score.zone_duration_4_5_milli ? (score.zone_duration_4_5_milli / (1000*60)).toFixed(0) : undefined, unit: 'min' },
    { label: 'Tiempo de Actividad de Fuerza', value: score.strength_training_milli ? (score.strength_training_milli / (1000*60)).toFixed(0) : undefined, unit: 'min' },
  ];
  return (
    <div className="biometricos-popup-overlay" onClick={onClose}>
      <div className="biometricos-popup-content" onClick={e=>e.stopPropagation()}>
        <button className="biometricos-popup-close" onClick={onClose}>&times;</button>
        <h2 className="biometricos-popup-title">ESFUERZO</h2>
        <div className="biometricos-popup-value" style={{color: '#a892c5'}}>
          {score.strain ? Number(score.strain).toFixed(2) : '--'}
        </div>
        <div className="biometricos-popup-metrics">
          {metrics.filter(m => m.value !== undefined).map(m => (
            <MetricRow key={m.label} label={m.label} value={m.value} unit={m.unit} />
          ))}
        </div>
        {/* Desglose de actividades físicas */}
        <div style={{margin: '18px 0 0 0'}}>
          {yesterdayWorkouts.length > 0 ? (
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 15, marginTop: 8}}>
              <thead>
                <tr style={{background: '#faf7fd', color: '#7a5a96'}}>
                  <th style={{padding: 6, borderBottom: '2px solid #ede3f6'}}>Tipo</th>
                  <th style={{padding: 6, borderBottom: '2px solid #ede3f6'}}>Esfuerzo</th>
                  <th style={{padding: 6, borderBottom: '2px solid #ede3f6'}}>Minutos</th>
                  <th style={{padding: 6, borderBottom: '2px solid #ede3f6'}}>Calorías</th>
                </tr>
              </thead>
              <tbody>
                {yesterdayWorkouts.map((w, i) => (
                  <tr key={w.id} style={{background: i%2===0 ? '#fff' : '#f7f3fa'}}>
                    <td style={{padding: 6}}>{sportMap[w.sport_id] || 'Otro'}</td>
                    <td style={{padding: 6}}>{w.score?.strain?.toFixed(1) ?? '-'}</td>
                    <td style={{padding: 6}}>{Math.round((new Date(w.end)-new Date(w.start))/(1000*60))}</td>
                    <td style={{padding: 6}}>{w.score?.calories ? Math.round(w.score.calories) : (w.score?.kilojoule ? Math.round(w.score.kilojoule*0.239006) : '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{color: '#7a5a96', fontWeight: 500, fontSize: 15, textAlign: 'center'}}>No se realizó actividad física</div>
          )}
        </div>
        <div className="biometricos-popup-interpret">
          <span>Interpretación</span>
          <div>
            {score.strain >= 10 ? 'Alta carga cardiovascular, tu cuerpo ha trabajado duro.' : score.strain >= 6 ? 'Carga moderada, buen trabajo.' : 'Carga baja, considera aumentar la actividad física si tu recuperación lo permite.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({label, value, unit}) => (
  <div className="biometricos-metric-row">
    <span className="biometricos-metric-row-label">{label}</span>
    <span className="biometricos-metric-row-value">{(value === null || value === undefined) ? '-' : value} <span className="biometricos-metric-row-unit">{unit}</span></span>
  </div>
);

export default Biometricos;