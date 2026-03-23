import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconUser } from '../components/Icons';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('รหัสผ่านไม่ตรงกัน');
    }
    if (form.password.length < 6) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
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
      <div className="animate-slideUp" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>สมัครสมาชิก</h1>
          <p style={{ color: 'var(--color-stone-light)', fontSize: 15 }}>
            สร้างบัญชีเพื่อเริ่มใช้งาน <IconUser size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)' }}>
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid var(--color-sand)',
                borderRadius: 'var(--radius-sm)', fontSize: 15, fontFamily: 'var(--font-body)', background: 'white',
              }}
              placeholder="เช่น somchai99"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)' }}>
              อีเมล
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid var(--color-sand)',
                borderRadius: 'var(--radius-sm)', fontSize: 15, fontFamily: 'var(--font-body)', background: 'white',
              }}
              placeholder="s66xxxxx@kmutnb.ac.th"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)' }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid var(--color-sand)',
                borderRadius: 'var(--radius-sm)', fontSize: 15, fontFamily: 'var(--font-body)', background: 'white',
              }}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--color-stone-dark)' }}>
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid var(--color-sand)',
                borderRadius: 'var(--radius-sm)', fontSize: 15, fontFamily: 'var(--font-body)', background: 'white',
              }}
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? 'var(--color-stone-light)' : 'var(--color-terracotta)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-stone-light)' }}>
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" style={{ color: 'var(--color-terracotta)', fontWeight: 500 }}>
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
