import { useSelector } from "react-redux";
import Header from "../../components/header/header";
import { useUser } from "../../hooks/useUser";
import type { PdfEntry } from "../../hooks/useUser";
import { useWhatsapp } from "../../hooks/useWhatsapp";
import { useWorkers } from "../../hooks/useWorkers";
import type { Worker } from "../../hooks/useWorkers";
import { useBusinessHours } from "../../hooks/useBusinessHours";
import type { DaySchedule } from "../../hooks/useBusinessHours";
import styles from "./settings.module.css";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { RootState } from "../../store/store";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function Settings() {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [iaActive, setIaActive] = useState(true);
  const [savedPdfs, setSavedPdfs] = useState<PdfEntry[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [deletingPdfId, setDeletingPdfId] = useState<string | null>(null);
  const [pdfContainerWidth, setPdfContainerWidth] = useState(0);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const session = useSelector((state: RootState) => state.user.session);
  const { uploadFile, deletePdf, toggleIA, getIAState } = useUser();
  const { getConfig, saveConfig } = useWhatsapp();
  const { getWorkers, addWorker, updateWorker, removeWorker } = useWorkers();
  const { getHours, saveHours } = useBusinessHours();
  const inputRef = useRef<HTMLInputElement>(null);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerSpecialty, setNewWorkerSpecialty] = useState('');
  const [workerSaving, setWorkerSaving] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Record<string, string>>({});
  const [confirmDeleteWorker, setConfirmDeleteWorker] = useState<Worker | null>(null);

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const businessType = (session as any)?.businessType || 'taller';
  const isClinica = businessType === 'clinica';
  const workerLabel = isClinica ? 'Especialista' : 'Mecánico';
  const workersLabel = isClinica ? 'Especialistas' : 'Mecánicos';

  const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 6);
  const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

  const [wpPhoneNumberId, setWpPhoneNumberId] = useState('');
  const [wpToken, setWpToken] = useState('');
  const [wpVerifyToken, setWpVerifyToken] = useState('');
  const [wpSaving, setWpSaving] = useState(false);
  const [wpSaved, setWpSaved] = useState(false);
  const [wpHasToken, setWpHasToken] = useState(false);

  useEffect(() => {
    if (!pdfViewerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width) setPdfContainerWidth(Math.floor(width) - 32);
    });
    ro.observe(pdfViewerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (session?.id) {
      getIAState(session.id).then(r => {
        setIaActive(r.ia);
        setSavedPdfs(r.pdfs || []);
        if (r.pdfs?.length > 0) setSelectedPdfId(r.pdfs[r.pdfs.length - 1].id);
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
      setPendingFile(f);
      setNumPages(null);
      setUploadError(null);
      setSelectedPdfId(null);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);
    const result = await uploadFile(session.id, pendingFile);
    setUploading(false);
    if (result?.ok && result.pdfId && result.name) {
      const newEntry: PdfEntry = { id: result.pdfId, name: result.name };
      setSavedPdfs(prev => [...prev, newEntry]);
      setSelectedPdfId(result.pdfId);
      setPendingFile(null);
      setNumPages(null);
    } else {
      setUploadError(result?.message || 'Error desconocido al subir el PDF');
    }
  };

  const handleDeletePdf = async (pdfId: string) => {
    setDeletingPdfId(pdfId);
    const ok = await deletePdf(session.id, pdfId);
    if (ok) {
      setSavedPdfs(prev => prev.filter(p => p.id !== pdfId));
      if (selectedPdfId === pdfId) {
        const remaining = savedPdfs.filter(p => p.id !== pdfId);
        setSelectedPdfId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
    }
    setDeletingPdfId(null);
  };

  const handleToggleIA = async () => {
    const result = await toggleIA(session.id);
    if (result) setIaActive(result.ia);
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const previewUrl = selectedPdfId
    ? `/api/user/${session?.id}/pdf/${selectedPdfId}`
    : null;

  return (
    <>
      <Header />
      <section className={styles.dashboard}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Configuración</h2>
          <p className={styles.pageSubtitle}>Gestiona los documentos de tu asistente y el estado de la IA</p>
        </div>

        <div className={styles.grid}>

          {/* ── PDF VIEWER ── */}
          <div className={styles.previewPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Previsualización PDF</span>
              {numPages && <span className={styles.pageCount}>{numPages} {numPages === 1 ? 'página' : 'páginas'}</span>}
            </div>

            {(pendingFile || previewUrl) ? (
              <div className={styles.views} ref={pdfViewerRef}>
                <Document
                  file={pendingFile ?? previewUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<div className={styles.pdfLoading}><span className={styles.pdfLoadingDot} />Cargando PDF…</div>}
                  error={<div className={styles.pdfError}>No se pudo cargar el PDF</div>}
                >
                  {Array.from(new Array(numPages), (_, i) => (
                    <div key={`wrap_${i + 1}`} className={styles.pdfPageWrap}>
                      <Page
                        pageNumber={i + 1}
                        width={pdfContainerWidth || undefined}
                        renderTextLayer
                        renderAnnotationLayer
                      />
                      {numPages && numPages > 1 && (
                        <span className={styles.pdfPageNum}>{i + 1} / {numPages}</span>
                      )}
                    </div>
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
                </svg>
                <p className={styles.emptyText}>Selecciona un PDF para previsualizarlo</p>
              </div>
            )}
          </div>

          {/* ── CONTROLS ── */}
          <section className={styles.controlPanel}>

            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Documentos de entrenamiento</span>
              {savedPdfs.length > 0 && (
                <span className={styles.pageCount}>{savedPdfs.length} PDF{savedPdfs.length > 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Lista de PDFs guardados */}
            {savedPdfs.length > 0 && (
              <div className={styles.pdfList}>
                {savedPdfs.map(pdf => (
                  <div
                    key={pdf.id}
                    className={`${styles.pdfItem} ${selectedPdfId === pdf.id && !pendingFile ? styles.pdfItemActive : ''}`}
                    onClick={() => { setSelectedPdfId(pdf.id); setPendingFile(null); setNumPages(null); }}
                  >
                    <div className={styles.fileIconBadge}>PDF</div>
                    <span className={styles.pdfItemName}>{pdf.name}</span>
                    <button
                      className={styles.removeFile}
                      disabled={deletingPdfId === pdf.id}
                      onClick={e => { e.stopPropagation(); handleDeletePdf(pdf.id); }}
                    >
                      {deletingPdfId === pdf.id ? '…' : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone para añadir otro PDF */}
            <div
              className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''} ${pendingFile ? styles.dropZoneHasFile : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !pendingFile && inputRef.current?.click()}
            >
              {pendingFile ? (
                <div className={styles.fileCard}>
                  <div className={styles.fileIconBadge}>PDF</div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{pendingFile.name}</span>
                    <span className={styles.fileSize}>{formatSize(pendingFile.size)}</span>
                  </div>
                  <button
                    className={styles.removeFile}
                    onClick={(e) => { e.stopPropagation(); setPendingFile(null); setNumPages(null); }}
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
                  <p className={styles.dropText}>Añadir PDF</p>
                  <p className={styles.dropHint}>Arrastra aquí o haz clic para seleccionar</p>
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
              className={`${styles.uploadBtn} ${uploadError ? styles.uploadBtnError : ''}`}
              onClick={handleUpload}
              disabled={!pendingFile || uploading}
            >
              {uploading ? 'Procesando…' : 'Subir PDF'}
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

        {/* ── EQUIPO ── */}
        <div className={styles.workersPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Equipo / {workersLabel}</span>
            <span className={styles.pageCount}>{workers.length} {workers.length === 1 ? workerLabel.toLowerCase() : workersLabel.toLowerCase()}</span>
          </div>
          <p className={styles.iaDesc} style={{ margin: 0 }}>
            Cada {workerLabel.toLowerCase()} aparece como una sub-columna en la Agenda. La IA también conoce su disponibilidad para gestionar reservas por WhatsApp.
          </p>

          <div className={styles.workersList}>
            {workers.length === 0 && (
              <p className={styles.emptyText} style={{ margin: 0, fontSize: '0.825rem' }}>
                Aún no hay {workersLabel.toLowerCase()} configurados.
              </p>
            )}
            {workers.map(w => {
              const editVal = editingSpecialty[w.id] ?? w.specialty ?? '';
              const isDirty = editVal !== (w.specialty ?? '');
              return (
                <div key={w.id} className={styles.workerItem} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                    <span className={styles.workerAvatar}>{w.name.charAt(0).toUpperCase()}</span>
                    <span className={styles.workerName} style={{ flex: 1 }}>{w.name}</span>
                    <button className={styles.removeWorkerBtn} onClick={() => setConfirmDeleteWorker(w)}>✕</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '2.25rem', width: '100%' }}>
                    <input
                      className={styles.formInput}
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', flex: 1 }}
                      placeholder="Especialización (ej: Chapista, Electricista…)"
                      value={editVal}
                      onChange={e => setEditingSpecialty(prev => ({ ...prev, [w.id]: e.target.value }))}
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && isDirty) {
                          await updateWorker(session.id, w.id, editVal);
                          setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, specialty: editVal } : x));
                        }
                      }}
                    />
                    {isDirty && (
                      <button
                        className={styles.uploadBtn}
                        style={{ width: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={async () => {
                          await updateWorker(session.id, w.id, editVal);
                          setWorkers(prev => prev.map(x => x.id === w.id ? { ...x, specialty: editVal } : x));
                        }}
                      >Guardar</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.addWorkerRow} style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input
                className={styles.formInput}
                style={{ flex: 1 }}
                value={newWorkerName}
                onChange={e => setNewWorkerName(e.target.value)}
                placeholder={`Nombre (ej: ${isClinica ? 'Ana' : 'Juan'})`}
              />
              <input
                className={styles.formInput}
                style={{ flex: 1 }}
                value={newWorkerSpecialty}
                onChange={e => setNewWorkerSpecialty(e.target.value)}
                placeholder={isClinica ? 'Especialización (ej: Fisioterapeuta…)' : 'Especialización (ej: Chapista…)'}
              />
            </div>
            <button
              className={styles.uploadBtn}
              style={{ width: 'auto', padding: '0.7rem 1.25rem', alignSelf: 'flex-end' }}
              disabled={!newWorkerName.trim() || workerSaving}
              onClick={async () => {
                if (!newWorkerName.trim()) return;
                setWorkerSaving(true);
                const w = await addWorker(session.id, newWorkerName.trim(), newWorkerSpecialty.trim());
                if (w) setWorkers(prev => [...prev, w]);
                setNewWorkerName('');
                setNewWorkerSpecialty('');
                setWorkerSaving(false);
              }}
            >
              {workerSaving ? '…' : `Añadir ${workerLabel.toLowerCase()}`}
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
              <input className={styles.formInput} type="text" placeholder="123456789012345" value={wpPhoneNumberId} onChange={e => { setWpPhoneNumberId(e.target.value); setWpSaved(false); }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Access Token</label>
              <input className={styles.formInput} type="password" placeholder={wpHasToken ? '••••••••••••••••' : 'EAAxxxxx...'} value={wpToken} onChange={e => { setWpToken(e.target.value); setWpSaved(false); }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Verify Token</label>
              <input className={styles.formInput} type="text" placeholder="mi-token-secreto-123" value={wpVerifyToken} onChange={e => { setWpVerifyToken(e.target.value); setWpSaved(false); }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL del Webhook (cópiala en Meta)</label>
              <div className={styles.webhookUrl}><code>{`https://atomic-assistance.es/api/webhook/${session?.id}`}</code></div>
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

      {/* ── CONFIRM DELETE WORKER ── */}
      {confirmDeleteWorker && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={() => setConfirmDeleteWorker(null)}
        >
          <div
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>¿Eliminar a {confirmDeleteWorker.name}?</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Se eliminarán también <strong>todas las citas</strong> asignadas a este {workerLabel.toLowerCase()}. Esta acción no se puede deshacer.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className={styles.uploadBtn} style={{ background: 'none', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', width: 'auto', padding: '0.55rem 1.1rem' }} onClick={() => setConfirmDeleteWorker(null)}>Cancelar</button>
              <button className={styles.uploadBtn} style={{ background: '#ef4444', borderColor: '#ef4444', width: 'auto', padding: '0.55rem 1.1rem' }} onClick={async () => {
                await removeWorker(session.id, confirmDeleteWorker.id);
                setWorkers(prev => prev.filter(x => x.id !== confirmDeleteWorker.id));
                setConfirmDeleteWorker(null);
              }}>Eliminar {workerLabel.toLowerCase()} y citas</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
