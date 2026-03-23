import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconSearch, IconMenu, IconX, IconLogout, IconShield, IconChat, IconEdit } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <header
      style={{
        background: 'rgba(250, 247, 242, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-sand)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'var(--color-ink)',
          }}
        >
          <IconSearch size={24} style={{ color: 'var(--color-terracotta)' }} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '-0.02em',
            }}
          >
            Lost & Found
            <span
              style={{
                color: 'var(--color-terracotta)',
                fontSize: 12,
                fontWeight: 500,
                display: 'block',
                marginTop: -4,
              }}
            >
              KMUTNB
            </span>
          </span>
        </Link>


        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          className="hidden md:flex"
        >
          <NavLink to="/browse">ค้นหาของ</NavLink>
          {user && <NavLink to="/post">แจ้งของหาย / แจ้งเก็บของได้</NavLink>}
          {user && <NavLink to="/chat">แชท</NavLink>}
          {user?.role === 'admin' && (
            <NavLink to="/admin" accent>
              Admin
            </NavLink>
          )}
        </div>


        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: '1px solid var(--color-sand)',
                  borderRadius: 999,
                  padding: '6px 14px 6px 10px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  transition: 'border-color 0.2s',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--color-terracotta)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
                {user?.username || 'User'}
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 8,
                    background: 'white',
                    border: '1px solid var(--color-sand)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: 180,
                    overflow: 'hidden',
                    zIndex: 100,
                  }}
                  className="animate-fadeIn"
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-cream-dark)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.username || 'User'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-stone-light)' }}>{user?.email || 'No email'}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: 'var(--color-danger)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <IconLogout size={16} /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: 'var(--color-ink)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: 'white',
                  background: 'var(--color-terracotta)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                สมัครสมาชิก
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            {mobileOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="md:hidden animate-fadeIn"
          style={{
            borderTop: '1px solid var(--color-sand)',
            padding: '12px 24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <MobileLink to="/browse" onClick={() => setMobileOpen(false)}>ค้นหาของ</MobileLink>
          {user && <MobileLink to="/post" onClick={() => setMobileOpen(false)}>แจ้งของหาย / เก็บได้</MobileLink>}
          {user && <MobileLink to="/chat" onClick={() => setMobileOpen(false)}>แชท</MobileLink>}
          {user?.role === 'admin' && (
            <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>Admin Dashboard</MobileLink>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, children, accent }) {
  return (
    <Link
      to={to}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        color: accent ? 'var(--color-terracotta)' : 'var(--color-stone-dark)',
        fontSize: 14,
        fontWeight: 500,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.target.style.background = 'var(--color-cream-dark)')}
      onMouseLeave={(e) => (e.target.style.background = 'transparent')}
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        color: 'var(--color-ink)',
        fontSize: 15,
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  );
}
