import { useSelector } from "react-redux";
import Header from "../../components/header/header";
import styles from "./settings.module.css"
import React, { useState, type FormEvent } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { RootState } from "@reduxjs/toolkit/query";
import { useUser } from "../../hooks/useUser";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



export default function Settings(){

    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const session = useSelector((state: RootState) => state.user.session);
    const { uploadFile } = useUser()


    function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        }
    }

    const handlerSubmit = async(event: FormEvent<HTMLButtonElement>) =>{
        event.preventDefault();
        if(file) {
            const mssg = await uploadFile(session.id, file);
        }else{
            console.error('No se puede subir, si esta vacio');
        }
    }

    function onLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }
    return (
        <>
            <Header/>
            <section className={styles.dashboard}>
                <div style={{width: "100%"}}>
                    <section className={styles["grid"]}>
                        <div >
                            {file ? (
                                <div className={styles.views}
                                >
                                    <Document file={file} onLoadSuccess={onLoadSuccess}>
                                        {Array.from(new Array(numPages), (_, index) => (
                                            <Page
                                                key={`page_${index + 1}`}
                                                pageNumber={index + 1}
                                                width={600}
                                            />
                                        ))}
                                    </Document>
                                </div>
                            ) : (
                                <div className={styles.views}
                                >
                                    Previsualización
                                </div>
                            )}
                        </div>
                        <section>
                            <label htmlFor="file-upload" className={styles["cta-button"]}>Selecciona un archivo pdf</label>
                            <input id="file-upload" type="file" accept=".pdf" className={styles["input"]} onChange={onFileChange}/>
                            <div className={styles.listPdf}>
                                {file ?
                                    <p>{file?.name}</p>
                                    :
                                    <></>
                                }  
                            </div>
                            <label htmlFor="submit" className={styles["cta-button"]}>Actualizar</label>
                            <input id="submit" type="button" className={styles["input"]} onClick={handlerSubmit}/>
                        </section>
                    </section>
                </div>
            </section>
        </>
    )
}