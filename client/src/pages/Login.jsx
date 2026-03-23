import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconWave } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.login, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="animate-slideUp"
        style={{
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>เข้าสู่ระบบ</h1>
          <p style={{ color: 'var(--color-stone-light)', fontSize: 15 }}>
            ยินดีต้อนรับกลับมา <IconWave size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-danger)',
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                color: 'var(--color-stone-dark)',
              }}
            >
              ชื่อผู้ใช้หรืออีเมล
            </label>
            <input
              type="text"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--color-sand)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 15,
                fontFamily: 'var(--font-body)',
                background: 'white',
                transition: 'border-color 0.15s',
              }}
              placeholder="username หรือ email"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
                color: 'var(--color-stone-dark)',
              }}
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--color-sand)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 15,
                fontFamily: 'var(--font-body)',
                background: 'white',
              }}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'var(--color-stone-light)' : 'var(--color-terracotta)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>

          <p
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 14,
              color: 'var(--color-stone-light)',
            }}
          >
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" style={{ color: 'var(--color-terracotta)', fontWeight: 500 }}>
              สมัครสมาชิก
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
