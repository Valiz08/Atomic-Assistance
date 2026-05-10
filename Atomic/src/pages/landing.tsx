import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import styles from './landing.module.css';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Respuestas automáticas 24/7',
    desc: 'La IA atiende a tus clientes por WhatsApp en cualquier momento, sin que tengas que estar pendiente.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: 'Entrenada con tu PDF',
    desc: 'Sube tu catálogo, menú o tarifas en PDF. La IA aprende tu negocio y responde con tu información exacta.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Agenda de citas integrada',
    desc: 'Los clientes pueden reservar cita directamente por WhatsApp. La agenda se actualiza sola, con sub-columnas por empleado.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Recordatorios automáticos',
    desc: '24 horas antes de cada cita, la IA envía un recordatorio por WhatsApp. Sin olvidos, sin cancelaciones de última hora.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Gestión de equipo',
    desc: 'Añade a tus empleados con su especialidad. La IA asigna automáticamente el profesional correcto según lo que pida el cliente.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Panel de control',
    desc: 'Revisa conversaciones, activa o pausa la IA, gestiona citas y configura tu negocio desde un panel web sencillo.',
  },
];

const STEPS = [
  { n: '01', title: 'Sube tu PDF', desc: 'Sube tu catálogo, menú, tarifas o cualquier documento con la información de tu negocio.' },
  { n: '02', title: 'Conecta WhatsApp', desc: 'Vincula tu número de WhatsApp Business en menos de 5 minutos con nuestra guía paso a paso.' },
  { n: '03', title: 'La IA trabaja por ti', desc: 'Tu asistente empieza a responder, agendar citas y enviar recordatorios de forma completamente automática.' },
];

const UNLIMITED_PERKS = [
  { icon: '∞', label: 'Mensajes ilimitados', desc: 'Sin cuotas, sin contadores, sin sustos a final de mes. Tu IA habla con todos tus clientes, siempre.' },
  { icon: '🤖', label: 'IA sin coste por token', desc: 'No pagas por cada respuesta generada. La inteligencia artificial trabaja para ti sin coste adicional.' },
  { icon: '📅', label: 'Citas y recordatorios sin límite', desc: 'Agenda todas las reservas que necesites y envía recordatorios automáticos sin restricción alguna.' },
  { icon: '📄', label: 'PDFs y actualizaciones libres', desc: 'Sube, actualiza y reemplaza tus documentos de entrenamiento cuando quieras, sin penalizaciones.' },
  { icon: '👥', label: 'Equipo sin restricciones', desc: 'Añade todos los empleados que tenga tu negocio. La IA los conoce y asigna cada cliente al profesional correcto.' },
  { icon: '⚡', label: 'Soporte prioritario incluido', desc: 'Acceso directo a nuestro equipo. Estamos contigo desde la configuración hasta el día a día.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  return (
    <div className={styles.root}>

      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <span className={styles.navLogo}>
          <span className={styles.logoMark}>A</span>
          Atomic Assistance
        </span>
        <div className={styles.navRight}>
          <button className={styles.themeBtn} onClick={toggle} title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button className={styles.navCta} onClick={() => navigate('/login')}>Iniciar sesión</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroDots} />
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Disponible para talleres y clínicas
          </span>
          <h1 className={styles.heroTitle}>
            Tu asistente de<br />
            <span className={styles.heroGradient}>WhatsApp con IA</span>
          </h1>
          <p className={styles.heroSub}>
            Responde a tus clientes, agenda citas y envía recordatorios de forma automática —
            sin código, sin complicaciones. Solo sube un PDF y listo.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.ctaPrimary} onClick={() => navigate('/login')}>
              Empieza gratis
            </button>
            <button className={styles.ctaSecondary} onClick={() => navigate('/login')}>
              Ver demo →
            </button>
          </div>

          {/* Chat mockup */}
          <div className={styles.mockup}>
            <div className={styles.mockupBar}>
              <span className={styles.mockupDot} style={{ background: '#ef4444' }} />
              <span className={styles.mockupDot} style={{ background: '#f59e0b' }} />
              <span className={styles.mockupDot} style={{ background: '#10b981' }} />
              <span className={styles.mockupTitle}>WhatsApp · Taller García</span>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.msgLeft}>
                <div className={styles.msgBubble}>Hola, ¿tenéis hueco mañana para una revisión?</div>
                <span className={styles.msgTime}>14:32</span>
              </div>
              <div className={styles.msgRight}>
                <div className={styles.msgBubble}>¡Hola! 👋 Sí, mañana tenemos libre a las 9:00 y a las 11:00. ¿Cuál te viene mejor?</div>
                <span className={styles.msgTime}>14:32 · IA ✓✓</span>
              </div>
              <div className={styles.msgLeft}>
                <div className={styles.msgBubble}>A las 9 perfecto, me llamo Carlos García</div>
                <span className={styles.msgTime}>14:33</span>
              </div>
              <div className={styles.msgRight}>
                <div className={styles.msgBubble}>Perfecto Carlos, cita confirmada para mañana a las 9:00. Te enviaremos un recordatorio esta tarde. 🔧</div>
                <span className={styles.msgTime}>14:33 · IA ✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <div className={styles.trustBar}>
        <span className={styles.trustLabel}>Compatible con</span>
        <span className={styles.trustBadge}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp Business API
        </span>
        <span className={styles.trustBadge}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          Respuestas en &lt; 2 seg
        </span>
        <span className={styles.trustBadge}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          GDPR compliant
        </span>
      </div>

      {/* ── FEATURES ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Todo lo que necesita tu negocio</h2>
          <p className={styles.sectionSub}>Una plataforma completa para automatizar la atención al cliente de principio a fin.</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>En marcha en 3 pasos</h2>
          <p className={styles.sectionSub}>Sin conocimientos técnicos. Sin instalaciones. Sin complicaciones.</p>
        </div>
        <div className={styles.stepsGrid}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TODO INCLUIDO ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.unlimitedBadge}>Sin límites. Sin sorpresas.</span>
          <h2 className={styles.sectionTitle}>Contrata y olvídate de los contadores</h2>
          <p className={styles.sectionSub}>
            Con Atomic Assistance no pagas por mensaje, no pagas por token, no pagas por cita.<br />
            Un único precio. Todo ilimitado. Tu negocio funcionando solo, 24 horas al día.
          </p>
        </div>
        <div className={styles.unlimitedGrid}>
          {UNLIMITED_PERKS.map((p, i) => (
            <div key={i} className={styles.unlimitedCard}>
              <span className={styles.unlimitedIcon}>{p.icon}</span>
              <div>
                <h3 className={styles.unlimitedLabel}>{p.label}</h3>
                <p className={styles.unlimitedDesc}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.unlimitedCta}>
          <p className={styles.unlimitedCtaText}>
            ¿Quieres saber qué puede hacer Atomic Assistance por tu negocio?
          </p>
          <button className={styles.ctaPrimary} onClick={() => navigate('/login')}>
            Hablar con nosotros →
          </button>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.testimonial}>
          <svg className={styles.quoteIcon} viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
          <p className={styles.testimonialText}>
            Desde que uso Atomic Assistance no pierdo ninguna reserva por no contestar a tiempo. Es como tener un recepcionista que trabaja 24 horas.
          </p>
          <div className={styles.testimonialAuthor}>
            <div className={styles.testimonialAvatar}>A</div>
            <div>
              <strong>Ana Martínez</strong>
              <span>Fisioterapeuta · Clínica Salud+</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>¿Listo para automatizar tu negocio?</h2>
        <p className={styles.ctaSub}>Empieza hoy gratis. Sin tarjeta de crédito.</p>
        <button className={styles.ctaPrimary} style={{ fontSize: '1rem', padding: '0.85em 2.5em' }} onClick={() => navigate('/login')}>
          Crear mi asistente gratis
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>
          <span className={styles.logoMark} style={{ width: 22, height: 22, fontSize: '0.7rem' }}>A</span>
          Atomic Assistance
        </span>
        <span>© 2025 · Contacto · Privacidad · Aviso legal</span>
      </footer>
    </div>
  );
};

export default Landing;
