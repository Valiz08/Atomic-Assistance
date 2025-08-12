import styles from "./bases.module.css";
import PopUp from "./popUp/popUp";
import Auth from "./auth/auth";
import { useSelector } from "react-redux";
import type { RootState } from '../store/store';

export default function Base() {
    const session = useSelector((state: RootState) => state.user.session);

    console.log(session);
    return (
        <>
        <div className={`${styles["popUp"]}`}>
            <div className={`${styles["bodyPopUp"]} ${styles["no-drag"]}`}>
                <section className={styles["header"]}>
                    <div className={styles["headerContent"]}>
                        <img src="atom.png" alt="atom" className={styles["atom"]}/>
                        <h2>Atomic Assistance</h2>
                    </div>
                </section>
                <>{session ? console.log('popUp') : console.log('auth')}</>
                <>{session ? <PopUp/> : <Auth/>}</>
            </div>
        </div>
        </>
    );
}