import { useEffect, useRef } from 'react';

/**
 * Scroll-scrubbed hero video.
 *
 * The section is a tall scroll track (height set from the video duration);
 * the actual 100vh view is position:sticky. Scroll position maps 1:1 to the
 * video timeline (0% scroll → frame 0, 100% scroll → final frame). The video
 * is NEVER played (`play()` is never called) — we only seek `currentTime`.
 *
 * Performance model:
 *  - passive scroll listener only "wakes" the rAF loop (no work in listener)
 *  - the loop stops itself once the smoothed time has settled
 *  - time-based exponential smoothing (no jitter, no big lag)
 *  - seeks are skipped when within one frame of the rendered time
 *  - zero React re-renders on scroll; all updates via refs
 */
const TAU = 90;           // ms — smoothing time constant (responsive, no lag)
const SEEK_EPS = 0.033;   // s — skip seeks smaller than ~1 frame
const SNAP_EPS = 0.005;   // s — treat as settled below this delta
const VH_PER_SEC = 24;    // scroll track: vh per second of video
const MIN_VH = 260;
const MAX_VH = 400;
const FADE_SPAN = 0.28;   // hero text fully faded at this scroll progress

export default function ScrollHeroVideo({ src, poster, alt, children, footer }) {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
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
    let lastNow = 0;
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
        const targetTime = p * duration;
        if (!snapped) {
          current = targetTime; // align instantly on first ready frame
          snapped = true;
        } else {
          const dt = lastNow ? Math.min(64, now - lastNow) : 16;
          current += (targetTime - current) * (1 - Math.exp(-dt / TAU));
          if (Math.abs(targetTime - current) < SNAP_EPS) current = targetTime;
        }
        // only seek when meaningfully off — prevents seek-event flooding
        if (Math.abs(video.currentTime - current) > SEEK_EPS) {
          video.currentTime = current;
        }
        fade(p);
        setHeroFlag(window.scrollY - top < track + window.innerHeight - 84 ? '1' : '');

        if (Math.abs(targetTime - current) >= SNAP_EPS) {
          raf = requestAnimationFrame(tick); // keep converging
        }
      }
      lastNow = now;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* ---- video readiness ---- */
    const onLoadedData = () => {
      duration = video.duration || 0;
      if (scrub) applyHeight();
      video.currentTime = 0.001; // force first-frame paint, fires 'seeked'
    };

    const onSeeked = () => {
      if (started) return;
      started = true;
      snapped = false;
      wrap.classList.add('is-ready'); // crossfade reveal over the poster
      wake();
    };

    const onError = () => {
      // poster image stays visible — hero remains functional (req. 18)
      wrap.classList.add('is-failed');
      started = false;
    };

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
      } else {
        applyHeight();
      }
      wake();
    };
    mq.addEventListener('change', onMotionChange);

    measure();
    wake(); // initial state (flag + fade at progress 0)

    if (video.readyState >= 2 && !started) onLoadedData(); // cached video

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', measure);
      window.removeEventListener('resize', wake);
      mq.removeEventListener('change', onMotionChange);
      setHeroFlag(null);
    };
  }, [src]);

  return (
    <section className="hero hero--video" ref={sectionRef}>
      <div className="hero__sticky" ref={stickyRef}>
        {/* fallback / loading layer — always underneath the video */}
        <div className="hero__bg hero__bg--poster">
          <img src={poster} alt={alt} fetchpriority="high" />
        </div>

        <div className="hero__bg hero__bg--video" ref={wrapRef}>
          <video
            ref={videoRef}
            src={src}
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

        <div className="hero__fade hero__badges" ref={footerRef}>{footer}</div>
      </div>
    </section>
  );
}
