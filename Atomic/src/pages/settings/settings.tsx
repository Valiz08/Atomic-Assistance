import { useSelector } from "react-redux";
import Header from "../../components/header/header";
import { useUser } from "../../hooks/useUser";
import styles from "./settings.module.css";
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import type { RootState } from "../../store/store";

export default function Settings() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [iaActive, setIaActive] = useState(true);
  const [savedPdfName, setSavedPdfName] = useState<string | null>(null);
  const session = useSelector((state: RootState) => state.user.session);
  const { uploadFile, toggleIA, getIAState } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const pdfUrl = session?.id ? `/api/user/${session.id}/pdf` : null;

  useEffect(() => {
    if (session?.id) {
      getIAState(session.id).then(r => {
        setIaActive(r.ia);
        if (r.hasPdf) setSavedPdfName(r.pdfName);
      });
    }
  }, [session?.id]);

  const handleFile = (f: File) => {
    if (f.type === 'application/pdf') {
      setFile(f);
      setUploaded(false);
      setNumPages(null);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const result = await uploadFile(session.id, file);
    setUploading(false);
    if (result?.ok) {
      setUploaded(true);
      setSavedPdfName(file.name);
      setFile(null);
      setNumPages(null);
    } else {
      setUploadError(result?.message || 'Error desconocido al subir el PDF');
    }
  };

  const handleToggleIA = async () => {
    const result = await toggleIA(session.id);
    if (result) setIaActive(result.ia);
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <>
      <Header />
      <section className={styles.dashboard}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Configuración</h2>
          <p className={styles.pageSubtitle}>Gestiona el documento base de tu asistente y el estado de la IA</p>
        </div>

        <div className={styles.grid}>

          {/* ── PDF VIEWER ── */}
          <div className={styles.previewPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Previsualización PDF</span>
              {numPages && <span className={styles.pageCount}>{numPages} {numPages === 1 ? 'página' : 'páginas'}</span>}
            </div>

            {(file || savedPdfName) ? (
              <div className={styles.views}>
                <Document
                  file={file ?? pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  {Array.from(new Array(numPages), (_, i) => (
                    <Page key={`page_${i + 1}`} pageNumber={i + 1} width={460} />
                  ))}
                </Document>
              </div>
            ) : (
              <div className={styles.emptyPreview}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <p className={styles.emptyText}>Selecciona un PDF para previsualizarlo</p>
              </div>
            )}
          </div>

          {/* ── CONTROLS ── */}
          <section className={styles.controlPanel}>

            {/* Upload */}
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Documento de entrenamiento</span>
            </div>

            {/* PDF guardado en servidor */}
            {savedPdfName && !file && (
              <div className={styles.savedFileCard}>
                <div className={styles.fileIconBadge}>PDF</div>
                <div className={styles.fileMeta}>
                  <span className={styles.fileName}>{savedPdfName}</span>
                  <span className={styles.fileSize}>Subido anteriormente</span>
                </div>
                <button
                  className={styles.replaceBtn}
                  onClick={() => inputRef.current?.click()}
                >Reemplazar</button>
              </div>
            )}

            <div
              className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''} ${file ? styles.dropZoneHasFile : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && !savedPdfName && inputRef.current?.click()}
            >
              {file ? (
                <div className={styles.fileCard}>
                  <div className={styles.fileIconBadge}>PDF</div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{formatSize(file.size)}</span>
                  </div>
                  <button
                    className={styles.removeFile}
                    onClick={(e) => { e.stopPropagation(); setFile(null); setNumPages(null); setUploaded(false); }}
                  >✕</button>
                </div>
              ) : (
                <>
                  <div className={styles.dropIconWrap}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className={styles.dropText}>{savedPdfName ? 'Arrastra el nuevo PDF aquí' : 'Arrastra tu PDF aquí'}</p>
                  <p className={styles.dropHint}>o haz clic para seleccionar</p>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className={styles.input}
              onChange={onFileChange}
            />

            <button
              className={`${styles.uploadBtn} ${uploaded ? styles.uploadBtnSuccess : ''} ${uploadError ? styles.uploadBtnError : ''}`}
              onClick={handleUpload}
              disabled={!file || uploading || uploaded}
            >
              {uploading ? 'Procesando…' : uploaded ? '✓ Subido correctamente' : 'Subir PDF'}
            </button>
            {uploadError && <p className={styles.uploadErrorMsg}>{uploadError}</p>}

            {/* IA toggle */}
            <div className={styles.divider} />

            <div className={styles.iaSection}>
              <div className={styles.iaInfo}>
                <span className={styles.iaTitle}>Asistente IA</span>
                <span className={styles.iaDesc}>
                  {iaActive
                    ? 'La IA responde automáticamente a los clientes'
                    : 'IA pausada — puedes responder manualmente desde el chat'}
                </span>
              </div>
              <button
                className={`${styles.toggleIAButton} ${iaActive ? styles.toggleIAActive : styles.toggleIABlocked}`}
                onClick={handleToggleIA}
              >
                {iaActive ? 'IA Activa' : 'IA Bloqueada'}
              </button>
            </div>

          </section>
        </div>
      </section>
    </>
  );
}
