import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import styles from './login.module.css';

const Login = () => {
    const { login } = useUser();
    const { setAuthenticated } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handlerAuth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const mssg = await login(username, password);
            if (mssg) {
                setAuthenticated(true);
                navigate(mssg === '__superroot__' ? '/admin' : '/dashboard');
            }
        } catch (err) {}
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handlerAuth}>
                <div className={styles.formHead}>
                    <span className={styles.logoMark}>A</span>
                    <h1 className={styles.title}>Iniciar sesión</h1>
                    <p className={styles.subtitle}>Accede a tu panel de Atomic Assistance</p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="username">Usuario</label>
                    <input
                        id="username"
                        className={styles.input}
                        type="text"
                        placeholder="Tu nombre de usuario"
                        autoComplete="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">Contraseña</label>
                    <div className={styles.passwordWrap}>
                        <input
                            id="password"
                            className={styles.input}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.eyeBtn}
                            onClick={() => setShowPassword(v => !v)}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {showPassword ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button type="submit" className={styles.submitBtn}>Entrar</button>
            </form>
        </div>
    );
};

export default Login;
