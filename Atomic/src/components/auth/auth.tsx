import React, { useEffect, useRef, useState } from "react";
import styles from "./auth.module.css";
import { useUser } from "../../hooks/useUser";
import { Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSelector } from "react-redux";
import type { RootState } from "@reduxjs/toolkit/query";
import PopUp from "../popUp/popUp";

export default function Base() {
    const { login } = useUser();
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handlerAuth = async () => {
        try {
            const mssg = await login(username, password);
            console.log(mssg)
            if(mssg) {
                return <PopUp />;
            }
        } catch (err) {
        }
    };
    return (
        <>    
            <section className={styles["loginSection"]}>
                <h2>Iniciar Sesión</h2>
                <div className={styles["loginForm"]}>
                    <div className={styles["inputLog"]}>
                        <TextField
                            id="outlined-basic"
                            label="Nombre de usuario"
                            variant="outlined"
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ m: 1, width: '25ch' }} // <-- igual que el FormControl
                        />
                    </div>
                    <div className={styles["inputLog"]}>
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
                    </div>
                    <Button onClick={handlerAuth} variant="contained">Login</Button>
                </div>
            </section>
        </>
    );
}