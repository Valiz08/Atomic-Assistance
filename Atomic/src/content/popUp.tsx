import React, { useEffect, useRef, useState } from "react";
import styles from "./popUp.module.css";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function PopUp() {
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hola, soy Atom! ¿En qué puedo ayudarte?" },
    ]);
    const [minimized, setMinimized] = useState(false);
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
                const res = await fetch("http://localhost:3001/api/ask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: value }),
                });
                const data = await res.json();
                setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
            } catch (err) {
                setMessages(prev => [...prev, { from: "bot", text: "Error al conectar con la IA." }]);
            }
        }
    };
    console.log(minimized)
    return (
        <>
        <div className={`${minimized ? styles["minimized"] : styles["popUp"]}`}>
            <div className={styles["bodyPopUp"]}>
                <section className={styles["header"]}>
                    <div className={styles["headerContent"]}>
                        <img src="atom.png" alt="atom" className={styles["atom"]}/>
                        <h2>Atomic Assistance</h2>
                    </div>
                    <button
                        className={styles["closeBttn"]}
                        onClick={() => setMinimized(!minimized)}
                    >
                        <KeyboardArrowDownIcon/>
                    </button>
                </section>
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
                                className={styles.inputmssg}
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
            </div>
        </div>
            <button
                className={styles["restoreBttn"]}
                onClick={() => setMinimized((prev) => !prev)}
                aria-label={minimized ? "Abrir chat" : "Minimizar chat"}
                style={{
                    position: "fixed",
                    bottom: "32px",
                    right: "32px",
                    zIndex: 9999,
                    borderRadius: "50%",
                    width: "56px",
                    height: "56px",
                    background: "#187caa",
                    color: "#fff",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem"
                }}
            >
                {minimized ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </button>
        </>
    );
}