import { useRef, useState } from 'react';
import {
  Plus,
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  Folder,
  PanelsTopLeft,
  Image,
  CircleHelp,
  Settings,
  Briefcase,
  Rocket,
  ShoppingBag,
  ArrowRight,
  Paperclip,
  MoreVertical,
  Menu,
  X,
} from 'lucide-react';
import {
  Brand,
  IconButton,
  GlowButton,
  Dialog,
  CompCrop,
} from '../components/builder/UI.jsx';
import {
  readProjects,
  saveProjects,
  createProject,
  samples,
} from '../components/builder/store.js';
import '../styles/builder.css';

export default function Dashboard() {
  const [projects, setProjects] = useState(readProjects);
  const [tab, setTab] = useState('All projects');
  const [section, setSection] = useState('Overview');
  const [query, setQuery] = useState('');
  const [list, setList] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [rename, setRename] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const composer = useRef(null),
    file = useRef(null);
  const setAndSave = (next) => {
    setProjects(next);
    if (!saveProjects(next))
      setNotice(
        'Storage is full. Your changes are available for this session.',
      );
  };
  const start = (text = prompt, theme) => {
    if (!text.trim()) {
      composer.current?.focus();
      return;
    }
    const project = createProject(
      text,
      theme ??
        (/startup|analytics/i.test(text)
          ? 'orbit'
          : /store|shop|furniture/i.test(text)
            ? 'forma'
            : 'lumina'),
    );
    location.href = `/workspace?project=${project.id}`;
  };
  const chooseSection = (label) => {
    setSection(label);
    setMobileNav(false);
    setQuery('');
    if (['Settings', 'Help & support', 'Assets'].includes(label))
      setDialog({ type: label });
  };
  const shown = projects.filter(
    (p) =>
      (tab === 'All projects' ||
        p.status === (tab === 'Drafts' ? 'Draft' : 'Published')) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className={`builder-app b-dashboard ${mobileNav ? 'nav-open' : ''}`}>
      <aside id="builder-sidebar" className="b-sidebar">
        <Brand />
        <button
          className="b-workspace-select"
          onClick={() => setDialog({ type: 'Workspace' })}
        >
          Hakam’s workspace <ChevronDown size={17} />
        </button>
        <GlowButton
          className="b-new"
          onClick={() => {
            setSection('Overview');
            setMobileNav(false);
            composer.current?.focus();
          }}
        >
          <Plus size={18} />
          New website
        </GlowButton>
        <nav aria-label="Workspace navigation">
          {[
            [LayoutGrid, 'Overview'],
            [Folder, 'All websites'],
            [PanelsTopLeft, 'Templates'],
            [Image, 'Assets'],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={section === label ? 'selected' : ''}
              onClick={() => chooseSection(label)}
            >
              <Icon size={22} strokeWidth={1.6} />
              {label}
            </button>
          ))}
        </nav>
        <div className="b-sidebar-bottom">
          <button onClick={() => setDialog({ type: 'Help & support' })}>
            <CircleHelp size={21} />
            Help & support
          </button>
          <button onClick={() => setDialog({ type: 'Settings' })}>
            <Settings size={21} />
            Settings
          </button>
          <button
            className="b-profile"
            onClick={() => setDialog({ type: 'Workspace' })}
          >
            <span className="b-avatar">H</span>Hakam
            <ChevronDown size={16} />
          </button>
        </div>
      </aside>
      <div className="b-dashboard-main">
        <header className="b-dashboard-top">
          <IconButton
            className="b-mobile-menu"
            icon={mobileNav ? X : Menu}
            label={mobileNav ? 'Close workspace menu' : 'Open workspace menu'}
            aria-expanded={mobileNav}
            aria-controls="builder-sidebar"
            onClick={() => setMobileNav(!mobileNav)}
          />
          <span>
            Workspace <b>/</b> {section}
          </span>
          <label className="b-search global">
            <Search size={19} />
            <input
              aria-label="Search websites"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            className="b-avatar"
            aria-label="Account settings"
            onClick={() => setDialog({ type: 'Workspace' })}
          >
            H
          </button>
        </header>
        <main className="b-dashboard-content">
          {section !== 'Templates' && (
            <section className="b-start">
              <h1>
                {section === 'All websites'
                  ? 'Your next idea starts here.'
                  : 'What will you build today?'}
              </h1>
              <p>
                Turn your idea into a website. Make it yours with a
                conversation.
              </p>
              <form
                className="b-composer dashboard-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  start();
                }}
              >
                <textarea
                  ref={composer}
                  aria-label="Describe your website"
                  placeholder="Describe the website you want to create…"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') start();
                  }}
                />
                <div className="b-composer-bottom">
                  <div>
                    <IconButton
                      icon={Plus}
                      label="Attach a reference"
                      onClick={() => file.current.click()}
                    />
                    <button
                      type="button"
                      className="b-outline"
                      onClick={() => file.current.click()}
                    >
                      <Paperclip size={19} />
                      {attachment ? attachment.name : 'Add reference'}
                    </button>
                  </div>
                  <GlowButton type="submit">
                    Start building
                    <ArrowRight size={20} />
                  </GlowButton>
                </div>
              </form>
              <input
                ref={file}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setAttachment(f);
                    setNotice(
                      'Reference attached for this session. Image analysis is not connected in this demo.',
                    );
                  }
                }}
              />
              <div className="b-suggestions">
                {[
                  [
                    Briefcase,
                    'Portfolio',
                    'Create a warm editorial portfolio for an architecture studio.',
                    'lumina',
                  ],
                  [
                    Rocket,
                    'Startup landing page',
                    'Create a website for an analytics startup.',
                    'orbit',
                  ],
                  [
                    ShoppingBag,
                    'Online store',
                    'Create a furniture and home objects store.',
                    'forma',
                  ],
                ].map(([Icon, label, text, theme]) => (
                  <button
                    key={label}
                    onClick={() => {
                      setPrompt(text);
                      composer.current.focus();
                      composer.current.dataset.theme = theme;
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
                <button onClick={() => chooseSection('Templates')}>
                  <PanelsTopLeft size={19} />
                  Start from a template
                </button>
              </div>
            </section>
          )}
          <section className="b-projects">
            <div className="b-projects-heading">
              <h2>
                {section === 'Templates'
                  ? 'Start with something beautiful.'
                  : 'Your websites'}
              </h2>
              <div>
                <label className="b-search">
                  <Search size={17} />
                  <input
                    aria-label="Search projects"
                    placeholder="Search projects"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <div className="b-segment">
                  <IconButton
                    icon={LayoutGrid}
                    active={!list}
                    label="Grid view"
                    aria-pressed={!list}
                    onClick={() => setList(false)}
                  />
                  <IconButton
                    icon={List}
                    active={list}
                    label="List view"
                    aria-pressed={list}
                    onClick={() => setList(true)}
                  />
                </div>
              </div>
            </div>
            {section !== 'Templates' && (
              <div
                className="b-filter-tabs"
                role="tablist"
                aria-label="Project status"
              >
                {['All projects', 'Published', 'Drafts'].map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className={`b-project-grid ${list ? 'list-view' : ''}`}>
              {(section === 'Templates'
                ? samples.filter((p) =>
                    p.name.toLowerCase().includes(query.toLowerCase()),
                  )
                : shown
              ).map((p) => (
                <article className="b-project-card" key={p.id}>
                  <a
                    href={
                      section === 'Templates'
                        ? '#'
                        : `/workspace?project=${p.id}`
                    }
                    onClick={(e) => {
                      if (section === 'Templates') {
                        e.preventDefault();
                        start(`Start from ${p.name}`, p.theme);
                      }
                    }}
                    aria-label={`${section === 'Templates' ? 'Use' : 'Open'} ${p.name}`}
                  >
                    <CompCrop type={p.theme} />
                    <div className="b-project-meta">
                      <div>
                        <h3>{p.name}</h3>
                        <p>
                          {section === 'Templates'
                            ? 'Use this template'
                            : p.edited}
                        </p>
                      </div>
                      <span className={`b-status ${p.status.toLowerCase()}`}>
                        {section === 'Templates' ? 'Template' : p.status}
                      </span>
                    </div>
                  </a>
                  {section !== 'Templates' && (
                    <details className="b-project-menu">
                      <summary aria-label={`Options for ${p.name}`}>
                        <MoreVertical size={21} />
                      </summary>
                      <div>
                        <button
                          onClick={() => {
                            setRename(p.name);
                            setDialog({ type: 'Rename website', project: p });
                          }}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            setAndSave([
                              {
                                ...p,
                                id: crypto.randomUUID(),
                                name: `${p.name} copy`,
                                status: 'Draft',
                                edited: 'Edited just now',
                              },
                              ...projects,
                            ]);
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() =>
                            setDialog({ type: 'Delete website', project: p })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </details>
                  )}
                </article>
              ))}
            </div>
            {section !== 'Templates' && !shown.length && (
              <div className="b-empty">
                <Folder size={30} />
                <h3>No websites found</h3>
                <p>Try a different search or start a new website.</p>
                <button
                  className="b-outline"
                  onClick={() => {
                    setQuery('');
                    setTab('All projects');
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
            <p className="b-demo-note">
              Sample projects to help you get started. Changes save on this
              device.
            </p>
          </section>
        </main>
      </div>
      {notice && (
        <output className="b-toast">
          {notice}
          <IconButton
            icon={X}
            label="Dismiss notification"
            onClick={() => setNotice('')}
          />
        </output>
      )}
      {dialog && (
        <Dialog title={dialog.type} onClose={() => setDialog(null)}>
          {dialog.type === 'Rename website' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!rename.trim()) return;
                setAndSave(
                  projects.map((p) =>
                    p.id === dialog.project.id
                      ? { ...p, name: rename.trim() }
                      : p,
                  ),
                );
                setDialog(null);
              }}
            >
              <label>
                Website name
                <input
                  value={rename}
                  onChange={(e) => setRename(e.target.value)}
                  required
                  maxLength={60}
                />
              </label>
              <GlowButton>Save name</GlowButton>
            </form>
          ) : dialog.type === 'Delete website' ? (
            <>
              <p>Remove “{dialog.project.name}” from this device?</p>
              <div className="b-dialog-actions">
                <button className="b-outline" onClick={() => setDialog(null)}>
                  Cancel
                </button>
                <GlowButton
                  onClick={() => {
                    setAndSave(
                      projects.filter((p) => p.id !== dialog.project.id),
                    );
                    setDialog(null);
                  }}
                >
                  Delete website
                </GlowButton>
              </div>
            </>
          ) : dialog.type === 'Assets' ? (
            <>
              <p>
                Attach a reference image to your next website prompt. References
                remain on your device in this demo.
              </p>
              <button
                className="b-outline"
                onClick={() => {
                  setDialog(null);
                  file.current?.click();
                }}
              >
                <Plus size={18} />
                Add a reference
              </button>
              {attachment && <p>{attachment.name}</p>}
            </>
          ) : dialog.type === 'Settings' ? (
            <>
              <p>Your workspace is stored locally in this browser.</p>
              <p>
                AI generation, accounts, and hosting are not connected yet. You
                can create projects and try the supported preview edits.
              </p>
            </>
          ) : dialog.type === 'Workspace' ? (
            <>
              <div className="b-account-line">
                <span className="b-avatar">H</span>
                <div>
                  <h3>Hakam’s workspace</h3>
                  <p>Personal · local demo</p>
                </div>
              </div>
              <p>{projects.length} websites on this device</p>
            </>
          ) : (
            <>
              <p>
                Start with a prompt or choose a template. Open a project to edit
                its preview in a conversation.
              </p>
              <p>
                Try “Make the theme dark” or “Change the heading to “Your new
                heading””. Use History to restore an earlier version.
              </p>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
