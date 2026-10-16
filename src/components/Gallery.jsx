import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { ChevronLeft, ChevronRight, CloseIcon, ZoomIcon } from './Icons';

/* Product image gallery: main view, thumbnails, fullscreen lightbox */
export default function Gallery({ images, alt }) {
  const { t, dir } = useI18n();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => setActive(0), [images]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')
        setActive((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, images.length]);

  const step = (sign) =>
    setActive((i) => (i + sign + images.length) % images.length);

  return (
    <div className="gallery">
      <figure className="gallery__main">
        <img key={active} src={images[active]} alt={alt} />
        <button
          type="button"
          className="gallery__zoom"
          onClick={() => setOpen(true)}
          aria-label={t('detail.zoom')}
        >
          <ZoomIcon size={18} />
        </button>
      </figure>

      {images.length > 1 && (
        <div className="gallery__thumbs">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`gallery__thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`${t('common.prev')} / ${t('common.next')} — ${i + 1}`}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <img key={active} src={images[active]} alt={alt} />
          <button
            ref={closeRef}
            type="button"
            className="lightbox__btn lightbox__btn--close"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label={t('detail.close')}
          >
            <CloseIcon size={20} />
          </button>
          <button
            type="button"
            className="lightbox__btn lightbox__btn--prev"
            onClick={(e) => {
              e.stopPropagation();
              step(dir === 'rtl' ? 1 : -1);
            }}
            aria-label={t('detail.prev')}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="lightbox__btn lightbox__btn--next"
            onClick={(e) => {
              e.stopPropagation();
              step(dir === 'rtl' ? -1 : 1);
            }}
            aria-label={t('detail.next')}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
