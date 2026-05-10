import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import type { RootState } from '../../store/store';
import styles from './header.module.css';

export default function Header() {
  const session = useSelector((s: RootState) => s.user.session) as any;
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const initials = session?.username
    ? session.username.slice(0, 2).toUpperCase()
    : 'AA';

  return (
    <header className={styles.header}>
      <a href="/dashboard" className={styles.logo}>
        <span className={styles.logoMark}>A</span>
        <span className={styles.logoText}>Atomic</span>
      </a>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Dashboard</NavLink>
        <NavLink to="/chat"      className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Chat</NavLink>
        <NavLink to="/calendar"  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Agenda</NavLink>
        <NavLink to="/settings"  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}>Ajustes</NavLink>
      </nav>

      <div className={styles.right} ref={menuRef}>
        <button className={styles.themeBtn} onClick={toggle} title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <button className={styles.avatarBtn} onClick={() => setMenuOpen(o => !o)}>
          <span className={styles.avatar}>{initials}</span>
          <svg className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {menuOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <span className={styles.dropdownName}>{session?.username || 'Usuario'}</span>
              {session?.businessName && <span className={styles.dropdownBusiness}>{session.businessName}</span>}
            </div>
            <div className={styles.dropdownDivider} />
            <button className={styles.dropdownItem} onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Configuración
            </button>
            <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
