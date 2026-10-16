import { useRef } from 'react';
import { useI18n } from '../i18n';
import { ChevronLeft, ChevronRight } from './Icons';

/*
 * Horizontal snap carousel: native touch swipe, desktop mouse-drag,
 * accessible arrow buttons, smooth motion, no jerky jumps.
 */
export default function Carousel({ children, ariaLabel }) {
  const trackRef = useRef(null);
  const drag = useRef(null);
  const { dir, t } = useI18n();

  const scrollAmount = () => {
    const track = trackRef.current;
    const first = track?.firstElementChild;
    return first ? first.getBoundingClientRect().width + 22 : 420;
  };

  const go = (sign) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = scrollAmount() * sign;
    track.scrollBy({ left: dir === 'rtl' ? -amount : amount, behavior: 'smooth' });
  };

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    const track = trackRef.current;
    drag.current = { startX: e.clientX, startScroll: track.scrollLeft, moved: 0 };
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    if (drag.current.moved > 4) trackRef.current.classList.add('is-dragging');
    trackRef.current.scrollLeft = drag.current.startScroll - dx;
  };

  const endDrag = () => {
    if (!drag.current) return;
    const moved = drag.current.moved;
    drag.current = null;
    if (moved > 6) {
      /* suppress the click that follows a drag */
      trackRef.current.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        { once: true, capture: true }
      );
      requestAnimationFrame(() => trackRef.current.classList.remove('is-dragging'));
    }
  };

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
      <button
        type="button"
        className="carousel__btn carousel__btn--prev"
        onClick={() => go(-1)}
        aria-label={t('common.prev')}
      >
        <PrevIcon size={20} />
      </button>
      <div
        className="carousel__track"
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {children}
      </div>
      <button
        type="button"
        className="carousel__btn carousel__btn--next"
        onClick={() => go(1)}
        aria-label={t('common.next')}
      >
        <NextIcon size={20} />
      </button>
    </div>
  );
}
