import Reveal from './Reveal';

export default function SectionHeading({ label, title, sub, align = 'start', id }) {
  const center = align === 'center';
  return (
    <Reveal className={`section-head${center ? ' section-head--center' : ''}`}>
      <div>
        {label && <p className="kicker">{label}</p>}
        <h2 className="title-lg">{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
    </Reveal>
  );
}
