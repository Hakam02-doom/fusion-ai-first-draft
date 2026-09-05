import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Menu, Plus, X } from 'lucide-react';
import NavButton from './NavButton.jsx';
import PromptShell from './PromptShell.jsx';
export { Reveal } from './EntranceMotion.jsx';
import questions from '../data/faq.json';

const links = [
  ['About us', '/about-us'],
  ['Pricing', '/pricing'],
  ['Integration', '/integrations'],
  ['Blog', '/blog'],
  ['Contact', '/contact'],
  ['Waitlist', '/waitlist'],
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    const escape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  return (
    <nav
      className={`site-nav ${open ? 'is-open' : ''}`}
      aria-label="Main navigation"
    >
      <a className="site-brand" href="/" onClick={() => setOpen(false)}>
        <img
          src="/vendor/framer/images/VNxTg4trlyPkvi55POCdKXQ04kY.png"
          alt=""
          width="40"
          height="40"
        />
        Fusion AI
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className="nav-links" id={id}>
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={location.pathname === href ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
        <NavButton />
      </div>
    </nav>
  );
}

export function FAQList({ className = '', style, ...props }) {
  const [open, setOpen] = useState(1);
  const id = useId();
  return (
    <div {...props} className={`${className} react-faq`} style={style}>
      {questions.map(({ question, answer }, index) => (
        <div className="faq-item" key={question}>
          <h3>
            <button
              type="button"
              aria-expanded={open === index}
              aria-controls={`${id}-${index}`}
              onClick={() => setOpen(open === index ? null : index)}
            >
              {question}
              <Plus size={18} className={open === index ? 'expanded' : ''} />
            </button>
          </h3>
          <div
            id={`${id}-${index}`}
            className={`faq-answer ${open === index ? 'is-open' : ''}`}
            aria-hidden={open !== index}
          >
            <div className="faq-answer-inner">
              <p>{answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const Billing = createContext(null);
export function BillingProvider({ children }) {
  const [yearly, setYearly] = useState(false);
  return (
    <Billing.Provider value={{ yearly, setYearly }}>
      {children}
    </Billing.Provider>
  );
}
export function BillingToggle() {
  const { yearly, setYearly } = useContext(Billing);
  return (
    <fieldset className="billing-toggle" aria-label="Billing period">
      <button
        type="button"
        aria-pressed={!yearly}
        onClick={() => setYearly(false)}
      >
        Monthly
      </button>
      <button
        type="button"
        aria-pressed={yearly}
        onClick={() => setYearly(true)}
      >
        Yearly
      </button>
    </fieldset>
  );
}
export function PlanPrice({ monthly }) {
  const { yearly } = useContext(Billing);
  return (
    <span data-plan-price={monthly} aria-live="polite">
      {yearly ? ({ $22: '$29', $69: '$49' }[monthly] ?? monthly) : monthly}
    </span>
  );
}

export function PreviewForm({
  children,
  action: _action,
  method: _method,
  ...props
}) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      {children}
      {submitted && (
        <output className="form-notice">
          This is a website preview. Your details have not been sent.
          Submissions will be available when the service is connected.
        </output>
      )}
    </form>
  );
}

const prompts = [
  'Generate weekly sales summary report',
  'Create CRM contact from emails',
  'Schedule meetings and send invites automatically',
  'Schedule meetings and send invites automatically',
];
export function PromptDemo({ className = '', style, ...props }) {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState(prompts[0]);
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let index = 0,
      length = 0,
      deleting = false,
      timer;
    function tick() {
      const text = prompts[index];
      length += deleting ? -1 : 1;
      setPlaceholder(text.slice(0, length));
      let delay = deleting ? 20 : 100;
      if (length === text.length) {
        deleting = true;
        delay = 1800;
      }
      if (length === 0 && deleting) {
        deleting = false;
        index = (index + 1) % prompts.length;
        delay = 100;
      }
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <PromptShell
        {...props}
        className={className}
        style={style}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          setValue(event.target.value);
          setNotice(false);
        }}
        onSend={() => setNotice(true)}
      />
      {notice && (
        <output className="prompt-notice">
          Preview only — connect an AI service to run this workflow.
        </output>
      )}
    </>
  );
}

export function Ticker({ children, style, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    function measure() {
      const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
      const distance = (node.scrollWidth + gap) / 2;
      node.style.setProperty('--ticker-distance', `${-distance}px`);
      node.style.setProperty('--ticker-duration', `${distance / 50}s`);
    }
    const observer = new IntersectionObserver((entries) => {
      node.dataset.motionVisible = String(
        entries.some((entry) => entry.isIntersecting) && !document.hidden,
      );
    });
    const resize = new ResizeObserver(measure);
    observer.observe(node);
    resize.observe(node);
    measure();
    function visibility() {
      node.dataset.motionVisible = String(
        !document.hidden &&
          node.getBoundingClientRect().bottom > 0 &&
          node.getBoundingClientRect().top < innerHeight,
      );
    }
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const items = Children.toArray(children).filter(
    (child) => typeof child === 'object',
  );
  return (
    <ul
      {...props}
      className="react-ticker"
      ref={ref}
      style={{
        ...style,
        width: 'max-content',
        maxWidth: 'none',
        left: 0,
        animationDirection: parseFloat(style?.left) < 0 ? 'reverse' : 'normal',
        transform: undefined,
      }}
    >
      {items}
      {items.map((child, index) =>
        cloneElement(child, {
          key: `duplicate-${index}`,
          'aria-hidden': true,
          inert: true,
        }),
      )}
    </ul>
  );
}

export function Slideshow({ children }) {
  const slides = Children.toArray(children).filter(
    (child) => typeof child === 'object',
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [paused, slides.length]);
  // Pointer and focus listeners pause automatic motion; navigation is handled by the buttons.
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      className="react-slideshow"
      aria-label="Customer testimonials"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul>
        {slides.map((slide, i) =>
          cloneElement(slide, {
            key: i,
            hidden: i !== index,
            'aria-hidden': i !== index,
            style: {
              ...slide.props.style,
              width: '100%',
              display: i === index ? 'block' : 'none',
              transform: 'none',
            },
          }),
        )}
      </ul>
      <div
        className="slideshow-dots"
        aria-label="Slideshow pagination controls"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Scroll to page ${i + 1}`}
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
          />
        ))}
      </div>
    </section>
  );
}

export function PromoCard({ children, ...props }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div {...props}>
      <button
        className="promo-close"
        type="button"
        aria-label="Dismiss template promotion"
        onClick={() => setClosed(true)}
      >
        <X size={14} />
      </button>
      {children}
    </div>
  );
}
