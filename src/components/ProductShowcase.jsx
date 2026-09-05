import { useEffect, useRef, useState } from 'react';
import slides from '../data/product-showcase.json';
const imageClasses = ['framer-12l2tza', 'framer-sghvb8', 'framer-1f9lc07'];
const contentClasses = ['framer-u2e16b', 'framer-1r0s6mx', 'framer-s9cy8x'];
const tabClasses = ['framer-rciabq', 'framer-148v3tm', 'framer-1m8swkv'];
export default function ProductShowcase(props) {
  const ref = useRef(null),
    progress = useRef(null),
    elapsed = useRef(0),
    index = useRef(0);
  const [active, setActive] = useState(0);
  const select = (value) => {
    index.current = value;
    elapsed.current = 0;
    setActive(value);
    if (progress.current) progress.current.style.scale = '0 1';
  };
  useEffect(() => {
    const root = ref.current,
      preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false,
      last = 0,
      frame = 0,
      started = false;
    function tick(now) {
      frame = 0;
      if (!visible || document.hidden || preference.matches) return;
      if (last) elapsed.current += Math.min(now - last, 100);
      last = now;
      if (elapsed.current >= 7000) {
        index.current = (index.current + 1) % slides.length;
        elapsed.current = 0;
        setActive(index.current);
      }
      if (progress.current)
        progress.current.style.scale = `${elapsed.current / 7000} 1`;
      frame = requestAnimationFrame(tick);
    }
    function update() {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden && !preference.matches)
        frame = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible = entry.isIntersecting;
        if (!started && entry.intersectionRatio >= 0.5) started = true;
        visible = visible && started;
        update();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(root);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return (
    <div
      {...props}
      ref={ref}
      data-showcase-active={active}
      data-reference-showcase=""
    >
      <div className="framer-9bqe4j">
        {slides.map((slide, i) => (
          <div
            className={imageClasses[i]}
            key={slide.src}
            data-active={active === i}
            aria-hidden={active !== i}
          >
            <div className={contentClasses[i]}>
              <img
                src={slide.src}
                alt={
                  [
                    'Workflow canvas',
                    'Analytics and insights dashboard',
                    'Available integrations',
                  ][i]
                }
                width="2280"
                height="1310"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'fill',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="framer-cgrhdk" aria-label="Product preview controls">
        {slides.map((slide, i) => (
          <button
            key={i}
            className="showcase-progress"
            data-active={active === i}
            aria-label={`Show ${slide.label.split(':')[0]}`}
            aria-pressed={active === i}
            onClick={() => select(i)}
          >
            <span ref={active === i ? progress : null} />
          </button>
        ))}
      </div>
      <div className="framer-aa7mnq">
        {slides.map((slide, i) => (
          <button
            key={i}
            className={tabClasses[i]}
            data-active={active === i}
            onClick={() => select(i)}
            aria-pressed={active === i}
          >
            <span className="framer-text framer-styles-preset-1e7rr0f">
              <strong className="framer-text">
                {slide.label.split(':')[0]}:
              </strong>
              {slide.label.slice(slide.label.indexOf(':') + 1)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
