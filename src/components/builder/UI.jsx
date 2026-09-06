import { useEffect, useRef, useId } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
export const orb = '/vendor/framer/images/VNxTg4trlyPkvi55POCdKXQ04kY.png';
export function Brand({ compact = false }) {
  return (
    <a className="b-brand" href="/dashboard" aria-label="Fusion AI dashboard">
      <img src={orb} alt="" />
      {!compact && <span>Fusion AI</span>}
    </a>
  );
}
export function IconButton({
  icon: Icon,
  label,
  active,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      className={`b-icon ${active ? 'active' : ''} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon size={20} strokeWidth={1.6} />
    </button>
  );
}
export function GlowButton({ children, className = '', ...props }) {
  return (
    <button className={`b-glow ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Dialog({ title, children, onClose }) {
  const titleId = useId();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="b-dialog"
      aria-labelledby={titleId}
      onCancel={onClose}
    >
      <div className="b-dialog-title">
        <h2 id={titleId}>{title}</h2>
        <IconButton icon={X} label="Close dialog" onClick={onClose} />
      </div>
      {children}
    </dialog>
  );
}
// Only artwork and miniature website previews are taken from the approved comp.
// Application text, controls, cards, and the live website are real DOM elements.
export function CompCrop({ type, className = '' }) {
  const crops = {
    lumina: [331, 607, 363, 230],
    orbit: [730, 607, 362, 230],
    forma: [1130, 607, 362, 230],
    architecture: [967, 244, 590, 562],
    detail: [848, 874, 359, 115],
    building: [543, 874, 300, 115],
    timber: [1220, 874, 312, 115],
  };
  const [x, y, w, h] = crops[type] ?? crops.lumina;
  const source = ['architecture', 'detail', 'building', 'timber'].includes(type)
    ? 'workspace'
    : 'dashboard';
  return (
    <figure
      className={`b-art ${className}`}
      style={{ aspectRatio: `${w}/${h}` }}
      aria-label={
        type === 'architecture'
          ? 'Sunlit architecture with warm plaster walls, an olive tree, and an oak chair'
          : `${type} website preview`
      }
    >
      <img
        alt=""
        src={`/builder/${source}-art.png`}
        draggable="false"
        style={{
          width: `${(1586 / w) * 100}%`,
          height: `${(992 / h) * 100}%`,
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
        }}
      />
    </figure>
  );
}
export function Website({ project, page = 'Home' }) {
  const [name, heading] = [project.name, project.heading];
  return (
    <div
      className={`b-website theme-${project.theme} ${project.dark ? 'is-dark' : ''} ${project.largeImage ? 'large-image' : ''}`}
      style={{ '--site-accent': project.accent ?? '#26211a' }}
    >
      <header>
        <a href="#home">{name.toUpperCase()}</a>
        <nav aria-label="Website preview navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#journal">Journal</a>
          {!project.simpleNav && <a href="#services">Services</a>}
          <a href="#contact">Contact</a>
        </nav>
      </header>
      {page === 'Home' ? (
        <>
          <section className="b-web-hero" id="home">
            <div>
              <h1>
                {heading === 'Spaces that feel like home.' ? (
                  <>
                    <span className="b-title-line">Spaces that</span>
                    <span className="b-title-line b-title-last">
                      feel like home.
                    </span>
                  </>
                ) : (
                  heading
                )}
              </h1>
              <p>{project.description}</p>
              <a className="b-web-link" href="#work">
                {project.theme === 'forma'
                  ? 'Shop the collection'
                  : project.theme === 'orbit'
                    ? 'Explore the platform'
                    : 'Explore our work'}{' '}
                <ArrowUpRight size={19} />
              </a>
            </div>
            <CompCrop
              type={project.theme === 'lumina' ? 'architecture' : project.theme}
            />
          </section>
          <section id="work" className="b-web-work">
            <p>SELECTED WORK</p>
            <div>
              <CompCrop type="building" />
              <CompCrop type="detail" />
              <CompCrop type="timber" />
            </div>
          </section>
          <section id="about" className="b-web-copy">
            <h2>Designed with purpose.</h2>
            <p>{project.description}</p>
          </section>
          <section id="journal" className="b-web-copy">
            <h2>Journal</h2>
            <p>Ideas, materials, and places that inspire our work.</p>
          </section>
          <section id="services" className="b-web-copy">
            <h2>Our approach</h2>
            <p>
              Thoughtful design from the first conversation to the final detail.
            </p>
          </section>
          <section id="contact" className="b-web-copy">
            <h2>Let’s make something beautiful.</h2>
            <p>Get in touch to discuss your next project.</p>
          </section>
        </>
      ) : (
        <section className="b-web-copy">
          <h1>{page}</h1>
          <p>
            {page === 'About'
              ? project.description
              : 'A place for your next story. Add your content in the builder.'}
          </p>
          <CompCrop type="architecture" />
        </section>
      )}
    </div>
  );
}
