

const defaultProps = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Svg({ children, size = 20, className, style, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, ...style }}
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSearch({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function IconCamera({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

export function IconChat({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function IconGift({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect width="20" height="5" x="2" y="7" />
      <line x1="12" x2="12" y1="22" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </Svg>
  );
}

export function IconPin({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

export function IconFolder({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function IconUser({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function IconUsers({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function IconCalendar({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <rect width="18" x="3" y="4" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  );
}

export function IconEdit({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  );
}

export function IconPackage({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </Svg>
  );
}

export function IconMail({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Svg>
  );
}

export function IconHand({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 13" />
    </Svg>
  );
}

export function IconCheck({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function IconX({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

export function IconSend({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Svg>
  );
}

export function IconLogout({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Svg>
  );
}

export function IconMenu({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Svg>
  );
}

export function IconChevronLeft({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

export function IconUpload({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </Svg>
  );
}

export function IconChart({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </Svg>
  );
}

export function IconClipboard({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    </Svg>
  );
}

export function IconShield({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function IconKey({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </Svg>
  );
}

export function IconBag({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Svg>
  );
}

export function IconPhone({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </Svg>
  );
}

export function IconFile({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </Svg>
  );
}

export function IconShirt({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M20.38 3.46 16 2 12 6 8 2 3.62 3.46a2 2 0 0 0-1.34 1.89v0.5c0 .7.37 1.35.97 1.7L7 9.5V21a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5l3.75-1.95a2 2 0 0 0 .97-1.7v-.5a2 2 0 0 0-1.34-1.89z" />
    </Svg>
  );
}

export function IconGrid({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </Svg>
  );
}

export function IconArrowRight({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

export function IconWave({ size, ...props }) {
  return (
    <Svg size={size} {...props}>
      <path d="M7 15h0" />
      <path d="M11.672 3.5C10.267 2.41 8.08 2.923 7.353 4.543 6.18 7.093 4.866 10.105 4.064 13.625c-.386 1.695 1.08 3.175 2.8 2.825a39.7 39.7 0 0 0 4.136-.97" />
      <path d="M14 16a2 2 0 0 1-2 2H6" />
      <path d="M15.5 8c.34-.73.82-1.334 1.446-1.606 1.367-.594 3.012.238 3.554 1.606.542 1.367.078 3.012-1.29 3.554" />
      <path d="M18.586 11.554C19.2 12.38 19.5 13.594 19 15" />
    </Svg>
  );
}
const categoryIconMap = {
  'กระเป๋า': IconBag,
  'อิเล็กทรอนิกส์': IconPhone,
  'เอกสาร': IconFile,
  'กุญแจ': IconKey,
  'เสื้อผ้า': IconShirt,
  'อื่นๆ': IconPackage,
};

export function CategoryIcon({ category, size = 20, ...props }) {
  const Icon = categoryIconMap[category] || IconPackage;
  return <Icon size={size} {...props} />;
}
