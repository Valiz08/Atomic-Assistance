import { useNavigate } from 'react-router-dom';
import styles from './landing.module.css';

const Landing = () => {
  const navigate = useNavigate();

  const handlerLogin = () => {
      navigate("/login");
  }
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles["inner-header"]}></div>

        <section className={styles.headerTitle}>
          <div className={styles.headerContent}>
            <h1>Atomic Assistance</h1>
            <p>
              Responde automáticamente a tus clientes por WhatsApp.
              Recoge pedidos, agenda citas y responde dudas, 24/7.
              Sube un PDF con tu información. La IA se encarga del resto.
            </p>
          </div>
          <button className={styles["cta-button"]} onClick={handlerLogin}>Inicia Sesión</button>
        </section>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2>¿Qué es Atomic Assistance?</h2>
          <p>
            Una herramienta pensada para autónomos y pequeños negocios.
            Responde por ti en WhatsApp usando inteligencia artificial entrenada con tus propios documentos: menú, catálogo, lista de precios o cualquier PDF.
          </p>
          <div className={styles.card}>Subes un PDF con la información de tu negocio (menú, servicios, precios…).</div>
          <div className={styles.card}>La IA aprende tu contenido en segundos.</div>
          <div className={styles.card}>Tus clientes escriben por WhatsApp.</div>
          <div className={styles.card}>La IA responde automáticamente con la información correcta.</div>
          <div className={styles.card}>Recibes pedidos, reservas o consultas, sin mover un dedo.</div>
          <div className={styles.card}>Todo se gestiona desde un panel sencillo y fácil de usar.</div>
        </section>

        <section className={styles.section}>
          <h2>¿Qué puede hacer por ti?</h2>
          <div className={styles.card}>"¿Cuál es el menú del día?" → La IA responde con lo que dice tu PDF.</div>
          <div className={styles.card}>"¿Tienes cita libre este viernes?" → La IA comprueba tu agenda y responde.</div>
          <div className={styles.card}>"¿Cuánto cuesta una revisión completa?" → La IA responde con tus precios.</div>
          <div className={styles.card}>"Quiero pedir 2 camisetas talla M" → La IA toma el pedido y te lo envía directo.</div>
        </section>

        <section className={styles.section}>
          <h2>Planes y precios</h2>
          <div className={styles.card}>
            <ul>
              <li><strong>Básico:</strong> Gratis — 200 mensajes/mes, 1 PDF</li>
              <li><strong>Pro:</strong> 19€/mes — 2.000 mensajes, múltiples PDFs, reservas</li>
              <li><strong>Premium:</strong> 39€/mes — Todo lo anterior + analítica y soporte prioritario</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Lo que dicen nuestros clientes</h2>
          <div className={styles.card}>
            <em>
              "Desde que uso Atomic Assistance, no pierdo reservas por no contestar a tiempo.
              Es como tener un recepcionista virtual."
            </em>
            <br />— Ana, Esteticista autónoma
          </div>
        </section>

        <section className={styles.section} style={{ textAlign: 'center' }}>
          <h2>Empieza hoy</h2>
          <button className={styles["cta-button"]} onClick={handlerLogin}>Crea tu asistente gratis</button>
        </section>
      </main>

      <footer className={styles.footer}>
        © 2025 Atomic Assistance · Contacto · Política de privacidad · Aviso legal
      </footer>
    </div>
  );
};

export default Landing;
