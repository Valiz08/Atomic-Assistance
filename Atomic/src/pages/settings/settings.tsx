import { useSelector } from "react-redux";
import Header from "../../components/header/header";
import { useUser } from "../../hooks/useUser";
import { useWhatsapp } from "../../hooks/useWhatsapp";
import { useWorkers } from "../../hooks/useWorkers";
import type { Worker } from "../../hooks/useWorkers";
import { useBusinessHours } from "../../hooks/useBusinessHours";
import type { DaySchedule } from "../../hooks/useBusinessHours";
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
  const { getConfig, saveConfig } = useWhatsapp();
  const { getWorkers, addWorker, removeWorker } = useWorkers();
  const { getHours, saveHours } = useBusinessHours();
  const inputRef = useRef<HTMLInputElement>(null);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [workerSaving, setWorkerSaving] = useState(false);

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23
  const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Lun-Dom

  const [wpPhoneNumberId, setWpPhoneNumberId] = useState('');
  const [wpToken, setWpToken] = useState('');
  const [wpVerifyToken, setWpVerifyToken] = useState('');
  const [wpSaving, setWpSaving] = useState(false);
  const [wpSaved, setWpSaved] = useState(false);
  const [wpHasToken, setWpHasToken] = useState(false);

  const pdfUrl = session?.id ? `/api/user/${session.id}/pdf` : null;

  useEffect(() => {
    if (session?.id) {
      getIAState(session.id).then(r => {
        setIaActive(r.ia);
        if (r.hasPdf) setSavedPdfName(r.pdfName);
      });
      getConfig(session.id).then(r => {
        setWpPhoneNumberId(r.phoneNumberId || '');
        setWpVerifyToken(r.verifyToken || '');
        setWpHasToken(r.hasToken);
      });
      getWorkers(session.id).then(setWorkers);
      getHours(session.id).then(setSchedule);
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

        {/* ── HORARIO ── */}
        <div className={styles.whatsappPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Horario del negocio</span>
            {scheduleSaved && <span className={styles.pageCount}>Guardado</span>}
          </div>
          <p className={styles.iaDesc} style={{ margin: 0 }}>
            El calendario solo mostrará los huecos dentro de este horario. La IA también lo tendrá en cuenta al gestionar reservas.
          </p>

          <div className={styles.scheduleTable}>
            {DISPLAY_ORDER.map(dayNum => {
              const row = schedule.find(s => s.day === dayNum);
              if (!row) return null;
              const update = (patch: Partial<DaySchedule>) =>
                setSchedule(prev => prev.map(s => s.day === dayNum ? { ...s, ...patch } : s));
              return (
                <div key={dayNum} className={`${styles.scheduleRow} ${!row.enabled ? styles.scheduleRowClosed : ''}`}>
                  <div className={styles.scheduleDayToggle}>
                    <button
                      className={`${styles.dayToggleBtn} ${row.enabled ? styles.dayToggleOn : styles.dayToggleOff}`}
                      onClick={() => { update({ enabled: !row.enabled }); setScheduleSaved(false); }}
                    >
                      {row.enabled ? 'Abierto' : 'Cerrado'}
                    </button>
                    <span className={styles.scheduleDayName}>{DAY_LABELS[dayNum]}</span>
                  </div>
                  <div className={`${styles.scheduleHours} ${!row.enabled ? styles.scheduleHoursDisabled : ''}`}>
                    <span className={styles.scheduleHourLabel}>Desde</span>
                    <select
                      className={styles.scheduleSelect}
                      value={row.open}
                      disabled={!row.enabled}
                      onChange={e => { update({ open: Number(e.target.value) }); setScheduleSaved(false); }}
                    >
                      {HOUR_OPTIONS.map(h => (
                        <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                    <span className={styles.scheduleHourLabel}>Hasta</span>
                    <select
                      className={styles.scheduleSelect}
                      value={row.close}
                      disabled={!row.enabled}
                      onChange={e => { update({ close: Number(e.target.value) }); setScheduleSaved(false); }}
                    >
                      {HOUR_OPTIONS.filter(h => h > row.open).map(h => (
                        <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className={`${styles.uploadBtn} ${scheduleSaved ? styles.uploadBtnSuccess : ''}`}
            disabled={scheduleSaving || scheduleSaved}
            onClick={async () => {
              setScheduleSaving(true);
              const ok = await saveHours((session as any).id, schedule);
              setScheduleSaving(false);
              if (ok) setScheduleSaved(true);
            }}
          >
            {scheduleSaving ? 'Guardando…' : scheduleSaved ? '✓ Guardado' : 'Guardar horario'}
          </button>
        </div>

        {/* ── EQUIPO / MECÁNICOS ── */}
        <div className={styles.workersPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Equipo / Mecánicos</span>
            <span className={styles.pageCount}>{workers.length} {workers.length === 1 ? 'mecánico' : 'mecánicos'}</span>
          </div>
          <p className={styles.iaDesc} style={{ margin: 0 }}>
            Cada mecánico aparece como una sub-columna en la Agenda. La IA también conoce su disponibilidad para gestionar reservas por WhatsApp.
          </p>

          <div className={styles.workersList}>
            {workers.length === 0 && (
              <p className={styles.emptyText} style={{ margin: 0, fontSize: '0.825rem' }}>
                Aún no hay mecánicos configurados.
              </p>
            )}
            {workers.map(w => (
              <div key={w.id} className={styles.workerItem}>
                <span className={styles.workerAvatar}>{w.name.charAt(0).toUpperCase()}</span>
                <span className={styles.workerName}>{w.name}</span>
                <button
                  className={styles.removeWorkerBtn}
                  onClick={async () => {
                    await removeWorker(session.id, w.id);
                    setWorkers(prev => prev.filter(x => x.id !== w.id));
                  }}
                >✕</button>
              </div>
            ))}
          </div>

          <div className={styles.addWorkerRow}>
            <input
              className={styles.formInput}
              value={newWorkerName}
              onChange={e => setNewWorkerName(e.target.value)}
              placeholder="Nombre del mecánico (ej: Pedro)"
              onKeyDown={async e => {
                if (e.key === 'Enter' && newWorkerName.trim()) {
                  setWorkerSaving(true);
                  const w = await addWorker(session.id, newWorkerName.trim());
                  if (w) setWorkers(prev => [...prev, w]);
                  setNewWorkerName('');
                  setWorkerSaving(false);
                }
              }}
            />
            <button
              className={styles.uploadBtn}
              style={{ width: 'auto', padding: '0.7rem 1.25rem' }}
              disabled={!newWorkerName.trim() || workerSaving}
              onClick={async () => {
                if (!newWorkerName.trim()) return;
                setWorkerSaving(true);
                const w = await addWorker(session.id, newWorkerName.trim());
                if (w) setWorkers(prev => [...prev, w]);
                setNewWorkerName('');
                setWorkerSaving(false);
              }}
            >
              {workerSaving ? '…' : 'Añadir'}
            </button>
          </div>
        </div>

        {/* ── WHATSAPP CONFIG ── */}
        <div className={styles.whatsappPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Conexión WhatsApp</span>
            {wpHasToken && <span className={styles.pageCount}>Conectado</span>}
          </div>

          <div className={styles.whatsappGuide}>
            <p className={styles.guideTitle}>¿Cómo obtener tus credenciales?</p>
            <ol className={styles.guideSteps}>
              <li>Ve a <strong>developers.facebook.com</strong> e inicia sesión con tu cuenta de Meta/Facebook</li>
              <li>Crea una nueva app → tipo <strong>Business</strong></li>
              <li>Añade el producto <strong>WhatsApp</strong> a tu app</li>
              <li>En <em>WhatsApp → Configuración de la API</em> encontrarás el <strong>Phone Number ID</strong> y podrás generar el <strong>Access Token</strong></li>
              <li>Inventa un <strong>Verify Token</strong> (cualquier texto, ej: <code>mi-token-secreto-123</code>)</li>
              <li>Configura el webhook en Meta con la URL: <code>{`https://atomic-assistance.es/api/webhook/${session?.id}`}</code></li>
              <li>Pega aquí tus credenciales y guarda</li>
            </ol>
          </div>

          <div className={styles.whatsappForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number ID</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="123456789012345"
                value={wpPhoneNumberId}
                onChange={e => { setWpPhoneNumberId(e.target.value); setWpSaved(false); }}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Access Token</label>
              <input
                className={styles.formInput}
                type="password"
                placeholder={wpHasToken ? '••••••••••••••••' : 'EAAxxxxx...'}
                value={wpToken}
                onChange={e => { setWpToken(e.target.value); setWpSaved(false); }}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Verify Token</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="mi-token-secreto-123"
                value={wpVerifyToken}
                onChange={e => { setWpVerifyToken(e.target.value); setWpSaved(false); }}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL del Webhook (cópiala en Meta)</label>
              <div className={styles.webhookUrl}>
                <code>{`https://atomic-assistance.es/api/webhook/${session?.id}`}</code>
              </div>
            </div>
            <button
              className={`${styles.uploadBtn} ${wpSaved ? styles.uploadBtnSuccess : ''}`}
              disabled={wpSaving || wpSaved}
              onClick={async () => {
                setWpSaving(true);
                const ok = await saveConfig(session.id, wpPhoneNumberId, wpToken, wpVerifyToken);
                setWpSaving(false);
                if (ok) { setWpSaved(true); setWpHasToken(true); setWpToken(''); }
              }}
            >
              {wpSaving ? 'Guardando…' : wpSaved ? '✓ Guardado' : 'Guardar credenciales'}
            </button>
          </div>
        </div>

      </section>
    </>
  );
}
