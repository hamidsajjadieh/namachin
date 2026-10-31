import { useEffect, useRef } from 'react';

/**
 * Scroll-scrubbed hero video.
 *
 * The section is a tall scroll track (height derived from the video duration);
 * the visible part is position:sticky at 100vh. Scroll position maps 1:1 to the
 * timeline: 0% scroll → frame 0, 100% scroll → final frame, in both directions.
 * `play()` is NEVER called and the video never loops — we only seek currentTime,
 * so stopping the scroll freezes the exact frame.
 *
 * Performance model:
 *  - the passive scroll listener only "wakes" the rAF loop (no work, no state)
 *  - seeking + text fading happen inside requestAnimationFrame
 *  - time-based exponential smoothing (responsive, no visible jump)
 *  - at most ONE seek in flight (skip while video.seeking) → no seek flooding
 *  - seeks smaller than ~1 frame are dropped, one exact seek settles at rest
 *  - zero React re-renders on scroll; everything through refs
 *
 * Encoding notes (assets are pre-encoded, not produced at runtime):
 *  - short GOP (keyframe every 10 frames / 0.4s) is what makes random seeking
 *    fast — a seek then decodes at most 10 frames instead of up to a full GOP
 *  - H.264 High in MP4 with +faststart (moov atom first) so seeking works
 *    before the whole file arrives
 *  - audio stripped (silent hero → smaller file, less demux work)
 *  - 720p desktop / 800px mobile caps the decode load; quality stays high
 *    because the camera move is smooth and the bitrate is spent on keyframes
 */
const TAU = 90;           // ms — smoothing time constant (responsive, no lag)
const SEEK_EPS = 0.033;   // s — skip seeks smaller than ~1 frame
const SNAP_EPS = 0.005;   // s — treat as settled below this delta
const VH_PER_SEC = 24;    // scroll track: vh per second of video
const MIN_VH = 260;
const MAX_VH = 400;
const FADE_SPAN = 0.28;   // hero text fully faded at this scroll progress
const MOBILE_QUERY = '(max-width: 820px)';
const LAST_FRAME = 0.02;  // s — duration is exclusive; stay on the last frame

export default function ScrollHeroVideo({
  src,
  srcMobile,
  poster,
  fallbackImage,
  alt,
  children,
  footer,
}) {
  const sectionRef = useRef(null);
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const contentRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!section || !wrap || !video) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let duration = 0;
    let scrub = !mq.matches; // scroll-scrub disabled for reduced motion
    let started = false;      // video ready → allowed to scrub
    let snapped = false;      // initial snap to scroll position done
    let current = 0;          // smoothed video time (s)
    let wasSettled = false;
    let lastNow = 0;
    let loadedSrc = null;     // what the element is currently pointed at
    let top = 0;              // cached: section top in document
    let track = 1;            // cached: scroll distance of the track
    let heroFlag = null;      // body[data-hero-active] cache

    video.muted = true; // guarantee muted attribute even after React re-mounts

    /* ---- cached geometry (no per-frame layout reads) ---- */
    const measure = () => {
      const rect = section.getBoundingClientRect();
      top = rect.top + window.scrollY;
      track = Math.max(1, rect.height - window.innerHeight);
    };

    const progress = () =>
      Math.min(1, Math.max(0, (window.scrollY - top) / track));

    const applyHeight = () => {
      if (!duration || !Number.isFinite(duration)) return;
      const vh = Math.min(MAX_VH, Math.max(MIN_VH, Math.round(duration * VH_PER_SEC)));
      section.style.height = `${vh}vh`;
      measure();
    };

    /* ---- source selection (one lighter encode for small screens) ---- */
    const pickSrc = () =>
      (window.matchMedia(MOBILE_QUERY).matches && srcMobile) || src;

    const loadSource = (next) => {
      loadedSrc = next || pickSrc();
      video.src = loadedSrc;
      video.load();
    };

    /* ---- header transparency flag while the pinned hero is on screen ---- */
    const setHeroFlag = (v) => {
      if (v === heroFlag) return;
      heroFlag = v;
      if (v) document.body.dataset.heroActive = v;
      else delete document.body.dataset.heroActive;
    };

    /* ---- hero text fade (direct style, no re-renders) ---- */
    const fade = (p) => {
      const f = Math.min(1, p / FADE_SPAN);
      const op = 1 - f;
      for (const el of [contentRef.current, footerRef.current]) {
        if (!el) continue;
        el.style.opacity = op;
        el.style.transform = f ? `translateY(${(-16 * f).toFixed(1)}px)` : '';
        el.style.visibility = op <= 0.01 ? 'hidden' : '';
      }
    };

    /* ---- the rAF loop ---- */
    const tick = (now) => {
      raf = 0;
      const p = progress();

      if (scrub && started && duration) {
        const targetTime = Math.min(p * duration, Math.max(0, duration - LAST_FRAME));
        if (!snapped) {
          current = targetTime; // align instantly on first ready frame
          snapped = true;
        } else {
          const dt = lastNow ? Math.min(64, now - lastNow) : 16;
          current += (targetTime - current) * (1 - Math.exp(-dt / TAU));
          if (Math.abs(targetTime - current) < SNAP_EPS) current = targetTime;
        }

        // one seek in flight at a time — never queue hundreds of seeks
        if (!video.seeking && Math.abs(video.currentTime - current) > SEEK_EPS) {
          video.currentTime = current;
        }

        // one exact seek the moment motion settles → precise start/end frames
        const settled = Math.abs(targetTime - current) < SNAP_EPS;
        if (
          settled &&
          !wasSettled &&
          !video.seeking &&
          Math.abs(video.currentTime - targetTime) > 0.004
        ) {
          video.currentTime = targetTime;
        }
        wasSettled = settled;

        fade(p);
        setHeroFlag(
          window.scrollY - top < track + window.innerHeight - 84 ? '1' : ''
        );

        if (!settled) {
          raf = requestAnimationFrame(tick); // keep converging
        }
      }
      lastNow = now;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* ---- video readiness ---- */
    const onMeta = () => {
      duration = video.duration || 0;
      if (scrub) applyHeight();
    };

    const onLoadedData = () => {
      if (!duration) onMeta();
      if (scrub) applyHeight();
      video.currentTime = 0.001; // force first-frame paint, fires 'seeked'
    };

    const onSeeked = () => {
      if (started) return;
      started = true;
      snapped = false;
      section.classList.remove('is-loading');
      wrap.classList.add('is-ready'); // crossfade reveal over the poster
      wake();
    };

    const onError = () => {
      // mobile encode failed → retry the desktop master once
      if (loadedSrc !== src && src) {
        loadSource(src);
        return;
      }
      // poster image stays visible — hero remains functional
      section.classList.remove('is-loading');
      section.classList.add('is-failed');
      started = false;
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('resize', wake);

    const onMotionChange = () => {
      scrub = !mq.matches;
      if (!scrub) {
        section.style.height = '';
        setHeroFlag(null);
        fade(0);
        measure();
      } else {
        section.classList.remove('is-static');
        if (!loadedSrc) loadSource();
        applyHeight();
      }
      wake();
    };
    mq.addEventListener('change', onMotionChange);

    /* ---- boot ---- */
    measure();
    if (scrub) {
      section.classList.add('is-loading');
      loadSource();
    } else {
      // reduced motion: first frame poster only, no multi-megabyte download
      section.classList.add('is-static');
    }
    wake(); // initial state (flag + fade at progress 0)

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', measure);
      window.removeEventListener('resize', wake);
      mq.removeEventListener('change', onMotionChange);
      setHeroFlag(null);
    };
  }, [src, srcMobile]);

  return (
    <section className="hero hero--video" ref={sectionRef}>
      <div className="hero__sticky">
        {/* first video frame — loading layer, never a blank rectangle */}
        <div className="hero__bg hero__bg--poster">
          <img src={poster} alt="" fetchpriority="high" />
        </div>

        {/* existing hero image — only if the video cannot be decoded */}
        <div className="hero__bg hero__bg--fallback">
          <img src={fallbackImage} alt={alt} />
        </div>

        <div className="hero__bg hero__bg--video" ref={wrapRef}>
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
          />
          <span className="hero__loader" aria-hidden="true" />
        </div>

        <div className="hero__overlay" aria-hidden="true" />

        <div className="hero__fade" ref={contentRef}>
          <div className="container hero__content">{children}</div>
        </div>

        <div className="hero__fade hero__badges" ref={footerRef}>
          {footer}
        </div>
      </div>
    </section>
  );
}
