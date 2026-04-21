import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import styles from './login.module.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';

const inputSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
        background: '#0d0d18',
        borderRadius: '6px',
        color: '#e8e8f0',
        '& fieldset': {
            borderColor: 'rgba(255,255,255,0.12)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.24)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#6366f1',
            boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#50506a',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#6366f1',
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: '#50506a',
    },
    '& input': {
        color: '#e8e8f0',
    },
};

const Login = () => {
    const { login } = useUser();
    const { setAuthenticated } = useAuth();
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const navigate = useNavigate();
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handlerAuth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const mssg = await login(username, password);
            if(mssg) {
                setAuthenticated(true);
                navigate("/dashboard");
            }
        } catch (err) {}
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handlerAuth}>
                <h1>Iniciar Sesión</h1>
                <TextField
                    id="outlined-basic"
                    label="Nombre de usuario"
                    variant="outlined"
                    onChange={(e) => setUsername(e.target.value)}
                    sx={inputSx}
                />
                <FormControl variant="outlined" sx={inputSx}>
                    <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        onChange={(e) => setPassword(e.target.value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    onMouseUp={handleMouseUpPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Contraseña"
                    />
                </FormControl>
                <button type="submit" className={styles["cta-button"]}>Entrar</button>
            </form>
            <p className={styles.registerPrompt}>
                ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
            </p>
        </div>
    );
};

export default Login;
