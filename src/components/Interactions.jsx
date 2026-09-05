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
import { ArrowUp, ChevronDown, Globe, Menu, Plus, X } from 'lucide-react';
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
        <a className="nav-cta" href="/contact" onClick={() => setOpen(false)}>
          Get Started <span aria-hidden="true">↗</span>
        </a>
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
            className="faq-answer"
            hidden={open !== index}
          >
            <p>{answer}</p>
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
  'Create CRM contact from email',
  'Generate weekly performance report',
  'Summarize customer feedback',
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
      let delay = deleting ? 25 : 70;
      if (length === text.length) {
        deleting = true;
        delay = 2200;
      }
      if (length === 0 && deleting) {
        deleting = false;
        index = (index + 1) % prompts.length;
        delay = 350;
      }
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div {...props} className={`${className} prompt-demo`} style={style}>
      <div className="prompt-model">
        <span>
          GPT 5.5 <ChevronDown size={12} />
        </span>
        <Globe size={16} />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setNotice(true);
        }}
      >
        <input
          aria-label="AI prompt demo"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setNotice(false);
          }}
          placeholder={placeholder}
        />
        <div className="prompt-bottom">
          <div className="prompt-chips">
            <span>Chat</span>
            <span>Launch Workflow</span>
            <span>Data Analysis</span>
          </div>
          <button type="submit" aria-label="Send demo prompt">
            <ArrowUp size={16} />
          </button>
        </div>
      </form>
      {notice && (
        <output className="prompt-notice">
          Preview only — connect an AI service to run this workflow.
        </output>
      )}
    </div>
  );
}

export function Reveal({ as: Tag = 'div', children, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.animate(
            [
              { opacity: 0, translate: '0 20px' },
              { opacity: 1, translate: '0 0' },
            ],
            { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' },
          );
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag {...props} ref={ref}>
      {children}
    </Tag>
  );
}

export function Ticker({ children, style, ...props }) {
  const items = Children.toArray(children).filter(
    (child) => typeof child === 'object',
  );
  return (
    <ul
      {...props}
      className="react-ticker"
      style={{
        ...style,
        width: 'max-content',
        maxWidth: 'none',
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
