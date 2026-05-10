import Header from '../../components/header/header';
import styles from './dashboard.module.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { useEffect, useState } from 'react';
import { useUser } from '../../hooks/useUser';

const STAT_COLORS = [
  { icon: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  { icon: 'rgba(16,185,129,0.15)', color: '#10b981' },
  { icon: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  { icon: 'rgba(236,72,153,0.15)', color: '#ec4899' },
];

export default function Dashboard() {
  const session = useSelector((s: RootState) => s.user.session) as any;
  const navigate = useNavigate();
  const { getIAState } = useUser();
  const [iaActive, setIaActive] = useState(true);

  useEffect(() => {
    if (session?.id) getIAState(session.id).then(r => setIaActive(r.ia));
  }, [session?.id]);

  const hour = new Date().getHours();
  const greet = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  const businessLabel = session?.businessType === 'clinica' ? 'Clínica' : 'Taller';

  const stats = [
    {
      label: 'Conversaciones hoy', value: '—', note: 'Próximamente',
      bg: STAT_COLORS[0].icon, color: STAT_COLORS[0].color,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      label: 'Citas esta semana', value: '—', note: 'Ver en Agenda',
      bg: STAT_COLORS[1].icon, color: STAT_COLORS[1].color,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: 'Recordatorios enviados', value: '—', note: 'Últimos 7 días',
      bg: STAT_COLORS[2].icon, color: STAT_COLORS[2].color,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      label: 'Tipo de negocio', value: businessLabel, note: session?.businessName || 'Sin nombre configurado',
      bg: STAT_COLORS[3].icon, color: STAT_COLORS[3].color,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
  ];

  const quickActions = [
    {
      title: 'Chat con clientes',
      desc: 'Revisa y responde conversaciones de WhatsApp',
      path: '/chat',
      bg: 'rgba(99,102,241,0.12)',
      color: '#818cf8',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      title: 'Agenda de citas',
      desc: 'Gestiona y crea citas para esta semana',
      path: '/calendar',
      bg: 'rgba(16,185,129,0.12)',
      color: '#10b981',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      title: 'Configuración',
      desc: 'PDF, WhatsApp, horario y equipo',
      path: '/settings',
      bg: 'rgba(245,158,11,0.12)',
      color: '#f59e0b',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header />
      <section className={styles.page}>

        <div className={styles.pageHeader}>
          <h1 className={styles.greeting}>{greet}, {session?.username} 👋</h1>
          <p className={styles.subGreeting}>Aquí tienes un resumen de tu actividad</p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
                  {s.icon}
                </span>
              </div>
              <span className={styles.statValue} style={{ color: i < 3 ? s.color : 'var(--text-primary)', fontSize: i === 3 ? '1.4rem' : undefined }}>
                {s.value}
              </span>
              <span className={styles.statNote}>{s.note}</span>
            </div>
          ))}
        </div>

        <div className={styles.quickGrid}>
          {quickActions.map((a, i) => (
            <div key={i} className={styles.quickCard} onClick={() => navigate(a.path)}>
              <span className={styles.quickIcon} style={{ background: a.bg, color: a.color }}>
                {a.icon}
              </span>
              <div className={styles.quickText}>
                <span className={styles.quickTitle}>{a.title}</span>
                <span className={styles.quickDesc}>{a.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.statusPanel}>
          <div className={styles.statusInfo}>
            <span className={styles.statusTitle}>Asistente IA</span>
            <span className={styles.statusDesc}>
              {iaActive
                ? 'Respondiendo automáticamente a los mensajes de WhatsApp'
                : 'Pausado — los mensajes no se responden automáticamente'}
            </span>
          </div>
          <span className={`${styles.statusBadge} ${iaActive ? styles.statusActive : styles.statusPaused}`}>
            <span className={styles.statusDot} />
            {iaActive ? 'IA activa' : 'IA pausada'}
          </span>
        </div>

      </section>
    </>
  );
}
