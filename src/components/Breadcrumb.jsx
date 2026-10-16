import { Link } from 'react-router-dom';

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb container" aria-label="Breadcrumb">
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.55rem' }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.35rem 0.55rem' }}>
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.to ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
