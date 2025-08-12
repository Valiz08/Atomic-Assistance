import Header from '../../components/header/header';
import styles from './dashboard.module.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

export default function Dashboard(){
    const session = useSelector((state: RootState) => state.user.session);
    const navigate = useNavigate();


    const handlerSecction = (e: string) => {
        if(e == 'settings'){
            navigate("/settings");
        }
    }
    return(
        <>
            <Header/>
            <section className={styles.dashboard}>
                <h1 className={styles.header}>Panel de Administración</h1>
                <p className={styles.welcome}>Bienvenido, <strong>{session.username}</strong></p>

                <section className={styles.cardsGrid}>
                    <div className={`${styles.card} ${styles.card1}`}>
                    <h3>🔔Notificaciones</h3>
                    <p><strong>20</strong> pendientes</p>
                    </div>
                    <div className={`${styles.card} ${styles.card2}`}>
                    <h3>💬Mensajes</h3>
                    <p><strong>3</strong> nuevas conversaciones</p>
                    </div>
                    <div className={`${styles.card} ${styles.card3}`} onClick={() => handlerSecction('settings')}>
                    <h3>⚙️Configuración</h3>
                    <p>Configura tu plataforma</p>
                    </div>
                </section>
            </section>
        </>
    )
}