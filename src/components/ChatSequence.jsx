import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { entranceAnimation, reducedMotion } from './EntranceMotion.jsx';

const chatSpring = { type: 'spring', stiffness: 500, damping: 60, mass: 0.1 };

const messages = [
  {
    row: 'framer-16m5uc8',
    box: 'framer-6ionjn',
    avatar: 'framer-136ip9c',
    content: 'framer-d3mige',
    text: 'Hey, can you generate a customer follow-up list',
    user: true,
    at: 0,
  },
  {
    row: 'framer-dbr6o2',
    box: 'framer-1imnmob',
    avatar: 'framer-1fndcyj',
    content: 'framer-80dmol-container',
    text: 'Hey Mark - Done—compiled 60 leads and emailed the list to you. Ready for your outreach!',
    at: 1000,
  },
  {
    row: 'framer-1tszh0y',
    box: 'framer-fdkm4k',
    avatar: 'framer-6i49vr',
    content: 'framer-130jn63-container',
    text: 'That’s awesome, thanks!',
    user: true,
    at: 5000,
  },
  {
    row: 'framer-oxy98l',
    box: 'framer-198dnel',
    avatar: 'framer-4oha47',
    content: 'framer-1w2rmw9-container',
    text: 'Want me to draft a quick template for your outreach?',
    at: 8000,
  },
  {
    row: 'framer-1lqp9v2',
    box: 'framer-1i569b7',
    avatar: 'framer-4aadq9',
    content: 'framer-1yiy8hz-container',
    text: 'Yes please—that’d be a huge help!',
    user: true,
    at: 11000,
  },
];
const boxStyle = {
  '--border-bottom-width': '1px',
  '--border-top-width': '1px',
  '--border-left-width': '1px',
  '--border-right-width': '1px',
  '--border-style': 'solid',
  '--border-color': 'rgba(255,255,255,.08)',
  backdropFilter: 'blur(2.5px)',
  backgroundColor: 'rgba(255,255,255,.02)',
  borderRadius: 16,
};
export default function ChatSequence() {
  const ref = useRef(null),
    previousHeight = useRef(0);
  const [count, setCount] = useState(1);
  useEffect(() => {
    const node = ref.current,
      preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false,
      elapsed = 0,
      last = 0,
      frame = 0;
    function tick(now) {
      frame = 0;
      if (!visible || document.hidden || preference.matches) return;
      if (last) elapsed += Math.min(now - last, 100);
      last = now;
      setCount(messages.filter((message) => message.at <= elapsed).length);
      if (elapsed < 11000) frame = requestAnimationFrame(tick);
    }
    function update() {
      cancelAnimationFrame(frame);
      last = 0;
      if (preference.matches) setCount(messages.length);
      else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5,
        );
        update();
      },
      { threshold: 0.5 },
    );
    observer.observe(node.closest('.framer-Bv3CW') || node);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  useLayoutEffect(() => {
    const node = ref.current,
      height = node.getBoundingClientRect().height;
    const animations = [];
    if (
      previousHeight.current &&
      height !== previousHeight.current &&
      !reducedMotion()
    )
      animations.push(
        entranceAnimation(
          node,
          { y: height - previousHeight.current, opacity: 1 },
          chatSpring,
        ),
      );
    for (const row of node.querySelectorAll('.reference-chat-message')) {
      if (row.dataset.chatEntered) continue;
      row.dataset.chatEntered = 'true';
      if (!reducedMotion())
        animations.push(
          entranceAnimation(row, { opacity: 0.001, y: 30 }, chatSpring),
        );
    }
    animations.forEach((animation) => animation.play());
    previousHeight.current = height;
    return () => animations.forEach((animation) => animation.cancel());
  }, [count]);
  return (
    <div
      ref={ref}
      className="framer-8LnrN framer-JY1O8 framer-v0jfm0 framer-v-1brmwzf"
      data-message-count={count}
      style={{ width: '100%' }}
    >
      {messages.slice(0, count).map((message, index) => {
        const avatar = (
          <div className={message.avatar}>
            <img
              src={`/vendor/framer/images/${message.user ? 'GuG9ZZ2TfzZoJIEFtSbrTqZgHz4' : 'sVkwweGRCRcQUW2eM3O9WXUNw4w'}.png`}
              alt={message.user ? 'User avatar' : 'Fusion AI'}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        );
        return (
          <div
            className={`${message.row} reference-chat-message`}
            key={message.row}
          >
            {!message.user && avatar}
            <div className={message.box} data-border="true" style={boxStyle}>
              <div
                className={message.content}
                style={{
                  font: '400 14px/20px Inter, sans-serif',
                  color: message.user ? '#fff' : 'rgba(255,255,255,.75)',
                }}
              >
                {index === 0
                  ? message.text
                  : [...message.text].map((letter, i) => (
                      <span
                        className="reference-chat-letter"
                        key={i}
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        {letter}
                      </span>
                    ))}
              </div>
            </div>
            {message.user && avatar}
          </div>
        );
      })}
    </div>
  );
}
