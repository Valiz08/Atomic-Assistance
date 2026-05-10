import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { RootState } from '../../store/store';
import styles from './admin.module.css';

interface Client {
  id: string;
  user: string;
  businessType: 'taller' | 'clinica';
  businessName: string;
}

const BUSINESS_LABELS: Record<string, string> = {
  taller: 'Taller mecánico',
  clinica: 'Clínica multifunción',
};

const EMPTY_FORM = { username: '', password: '', businessType: 'taller', businessName: '' };
const EMPTY_EDIT = { businessType: 'taller', businessName: '', password: '' };

export default function AdminPage() {
  const session = useSelector((s: RootState) => s.user.session) as any;
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const headers = { 'Content-Type': 'application/json', requesterid: session?.id || '' };

  const loadClients = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/clients', { headers });
    if (res.ok) setClients(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    if (session?.role !== 'superroot') { navigate('/login'); return; }
    loadClients();
  }, [session]);

  const handleCreate = async () => {
    if (!form.username || !form.password) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/clients', {
      method: 'POST', headers,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setClients(prev => [...prev, data]);
      setCreating(false);
      setForm(EMPTY_FORM);
    } else {
      setError(data.message || 'Error al crear cliente');
    }
    setSaving(false);
  };

  const openEdit = (c: Client) => {
    setEditing(c);
    setEditForm({ businessType: c.businessType, businessName: c.businessName || '', password: '' });
    setError('');
  };

  const handleEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    const res = await fetch(`/api/admin/clients/${editing.id}`, {
      method: 'PATCH', headers,
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) {
      setClients(prev => prev.map(c => c.id === editing.id
        ? { ...c, businessType: data.businessType, businessName: data.businessName }
        : c
      ));
      setEditing(null);
    } else {
      setError(data.message || 'Error al actualizar');
    }
    setSaving(false);
  };

  const handleDelete = async (client: Client) => {
    await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE', headers });
    setClients(prev => prev.filter(c => c.id !== client.id));
    setConfirmDelete(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel Superroot</h1>
          <p className={styles.subtitle}>Gestión de clientes de Atomic Assistance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={styles.btnPrimary} onClick={() => { setCreating(true); setError(''); }}>
            + Nuevo cliente
          </button>
          <button className={styles.btnSecondary} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {loading ? (
        <p className={styles.empty}>Cargando...</p>
      ) : clients.length === 0 ? (
        <p className={styles.empty}>No hay clientes todavía.</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Usuario</span>
            <span>Nombre del negocio</span>
            <span>Tipo</span>
            <span></span>
          </div>
          {clients.map(c => (
            <div key={c.id} className={styles.tableRow}>
              <span className={styles.colUser}>{c.user}</span>
              <span>{c.businessName || '—'}</span>
              <span className={`${styles.badge} ${styles[`badge_${c.businessType}`]}`}>
                {BUSINESS_LABELS[c.businessType]}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                <button className={styles.btnEdit} onClick={() => openEdit(c)}>Editar</button>
                <button className={styles.btnDanger} onClick={() => setConfirmDelete(c)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear */}
      {creating && (
        <div className={styles.overlay} onClick={() => setCreating(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nuevo cliente</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Usuario *</label>
              <input className={styles.input} value={form.username} autoFocus
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="nombre_usuario" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña *</label>
              <input className={styles.input} type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del negocio</label>
              <input className={styles.input} value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                placeholder="Ej: Taller García, Clínica Salud+" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de negocio *</label>
              <select className={styles.input} value={form.businessType}
                onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))}>
                <option value="taller">Taller mecánico</option>
                <option value="clinica">Clínica multifunción (fisioterapia, psicología…)</option>
              </select>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setCreating(false)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleCreate}
                disabled={!form.username || !form.password || saving}>
                {saving ? 'Creando…' : 'Crear cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Editar — {editing.user}</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del negocio</label>
              <input className={styles.input} value={editForm.businessName} autoFocus
                onChange={e => setEditForm(f => ({ ...f, businessName: e.target.value }))}
                placeholder="Ej: Taller García" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de negocio</label>
              <select className={styles.input} value={editForm.businessType}
                onChange={e => setEditForm(f => ({ ...f, businessType: e.target.value }))}>
                <option value="taller">Taller mecánico</option>
                <option value="clinica">Clínica multifunción (fisioterapia, psicología…)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nueva contraseña (dejar vacío para no cambiar)</label>
              <input className={styles.input} type="password" value={editForm.password}
                onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setEditing(null)}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleEdit} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>¿Eliminar cliente?</h2>
            <p className={styles.subtitle}>
              Se eliminará <strong>{confirmDelete.user}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className={styles.btnDanger} onClick={() => handleDelete(confirmDelete)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
