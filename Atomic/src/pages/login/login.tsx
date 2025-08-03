import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import styles from './login.module.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

const Login = () => {
    const { login } = useUser();
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
                const payload = {
                sub: username,
                exp: Math.floor(Date.now() / 1000) + 3600,
                };
                const mockToken =
                'header.' + btoa(JSON.stringify(payload)) + '.signature';
                localStorage.setItem('token', mockToken);
                navigate("/dashboard");
            }
        } catch (err) {
        }
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
                sx={{ m: 1, width: '25ch' }} // <-- igual que el FormControl
            />
            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                    <InputAdornment position="end">
                    <IconButton
                        aria-label={
                        showPassword ? 'hide the password' : 'display the password'
                        }
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                    >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    </InputAdornment>
                }
                label="Password"
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
