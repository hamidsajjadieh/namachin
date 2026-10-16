/* Shared line icons — 24px grid, stroke = currentColor */
const base = (size) => ({
  width: size ?? 20,
  height: size ?? 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
});

export const PhoneIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);

export const MailIcon = ({ size }) => (
  <svg {...base(size)}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

export const PinIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const SearchIcon = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const ChevronDown = ({ size }) => (
  <svg {...base(size)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronLeft = ({ size }) => (
  <svg {...base(size)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const ChevronRight = ({ size }) => (
  <svg {...base(size)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const ArrowRight = ({ size, className }) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowUpRight = ({ size, className }) => (
  <svg {...base(size)} className={className}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const GlobeIcon = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
  </svg>
);

export const ShieldIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const CertificateIcon = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="9" r="6" />
    <path d="M9 14.5 8 22l4-2 4 2-1-7.5" />
  </svg>
);

export const LeafIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M5 21c0-9 4-14 14-16-1 10-6 14-11 14" />
    <path d="M5 21c2-5 5-8 9-10" />
  </svg>
);

export const CheckIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="m5 13 4 4 10-11" />
  </svg>
);

export const HeartIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M12 20.5s-8.5-5.4-8.5-11a4.8 4.8 0 0 1 8.5-3 4.8 4.8 0 0 1 8.5 3c0 5.6-8.5 11-8.5 11Z" />
  </svg>
);

export const ClockIcon = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const CalendarIcon = ({ size }) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export const KeyIcon = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="m11 12 8-8 3 3-2 2-2-2-2 2 2 2-3 3-2-2" />
  </svg>
);

export const FactoryIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M3 21h18M4 21V9l5 4V9l5 4V5h6v16" />
  </svg>
);

export const TruckIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M2 6h11v10H2zM13 9h5l4 4v3h-9" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

export const SupportIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <rect x="2" y="13" width="4" height="7" rx="1.5" />
    <rect x="18" y="13" width="4" height="7" rx="1.5" />
    <path d="M20 20v1a2 2 0 0 1-2 2h-4" />
  </svg>
);

export const WalletIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h13" />
    <path d="M17 13h.01" />
  </svg>
);

export const ChartIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const HandshakeIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="m11 17 2 2a2 2 0 0 0 3 0l1-1 4 4" />
    <path d="m2 8 5-5 6 6-3 3-2-2-3 3z" />
  </svg>
);

export const ToolsIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M14.7 6.3a4.5 4.5 0 0 0 6 6L14 19a2.8 2.8 0 0 1-4-4l6.7-8.7Z" />
    <path d="m8 8-5 5c-1.5 1.5-1 4 .5 5.5S8.5 19 10 17.5l5-5" />
  </svg>
);

export const ZoomIcon = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3M8 11h6M11 8v6" />
  </svg>
);

export const CloseIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const InstagramIcon = ({ size }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
);

export const TelegramIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M22 3 2 11l6 2.5L19 6l-9 9v6l3.5-3.5L17 20l5-17Z" />
  </svg>
);

export const LinkedinIcon = ({ size }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 11v5M8 8v.01M12 16v-5M12 13c0-2 4-2.5 4 0v3" />
  </svg>
);

export const WhatsappIcon = ({ size }) => (
  <svg {...base(size)}>
    <path d="M12 22a10 10 0 0 0 8.7-15L22 2l-5 1.3A10 10 0 0 0 2 12a10 10 0 0 0 3.2 7.3L4 22l4.7-1.2A10 10 0 0 0 12 22Z" />
    <path d="M8.5 9.5c.5 3 3 5.5 6 6l1.5-1.5-2.2-1.3-1 .7a5 5 0 0 1-2.2-2.2l.7-1L9.9 8Z" />
  </svg>
);
