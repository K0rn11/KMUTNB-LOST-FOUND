import { Link } from 'react-router-dom';
import { CategoryIcon, IconPin } from './Icons';
import { getImageUrl } from '../utils';

export default function ItemCard({ item, style = {} }) {
  const timeAgo = getTimeAgo(item.createdAt);

  return (
    <Link
      to={`/items/${item.itemId}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'white',
        border: '1px solid var(--color-sand)',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      
      <div
        style={{
          aspectRatio: '4/3',
          background: 'var(--color-cream-dark)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {item.photoUrl ? (
          <img
            src={getImageUrl(item.photoUrl)}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-stone-light)',
              opacity: 0.5,
            }}
          >
            <CategoryIcon category={item.category} size={48} />
          </div>
        )}

        
        <span
          className={`type-${item.type}`}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {item.type === 'lost' ? 'ของหาย' : 'เก็บได้'}
        </span>

        
        <span
          className={`status-${item.status?.toLowerCase()}`}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {statusLabel(item.status)}
        </span>
      </div>

      
      <div style={{ padding: '14px 16px 16px' }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 6,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-stone-light)', fontSize: 13 }}>
          <IconPin size={14} />
          <span>{item.location}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--color-cream-dark)',
            fontSize: 12,
            color: 'var(--color-stone-light)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CategoryIcon category={item.category} size={14} />
            {item.category}
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}

function statusLabel(status) {
  const labels = {
    ACTIVE: 'ประกาศอยู่',
    PENDING_CLAIM: 'รอตรวจสอบ',
    RETURNED: 'คืนแล้ว',
    EXPIRED: 'หมดอายุ',
    DELETED: 'ถูกลบ',
  };
  return labels[status] || status;
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'เมื่อกี้';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH');
}
