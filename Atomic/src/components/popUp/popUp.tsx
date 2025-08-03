import React, { useEffect, useRef, useState } from "react";
import styles from "./popUp.module.css";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useUser } from "../../hooks/useUser";
import { useSelector } from "react-redux";
import type { RootState } from "@reduxjs/toolkit/query";

export default function Base() {
    const { ask } = useUser();
    const session = useSelector((state: RootState) => state.user.session);

    const [messages, setMessages] = useState([
        { from: "bot", text: "Hola, soy Atom! ¿En qué puedo ayudarte?" },
    ]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handlerMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem("mensaje") as HTMLInputElement;
        const value = input.value.trim();
        if (value) {
            setMessages(prev => [...prev, { from: "user", text: value }]);
            input.value = "";
            // Llama al backend
            try {
                console.log(session.id)
                const data = await ask(value, session.id);
                setMessages(prev => [...prev, { from: "bot", text: data }]);
            } catch (err) {
                setMessages(prev => [...prev, { from: "bot", text: "Error al conectar con la IA." }]);
            }
        }
    };
    return (
        <>
            <section className={styles["bodyChat"]}>
                {messages.map((msg, idx) =>
                    msg.from === "bot" ? (
                        <div key={idx} className={styles["chatBotResponse"]}>
                            <img src="atom.png" alt="atom" className={styles["atom"]}/>
                            <p className={styles["mssgBot"]}>{msg.text}</p>
                        </div>
                    ) : (
                        <div key={idx} className={styles["userResponse"]}>
                            <p className={styles["mssgUser"]}>{msg.text}</p>
                        </div>
                    )
                )}
                <div ref={messagesEndRef} />
            </section>
            <section className={styles["footer"]}>
                <div className={styles["footerContent"]}>
                    <form
                        style={{ display: "flex", width: "100%" }}
                        onSubmit={handlerMessage}
                    >
                        <input
                            placeholder="Mensaje..."
                            required={true}
                            className={styles["inputMessage"]}
                            name="mensaje"
                        />
                        <button
                            type="submit"
                            className="material-symbols-outlined"
                        >
                            <KeyboardArrowUpIcon />
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}