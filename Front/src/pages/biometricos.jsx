import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Biometricos.css';
import TopAppBar from '../components/TopAppBar';
import whoopService from '../services/whoopService';

const Biometricos = () => {
  const [sleepData, setSleepData] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('day'); // 'day' o 'week'
  const [showRecoveryPopup, setShowRecoveryPopup] = useState(false);
  const [showSleepPopup, setShowSleepPopup] = useState(false);
  const [showStrainPopup, setShowStrainPopup] = useState(false);
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
        const [sleep, cycles, rec] = await Promise.all([
          whoopService.getSleepData(start.toISOString(), end.toISOString()),
          whoopService.getCycles(start.toISOString(), end.toISOString()),
          whoopService.getRecoveryData(start.toISOString(), end.toISOString())
        ]);
        setSleepData(sleep?.records || []);
        setCycleData(cycles?.records || []);
        setRecoveryData(rec?.records || []);
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
  const calories = yesterdayCycle?.score?.calories ? Number(yesterdayCycle.score.calories) : (yesterdayCycle?.score?.kilojoule ? Number((yesterdayCycle.score.kilojoule * 0.239006).toFixed(0)) : 0); // kilojoule a kcal
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
  const sleepPerfWeek = weekDays.map(day => {
    const sleep = (sleepByDay[day]||[]).find(s => !s.nap && s.score_state === 'SCORED');
    return sleep?.score?.sleep_performance_percentage ?? 0;
  });
  const recoveryPctWeek = weekDays.map(day => {
    const rec = (recoveryByDay[day]||[]).find(r => r.score_state === 'SCORED');
    return rec?.score?.recovery_score ?? 0;
  });
  const caloriesWeek = weekDays.map(day => {
    const cyc = (cycleByDay[day]||[]).find(c => c.score_state === 'SCORED');
    return cyc?.score?.calories ?? cyc?.score?.kilojoule ?? 0;
  });
  const stepsWeek = weekDays.map(day => {
    const cyc = (cycleByDay[day]||[]).find(c => c.score_state === 'SCORED');
    return cyc?.score?.steps ?? 0;
  });

  // --- UI ---
  if (loading) return <div className="biometricos-loading">Cargando datos de WHOOP...</div>;
  if (error) return <div className="biometricos-error">{error}</div>;

  return (
    <>
      <TopAppBar />
      <div className="main-title biometricos-main-title">
        <h1>Resumen Biométrico</h1>
        <div className="biometricos-tabs">
          <button onClick={()=>setTab('day')} className={tab==='day' ? 'active' : ''}>Ayer</button>
          <button onClick={()=>setTab('week')} className={tab==='week' ? 'active' : ''}>Semana</button>
        </div>
      </div>
      <div className="biometricos-container biometricos-content">
        {tab==='day' && (
          <div className="biometricos-day-cards">
            <div className="biometricos-day-group">
              <MainCard
                label="RECOVERY"
                value={recoveryPct}
                color="#FFD600"
                onClick={()=>setShowRecoveryPopup(true)}
              />
              <MetricCard label="HRV" value={hrv} unit="ms" icon="favorite_border" color="#7a5a96" />
              <MetricCard label="RHR" value={rhr} unit="bpm" icon="favorite" color="#7a5a96" />
            </div>
            <div className="biometricos-day-group">
              <MainCard
                label="SLEEP PERFORMANCE"
                value={sleepPerfPct}
                color="#7a5a96"
                onClick={()=>setShowSleepPopup(true)}
              />
              <MetricCard label="Sueño Profundo" value={sleepDeep} unit="h" icon="hotel" color="#7a5a96" />
              <MetricCard label="Duración Sueño" value={sleepDuration} unit="h" icon="schedule" color="#7a5a96" />
            </div>
            <div className="biometricos-day-group">
              <MainCard
                label="STRAIN"
                value={strain}
                color="#00BFFF"
                onClick={()=>setShowStrainPopup(true)}
              />
              <MetricCard label="Calorías" value={calories} unit="kcal" icon="local_fire_department" color="#7a5a96" />
            </div>
          </div>
        )}
        {tab==='week' && (
          <div className="biometricos-week-summary">
            <h2>Resumen Semanal</h2>
            <WeeklyBarChart title="Sleep Performance" data={sleepPerfWeek} color="#7a5a96" weekDays={weekDays} unit="%" />
            <WeeklyBarChart title="Recovery" data={recoveryPctWeek} color="#FFD600" weekDays={weekDays} unit="%" />
            <WeeklyBarChart title="Calorías" data={caloriesWeek} color="#00BFFF" weekDays={weekDays} unit="kcal" />
            <WeeklyBarChart title="Pasos" data={stepsWeek} color="#7a5a96" weekDays={weekDays} unit="" />
          </div>
        )}
      </div>
      {showRecoveryPopup && yesterdayRecovery && (
        <RecoveryDetailPopup onClose={()=>setShowRecoveryPopup(false)} data={yesterdayRecovery} />
      )}
      {showSleepPopup && yesterdaySleep && (
        <SleepDetailPopup onClose={()=>setShowSleepPopup(false)} data={yesterdaySleep} />
      )}
      {showStrainPopup && yesterdayCycle && (
        <StrainDetailPopup onClose={()=>setShowStrainPopup(false)} data={yesterdayCycle} />
      )}
    </>
  );
};

// --- COMPONENTES AUXILIARES ---
const MetricCard = ({label, value, unit, icon, color}) => (
  <div className="biometricos-metric-card">
    <span className="material-icons" style={{color, fontSize: '2.2rem',marginBottom:6}}>{icon}</span>
    <div className="biometricos-metric-label">{label}</div>
    <div className="biometricos-metric-value">{value}</div>
    <div className="biometricos-metric-unit">{unit}</div>
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

const MainCard = ({label, value, color, onClick}) => (
  <div className={`biometricos-main-card${onClick ? ' clickable' : ''}`} onClick={onClick}>
    <div className="biometricos-main-label">{label}</div>
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="54" stroke="#ede3f6" strokeWidth="12" fill="none" />
      <circle cx="60" cy="60" r="54" stroke={color} strokeWidth="12" fill="none" strokeDasharray={339.292} strokeDashoffset={label==='STRAIN'?339.292*(1-value/21):339.292*(1-value/100)} style={{transition:'stroke-dashoffset 0.5s'}}/>
      <text x="60" y="70" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#2b2b2b">{label==='STRAIN'?value:value+'%'}</text>
    </svg>
    <div className="biometricos-main-desc">{label==='STRAIN'?'Carga cardiovascular':'Recuperación'}</div>
  </div>
);

const RecoveryDetailPopup = ({onClose, data}) => {
  const score = data?.score || {};
  const metrics = [
    { label: 'Heart Rate Variability', value: score.hrv_rmssd_milli, unit: 'ms', format: v => Math.round(v) },
    { label: 'Resting Heart Rate', value: score.resting_heart_rate, unit: 'bpm', format: v => Math.round(v) },
    { label: 'Sleep Performance', value: score.sleep_performance_percentage, unit: '%', format: v => v },
    { label: 'Hours vs Needed', value: score.sleep_needed?.sleep_needed_vs_actual_percentage, unit: '%', format: v => v },
    { label: 'Sleep Consistency', value: score.sleep_consistency_percentage, unit: '%', format: v => v },
    { label: 'High Sleep Stress', value: score.high_sleep_stress_percentage, unit: '%', format: v => v },
  ];
  return (
    <div className="biometricos-popup-overlay" onClick={onClose}>
      <div className="biometricos-popup-content recovery" onClick={e=>e.stopPropagation()}>
        <button className="biometricos-popup-close recovery" onClick={onClose}>&times;</button>
        <h2 className="biometricos-popup-title recovery">RECOVERY</h2>
        <div className="biometricos-popup-value recovery">{score.recovery_score !== undefined ? Math.round(score.recovery_score) : '--'}%</div>
        <div className="biometricos-popup-metrics">
          {metrics.filter(m => m.value !== undefined).map(m => (
            <MetricRow key={m.label} label={m.label} value={m.format ? m.format(m.value) : m.value} unit={m.unit} />
          ))}
        </div>
        <div className="biometricos-popup-interpret recovery">
          <span>Interpretación:</span>
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
  const metrics = [
    { label: 'Hours vs Needed', value: score.sleep_needed?.sleep_needed_vs_actual_percentage, unit: '%', format: v => v },
    { label: 'Sleep Consistency', value: score.sleep_consistency_percentage, unit: '%', format: v => v },
    { label: 'Sleep Efficiency', value: score.sleep_efficiency_percentage, unit: '%', format: v => v },
    { label: 'High Sleep Stress', value: score.high_sleep_stress_percentage, unit: '%', format: v => v },
  ];
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
      <div className="biometricos-popup-content sleep" onClick={e=>e.stopPropagation()}>
        <button className="biometricos-popup-close sleep" onClick={onClose}>&times;</button>
        <h2 className="biometricos-popup-title sleep">SLEEP PERFORMANCE</h2>
        <div className="biometricos-popup-value sleep">{score.sleep_performance_percentage !== undefined ? score.sleep_performance_percentage : '--'}%</div>
        <div className="biometricos-popup-metrics">
          {metrics.filter(m => m.value !== undefined).map(m => (
            <MetricRow key={m.label} label={m.label} value={m.format ? m.format(m.value) : m.value} unit={m.unit} />
          ))}
        </div>
        <div className="biometricos-popup-interpret sleep">
          <span>Interpretación:</span>
          <div>{interpretacion}</div>
        </div>
      </div>
    </div>
  );
};

const StrainDetailPopup = ({onClose, data}) => {
  const score = data?.score || {};
  const metrics = [
    { label: 'Calories', value: score.calories ? Math.round(score.calories) : (score.kilojoule ? Math.round(score.kilojoule * 0.239006) : undefined), unit: 'kcal' },
    { label: 'Heart Rate Zones 1-3', value: score.zone_duration_1_3_milli ? (score.zone_duration_1_3_milli / (1000*60)).toFixed(0) : undefined, unit: 'min' },
    { label: 'Heart Rate Zones 4-5', value: score.zone_duration_4_5_milli ? (score.zone_duration_4_5_milli / (1000*60)).toFixed(0) : undefined, unit: 'min' },
    { label: 'Strength Activity Time', value: score.strength_training_milli ? (score.strength_training_milli / (1000*60)).toFixed(0) : undefined, unit: 'min' },
  ];
  return (
    <div className="biometricos-popup-overlay" onClick={onClose}>
      <div className="biometricos-popup-content strain" onClick={e=>e.stopPropagation()}>
        <button className="biometricos-popup-close strain" onClick={onClose}>&times;</button>
        <h2 className="biometricos-popup-title strain">STRAIN</h2>
        <div className="biometricos-popup-value strain">{score.strain ?? '--'}</div>
        <div className="biometricos-popup-metrics">
          {metrics.filter(m => m.value !== undefined).map(m => (
            <MetricRow key={m.label} label={m.label} value={m.value} unit={m.unit} />
          ))}
        </div>
        <div className="biometricos-popup-interpret strain">
          <span>Interpretación:</span>
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
    <span className="biometricos-metric-row-value">{value} <span className="biometricos-metric-row-unit">{unit}</span></span>
  </div>
);

export default Biometricos;

