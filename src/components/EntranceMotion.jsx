import {
  Children,
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import motion from '../data/reference-motion.json';

export const reducedMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sample the source spring rather than assigning it an unrelated easing curve.
export function springFrames(transition, from, to) {
  const stiffness = transition.stiffness ?? 170,
    damping = transition.damping ?? 26,
    mass = transition.mass ?? 1;
  const samples = [];
  let position = 0,
    velocity = 0,
    elapsed = 0;
  while (elapsed < 4) {
    samples.push(position);
    for (let n = 0; n < 16; n++) {
      const dt = 1 / 960;
      velocity +=
        ((-stiffness * (position - 1) - damping * velocity) / mass) * dt;
      position += velocity * dt;
      elapsed += dt;
    }
    if (
      elapsed > 0.12 &&
      Math.abs(velocity) < 0.002 &&
      Math.abs(1 - position) < 0.002
    )
      break;
  }
  samples.push(1);
  const keys = Object.keys(from);
  return {
    frames: samples.map((progress) =>
      Object.fromEntries(
        keys.map((key) => [
          key,
          typeof from[key] === 'number'
            ? from[key] + (to[key] - from[key]) * progress
            : to[key],
        ]),
      ),
    ),
    duration: elapsed * 1000,
  };
}
const frameFor = (effect) => ({
  opacity: effect.opacity ?? 1,
  translate: `${effect.x ?? 0}px ${effect.y ?? 0}px`,
  scale: effect.scale ?? 1,
  rotate: `${effect.rotate ?? 0}deg`,
  filter: effect.filter ?? 'blur(0px)',
});
export function entranceAnimation(node, enter, transition = {}, delay = 0) {
  let frames = [frameFor(enter), frameFor({ opacity: 1 })],
    duration = (transition.duration ?? 0.6) * 1000,
    easing = `cubic-bezier(${(transition.ease ?? [0.12, 0.23, 0.5, 1]).join(',')})`;
  if (transition.type === 'spring' && transition.stiffness) {
    const spring = springFrames(transition, { progress: 0 }, { progress: 1 });
    duration = spring.duration;
    easing = 'linear';
    frames = spring.frames.map(({ progress }) =>
      frameFor({
        opacity: (enter.opacity ?? 0) + (1 - (enter.opacity ?? 0)) * progress,
        x: (enter.x ?? 0) * (1 - progress),
        y: (enter.y ?? 0) * (1 - progress),
        scale: (enter.scale ?? 1) + (1 - (enter.scale ?? 1)) * progress,
        filter: `blur(${(parseFloat(enter.filter?.slice(5)) || 0) * (1 - progress)}px)`,
      }),
    );
  }
  const animation = node.animate(frames, {
    duration,
    delay: delay * 1000,
    easing,
    fill: 'both',
  });
  animation.pause();
  animation.onfinish = () => {
    node.dataset.motionState = 'revealed';
    animation.cancel();
  };
  return animation;
}
export function Reveal({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const node = ref.current,
      config = Object.entries(motion.appear).find(([key]) =>
        node.classList.contains(key),
      )?.[1];
    // Unmarked static elements must not acquire an invented rise animation.
    if (!config || reducedMotion()) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const transition = config.animate?.transition ?? {};
    const animation = entranceAnimation(
      node,
      config.enter,
      transition,
      transition.delay ?? 0,
    );
    node.dataset.motionState = 'waiting';
    const play = () => {
      node.dataset.motionState = 'revealing';
      animation.play();
    };
    const threshold = config.trigger === 'mount' ? 0 : (config.threshold ?? 0);
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (entry) =>
              entry.isIntersecting && entry.intersectionRatio >= threshold,
          )
        ) {
          play();
          observer.disconnect();
        }
      },
      { threshold },
    );
    // Mount effects share the page's time origin even when below the fold.
    if (config.trigger === 'mount' && node.getBoundingClientRect().width)
      play();
    else observer.observe(node);
    const stop = () => {
      if (preference.matches) {
        animation.cancel();
        node.dataset.motionState = 'reduced';
      }
    };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      animation.cancel();
      preference.removeEventListener('change', stop);
    };
  }, []);
  return (
    <Tag {...props} ref={ref}>
      {children}
    </Tag>
  );
}

const plainText = (node) =>
  typeof node === 'string'
    ? node
    : isValidElement(node)
      ? Children.toArray(node.props.children).map(plainText).join('')
      : '';
function words(children) {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const text = plainText(child);
    return cloneElement(
      child,
      {},
      text.split(/(\s+)/).map((part, index) =>
        /\S/.test(part) ? (
          <span
            data-motion-word=""
            key={index}
            style={{ display: 'inline-block' }}
          >
            {part}
          </span>
        ) : (
          part
        ),
      ),
    );
  });
}
export function TextReveal({ children, ...props }) {
  const ref = useRef(null),
    content = useMemo(() => words(children), [children]);
  useLayoutEffect(() => {
    const node = ref.current,
      config = Object.entries(motion.text).find(([key]) =>
        node.classList.contains(key),
      )?.[1]?.effect;
    if (!config?.tokenization || reducedMotion() || innerWidth < 810) return;
    const tokens = [...node.querySelectorAll('[data-motion-word]')],
      transition = config.transition ?? {},
      animations = [];
    const lines = [];
    for (const [index, token] of tokens.entries()) {
      const top = token.offsetTop;
      if (!lines.includes(top)) lines.push(top);
      const order = config.tokenization === 'line' ? lines.indexOf(top) : index;
      animations.push(
        entranceAnimation(
          token,
          config.effect,
          transition,
          (config.startDelay ?? 0) + order * (transition.delay ?? 0),
        ),
      );
    }
    const start = () => {
      node.dataset.motionState = 'revealing';
      for (const animation of animations) animation.play();
    };
    const threshold =
      config.trigger === 'onMount' ? 0 : (config.threshold ?? 0);
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (entry) =>
              entry.isIntersecting && entry.intersectionRatio >= threshold,
          )
        ) {
          start();
          observer.disconnect();
        }
      },
      { threshold },
    );
    if (config.trigger === 'onMount' && node.getBoundingClientRect().width)
      start();
    else observer.observe(node);
    const preference = matchMedia('(prefers-reduced-motion: reduce)'),
      stop = () => {
        if (preference.matches)
          animations.forEach((animation) => animation.cancel());
      };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener('change', stop);
    };
  }, []);
  return (
    <div {...props} ref={ref}>
      {content}
    </div>
  );
}
