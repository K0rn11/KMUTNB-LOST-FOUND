import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ItemCard from '../components/ItemCard';
import { IconSearch, IconCamera, IconChat, IconGift, IconEdit, IconMail } from '../components/Icons';

export default function Home() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items?limit=8')
      .then(res => setRecentItems(res.data.items || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fadeIn">

      <section
        style={{
          background: 'linear-gradient(145deg, var(--color-terracotta) 0%, var(--color-terracotta-dark) 60%, #7a3820 100%)',
          color: 'var(--color-cream)',
          padding: 'clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 3rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: '10%', width: 260, height: 260, borderRadius: '42% 58% 32% 68%', background: 'rgba(255,255,255,0.05)', transform: 'rotate(15deg)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '5%', width: 180, height: 180, borderRadius: '58% 42% 68% 32%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.75rem' }}>
              KMUTNB Lost & Found
            </p>
            {/* <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              ของหาย ≠ ของหายไป
            </h1> */}
            <p style={{ fontSize: 'var(--text-lg)', opacity: 0.85, maxWidth: '42ch', lineHeight: 1.5, marginBottom: '2rem' }}>
              ระบบช่วยค้นหาและคืนของหายในมหาวิทยาลัยพระจอมเกล้าพระนครเหนือ — แจ้ง ค้นหา และรับคืนได้ง่ายๆ
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/browse"
                style={{
                  padding: '0.75rem 1.75rem', background: 'var(--color-cream)', color: 'var(--color-terracotta)',
                  borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600,
                  fontSize: 'var(--text-base)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                <IconSearch size={18} /> ค้นหาของ
              </Link>
              <Link
                to="/post"
                style={{
                  padding: '0.75rem 1.75rem', background: 'rgba(255,255,255,0.12)',
                  color: 'var(--color-cream)', borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                  fontWeight: 600, fontSize: 'var(--text-base)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                <IconEdit size={18} /> แจ้งของหาย / แจ้งเก็บของได้
              </Link>
            </div>
          </div>
        </div>
      </section>


      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-terracotta)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            วิธีใช้งาน
          </p>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink)' }}>
            3 ขั้นตอนง่ายๆ
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="stagger">
          <StepCard number="1" title="โพสต์ประกาศ" desc="แจ้งข้อมูลของหาย หรือของที่เก็บได้ พร้อมถ่ายรูปแนบ" icon={<IconCamera size={24} />} accent="var(--color-terracotta)" />
          <StepCard number="2" title="ค้นหาและติดต่อ" desc="ค้นหาจากหมวดหมู่หรือสถานที่ แล้วแชทพูดคุยกับเจ้าของ" icon={<IconChat size={24} />} accent="var(--color-forest)" />
          <StepCard number="3" title="รับของคืน" desc="ยืนยันตัวตน ส่งหลักฐาน แล้วนัดรับของคืนที่สะดวก" icon={<IconGift size={24} />} accent="var(--color-sky)" />
        </div>
      </section>


      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-lg) var(--space-3xl)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink)' }}>ประกาศล่าสุด</h2>
          <Link to="/browse" style={{ color: 'var(--color-terracotta)', textDecoration: 'none', fontWeight: 500, fontSize: 'var(--text-sm)' }}>ดูทั้งหมด →</Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : recentItems.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }} className="stagger">
            {recentItems.map(item => (<ItemCard key={item.itemId} item={item} />))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>


      <footer style={{ borderTop: '1px solid var(--color-sand)', padding: 'var(--space-xl) var(--space-lg)', background: 'var(--color-cream-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconSearch size={18} style={{ color: 'var(--color-terracotta)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-ink)' }}>Lost & Found</span>
            <span style={{ color: 'var(--color-stone-light)', fontSize: 'var(--text-sm)' }}>KMUTNB</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-stone-light)' }}>
            © 2026 ระบบแจ้งของหาย — มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, desc, icon, accent }) {
  return (
    <div style={{ padding: '1.75rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-sand)', borderTop: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: accent, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
          {number}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-stone)', lineHeight: 1.55 }}>{desc}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white', border: '1px solid var(--color-sand)' }}>
          <div style={{ aspectRatio: '4/3', background: 'var(--color-cream-dark)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ padding: '1rem' }}>
            <div style={{ height: 14, background: 'var(--color-cream-dark)', borderRadius: 4, marginBottom: 8, width: '70%' }} />
            <div style={{ height: 12, background: 'var(--color-cream-dark)', borderRadius: 4, width: '50%' }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-sand)' }}>
      <IconMail size={48} style={{ color: 'var(--color-stone-light)', margin: '0 auto 0.75rem' }} />
      <p style={{ color: 'var(--color-stone)', fontSize: 'var(--text-base)', marginBottom: '0.25rem' }}>ยังไม่มีประกาศ</p>
      <p style={{ color: 'var(--color-stone-light)', fontSize: 'var(--text-sm)' }}>เป็นคนแรกที่โพสต์ประกาศของหายหรือของที่เก็บได้!</p>
      <Link to="/post" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.625rem 1.5rem', background: 'var(--color-terracotta)', color: 'white', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
        โพสต์ประกาศ
      </Link>
    </div>
  );
}
