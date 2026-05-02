import { useSelector } from "react-redux";
import Header from "../../components/header/header";
import { useAppointments } from "../../hooks/useAppointments";
import { useWorkers } from "../../hooks/useWorkers";
import type { Worker } from "../../hooks/useWorkers";
import { useBusinessHours } from "../../hooks/useBusinessHours";
import type { DaySchedule } from "../../hooks/useBusinessHours";
import styles from "./calendar.module.css";
import React, { useState, useEffect, useCallback } from 'react';
import type { RootState } from "../../store/store";

const FALLBACK_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const SERVICES = [
  'Revisión general', 'Cambio de aceite', 'Cambio de frenos',
  'Cambio de neumáticos', 'Diagnóstico eléctrico', 'Reparación motor',
  'ITV (preparación)', 'Aire acondicionado', 'Otro',
];
const DURATIONS = [
  { label: '30 min', value: 30 }, { label: '1 hora', value: 60 },
  { label: '1.5 horas', value: 90 }, { label: '2 horas', value: 120 },
  { label: '3 horas', value: 180 }, { label: '4 horas', value: 240 },
];

interface Appointment {
  _id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  workerId: string | null;
  workerName: string | null;
  source: string;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada',
};

// Pill color per worker index (cycles)
const WORKER_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899',
];

export default function CalendarPage() {
  const session = useSelector((state: RootState) => state.user.session) as any;
  const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { getWorkers } = useWorkers();
  const { getHours } = useBusinessHours();

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [businessHours, setBusinessHours] = useState<DaySchedule[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [creating, setCreating] = useState<{ date: Date; worker: Worker | null } | null>(null);
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', service: SERVICES[0],
    duration: 60, notes: '', workerId: '', workerName: '',
  });
  const [saving, setSaving] = useState(false);

  const weekDates = getWeekDates(weekStart);
  const today = new Date();

  // Workers as effective columns (1 fallback if none configured)
  const effectiveWorkers: (Worker | null)[] = workers.length > 0 ? workers : [null];
  const numCols = effectiveWorkers.length;

  const loadAll = useCallback(async () => {
    if (!session?.id) return;
    const [workerList, hoursList] = await Promise.all([
      getWorkers(session.id),
      getHours(session.id),
    ]);
    setWorkers(workerList);
    setBusinessHours(hoursList);
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const data = await getAppointments(session.id, start.toISOString(), end.toISOString());
    setAppointments(data);
  }, [session?.id, weekStart]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const getApptAt = (day: Date, hour: number, worker: Worker | null): Appointment | undefined =>
    appointments.find(a => {
      const d = new Date(a.date);
      const hourMatch = sameDay(d, day) && d.getHours() === hour;
      if (!hourMatch) return false;
      if (worker === null) return !a.workerId; // unassigned slot
      return a.workerId === worker.id || (!a.workerId && workers.length === 0);
    });

  const handleCellClick = (day: Date, hour: number, worker: Worker | null) => {
    const existing = getApptAt(day, hour, worker);
    if (existing) {
      setSelected(existing);
    } else {
      const date = new Date(day);
      date.setHours(hour, 0, 0, 0);
      setCreating({ date, worker });
      setForm({
        clientName: '', clientPhone: '', service: SERVICES[0], duration: 60, notes: '',
        workerId: worker?.id || '',
        workerName: worker?.name || '',
      });
    }
  };

  const handleCreate = async () => {
    if (!form.clientName || !session?.id) return;
    setSaving(true);
    await createAppointment({
      userId: session.id,
      clientName: form.clientName,
      clientPhone: form.clientPhone,
      service: form.service,
      date: creating!.date.toISOString(),
      duration: form.duration,
      notes: form.notes,
      workerId: form.workerId || undefined,
      workerName: form.workerName || undefined,
    });
    setSaving(false);
    setCreating(null);
    loadAll();
  };

  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    await updateAppointment(selected._id, { status });
    setSelected(null);
    loadAll();
  };

  const handleDelete = async () => {
    if (!selected) return;
    await deleteAppointment(selected._id);
    setSelected(null);
    loadAll();
  };

  // Rango de horas visible = unión de todos los días activos
  const visibleHours = (() => {
    const enabled = businessHours.filter(s => s.enabled);
    if (enabled.length === 0) return FALLBACK_HOURS;
    const min = Math.min(...enabled.map(s => s.open));
    const max = Math.max(...enabled.map(s => s.close));
    return Array.from({ length: max - min }, (_, i) => min + i);
  })();

  const scheduleFor = (day: Date): DaySchedule | undefined =>
    businessHours.find(s => s.day === day.getDay());

  // Día entero cerrado (enabled=false en la config)
  const isDayClosed = (day: Date): boolean => {
    if (businessHours.length === 0) return false;
    const s = scheduleFor(day);
    return !s || !s.enabled;
  };

  // Celda concreta fuera del rango horario (pero el día sí está abierto)
  const isOutsideHours = (day: Date, hour: number): boolean => {
    if (businessHours.length === 0) return false;
    const s = scheduleFor(day);
    if (!s || !s.enabled) return false; // isDayClosed ya lo gestiona
    return hour < s.open || hour >= s.close;
  };

  const workerColor = (workerId: string | null) => {
    if (!workerId) return WORKER_COLORS[0];
    const idx = workers.findIndex(w => w.id === workerId);
    return WORKER_COLORS[idx >= 0 ? idx % WORKER_COLORS.length : 0];
  };

  const weekLabel = `${weekDates[0].getDate()} ${MONTH_NAMES[weekDates[0].getMonth()]} – ${weekDates[6].getDate()} ${MONTH_NAMES[weekDates[6].getMonth()]} ${weekDates[6].getFullYear()}`;

  return (
    <>
      <Header />
      <section className={styles.page}>

        {/* ── HEADER ── */}
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Agenda</h2>
            <p className={styles.pageSubtitle}>
              {workers.length > 0
                ? `${workers.length} mecánico${workers.length > 1 ? 's' : ''}: ${workers.map(w => w.name).join(', ')}`
                : 'Configura mecánicos en Ajustes para ver sub-columnas'}
            </p>
          </div>
          <div className={styles.weekNav}>
            <button className={styles.navBtn} onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}>‹</button>
            <span className={styles.weekLabel}>{weekLabel}</span>
            <button className={styles.navBtn} onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}>›</button>
            <button className={styles.todayBtn} onClick={() => setWeekStart(getWeekStart(new Date()))}>Hoy</button>
          </div>
        </div>

        {/* ── LEGEND ── */}
        <div className={styles.legend}>
          <span className={`${styles.dot} ${styles.dotConfirmed}`} />Confirmada
          <span className={`${styles.dot} ${styles.dotPending}`} />Pendiente
          <span className={`${styles.dot} ${styles.dotCancelled}`} />Cancelada
          {workers.length > 0 && workers.map((w, i) => (
            <span key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className={styles.dot} style={{ background: WORKER_COLORS[i % WORKER_COLORS.length] }} />
              {w.name}
            </span>
          ))}
        </div>

        {/* ── CALENDAR ── */}
        <div className={styles.calendarWrap}>
          <div
            className={styles.calendar}
            style={{ gridTemplateColumns: `56px repeat(${7 * numCols}, 1fr)` }}
          >
            {/* ── Corner ── */}
            <div
              className={styles.corner}
              style={workers.length > 0 ? { gridRow: '1 / 3', gridColumn: '1' } : {}}
            />

            {/* ── Day headers — forced to row 1, each spans numCols ── */}
            {weekDates.map((day, i) => {
              const dayClosed = isDayClosed(day);
              return (
                <div
                  key={i}
                  className={`${styles.dayHeader} ${sameDay(day, today) ? styles.dayHeaderToday : ''} ${dayClosed ? styles.dayHeaderClosed : ''}`}
                  style={{ gridRow: 1, gridColumn: `span ${numCols}` }}
                >
                  <span className={styles.dayName}>{DAY_NAMES[i]}</span>
                  <span className={`${styles.dayNum} ${sameDay(day, today) ? styles.dayNumToday : ''}`}>
                    {day.getDate()}
                  </span>
                  {dayClosed && <span className={styles.closedBadge}>Cerrado</span>}
                </div>
              );
            })}

            {/* ── Worker sub-headers — forced to row 2, no extra corner div ── */}
            {workers.length > 0 && weekDates.flatMap((day, di) =>
              workers.map((w, wi) => (
                <div
                  key={`wh-${di}-${wi}`}
                  className={`${styles.workerHeader} ${isDayClosed(day) ? styles.workerHeaderClosed : ''}`}
                  style={{ gridRow: 2, borderTopColor: isDayClosed(day) ? 'transparent' : WORKER_COLORS[wi % WORKER_COLORS.length] }}
                >
                  {w.name}
                </div>
              ))
            )}

            {/* ── Hour rows ── */}
            {visibleHours.map(hour => (
              <React.Fragment key={hour}>
                <div className={styles.timeCell}>
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                {weekDates.flatMap((day, di) =>
                  effectiveWorkers.map((worker, wi) => {
                    const appt = getApptAt(day, hour, worker);
                    const isPast = day < today && !sameDay(day, today);
                    const dayClosed = isDayClosed(day);
                    const hourOutside = !dayClosed && isOutsideHours(day, hour);
                    const blocked = isPast || dayClosed || hourOutside;
                    return (
                      <div
                        key={`${di}-${wi}`}
                        className={`${styles.cell} ${isPast ? styles.cellPast : ''} ${dayClosed ? styles.cellDayClosed : ''} ${hourOutside ? styles.cellHourOutside : ''} ${!appt && !blocked ? styles.cellEmpty : ''}`}
                        onClick={() => !blocked && handleCellClick(day, hour, worker)}
                      >
                        {appt && (
                          <div
                            className={`${styles.appt} ${styles[`appt_${appt.status}`]}`}
                            style={appt.status !== 'cancelled'
                              ? { borderLeftColor: workerColor(appt.workerId) }
                              : undefined}
                          >
                            <span className={styles.apptTime}>
                              {`${new Date(appt.date).getHours().toString().padStart(2, '0')}:00`}
                              {appt.duration !== 60 ? ` · ${appt.duration < 60 ? `${appt.duration}m` : `${appt.duration / 60}h`}` : ''}
                              {appt.source === 'whatsapp' && ' · WA'}
                            </span>
                            <span className={styles.apptName}>{appt.clientName}</span>
                            <span className={styles.apptService}>{appt.service}</span>
                            {appt.clientPhone && <span className={styles.apptPhone}>{appt.clientPhone}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── CREATE MODAL ── */}
        {creating && (
          <div className={styles.overlay} onClick={() => setCreating(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <span className={styles.modalTitle}>Nueva cita</span>
                <span className={styles.modalMeta}>
                  {`${DAY_NAMES[creating.date.getDay() === 0 ? 6 : creating.date.getDay() - 1]} ${creating.date.getDate()} ${MONTH_NAMES[creating.date.getMonth()]} · ${creating.date.getHours().toString().padStart(2, '0')}:00`}
                  {creating.worker && ` · ${creating.worker.name}`}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del cliente *</label>
                <input className={styles.formInput} value={form.clientName}
                  onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                  placeholder="Ej: María García" autoFocus />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Teléfono</label>
                <input className={styles.formInput} value={form.clientPhone}
                  onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                  placeholder="Ej: 612 345 678" />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Servicio</label>
                  <select className={styles.formInput} value={form.service}
                    onChange={e => setForm(f => ({ ...f, service: e.target.value }))}>
                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duración</label>
                  <select className={styles.formInput} value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}>
                    {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {workers.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mecánico</label>
                  <select className={styles.formInput} value={form.workerId}
                    onChange={e => {
                      const w = workers.find(w => w.id === e.target.value);
                      setForm(f => ({ ...f, workerId: e.target.value, workerName: w?.name || '' }));
                    }}>
                    <option value="">Sin asignar</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notas</label>
                <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Observaciones opcionales…" />
              </div>

              <div className={styles.modalActions}>
                <button className={styles.btnSecondary} onClick={() => setCreating(null)}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={handleCreate}
                  disabled={!form.clientName || saving}>
                  {saving ? 'Guardando…' : 'Crear cita'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DETAIL MODAL ── */}
        {selected && (
          <div className={styles.overlay} onClick={() => setSelected(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <span className={styles.modalTitle}>{selected.clientName}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {selected.source === 'whatsapp' && (
                    <span className={styles.sourceBadge}>WhatsApp</span>
                  )}
                  <span className={`${styles.statusBadge} ${styles[`badge_${selected.status}`]}`}>
                    {statusLabel[selected.status]}
                  </span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <span className={styles.detailLabel}>Servicio</span>
                <span className={styles.detailValue}>{selected.service}</span>

                <span className={styles.detailLabel}>Fecha</span>
                <span className={styles.detailValue}>
                  {new Date(selected.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' · '}
                  {new Date(selected.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>

                <span className={styles.detailLabel}>Duración</span>
                <span className={styles.detailValue}>
                  {selected.duration < 60
                    ? `${selected.duration} min`
                    : selected.duration % 60 === 0
                      ? `${selected.duration / 60}h`
                      : `${Math.floor(selected.duration / 60)}h ${selected.duration % 60}min`}
                </span>

                {selected.workerName && (
                  <>
                    <span className={styles.detailLabel}>Mecánico</span>
                    <span className={styles.detailValue}
                      style={{ color: workerColor(selected.workerId), fontWeight: 600 }}>
                      {selected.workerName}
                    </span>
                  </>
                )}

                {selected.clientPhone && (
                  <>
                    <span className={styles.detailLabel}>Teléfono</span>
                    <span className={styles.detailValue}>{selected.clientPhone}</span>
                  </>
                )}

                {selected.notes && (
                  <>
                    <span className={styles.detailLabel}>Notas</span>
                    <span className={styles.detailValue}>{selected.notes}</span>
                  </>
                )}
              </div>

              <div className={styles.modalActions}>
                <button className={styles.btnDanger} onClick={handleDelete}>Eliminar</button>
                <div className={styles.actionGroup}>
                  {selected.status !== 'cancelled' && (
                    <button className={styles.btnWarning} onClick={() => handleStatusChange('cancelled')}>
                      Cancelar cita
                    </button>
                  )}
                  {selected.status === 'pending' && (
                    <button className={styles.btnSuccess} onClick={() => handleStatusChange('confirmed')}>
                      Confirmar
                    </button>
                  )}
                  {selected.status === 'cancelled' && (
                    <button className={styles.btnPrimary} onClick={() => handleStatusChange('pending')}>
                      Reactivar
                    </button>
                  )}
                  <button className={styles.btnSecondary} onClick={() => setSelected(null)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
    </>
  );
}
