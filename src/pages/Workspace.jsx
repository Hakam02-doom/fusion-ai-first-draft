import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  CircleCheck,
  Undo2,
  Redo2,
  History,
  Share2,
  MessageSquare,
  File,
  Palette,
  Image,
  Settings,
  Plus,
  Check,
  Paperclip,
  Send,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  X,
  Download,
} from 'lucide-react';
import {
  Brand,
  IconButton,
  GlowButton,
  Dialog,
  CompCrop,
  Website,
  orb,
} from '../components/builder/UI.jsx';
import {
  getProject,
  updateProject,
  applyDemoEdit,
} from '../components/builder/store.js';
import '../styles/builder.css';

const cleanVersion = (project) => {
  const {
    versions: _versions,
    messages: _messages,
    activeVersion: _activeVersion,
    ...rest
  } = project;
  return rest;
};
export default function Workspace() {
  const [initial] = useState(() =>
    getProject(new URLSearchParams(location.search).get('project')),
  );
  const [project, setProject] = useState(initial);
  const [versions, setVersions] = useState(
    () =>
      initial.versions ?? [
        { ...cleanVersion(initial), largeImage: false, simpleNav: false },
        cleanVersion(initial),
      ],
  );
  const [index, setIndex] = useState(
    () => initial.activeVersion ?? (initial.versions?.length ?? 2) - 1,
  );
  const [messages, setMessages] = useState(
    () =>
      initial.messages ?? [
        {
          role: 'user',
          text:
            initial.prompt ??
            'Create a portfolio for an architecture studio. Warm neutrals, bold typography, and large project images.',
        },
        {
          role: 'assistant',
          text: `I’ve created ${initial.name} with a ${initial.theme === 'lumina' ? 'warm editorial' : 'clean, considered'} style.`,
          checklist: [
            'Responsive home page',
            'Selected projects gallery',
            'Contact section',
          ],
          version: true,
        },
        {
          role: 'user',
          text: 'Make the hero image larger and simplify the navigation.',
        },
        {
          role: 'assistant',
          text: 'Done. The imagery now leads, with a cleaner four-link navigation.',
          changed: true,
        },
      ],
  );
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState('Desktop');
  const [mobileTab, setMobileTab] = useState('Chat');
  const [panel, setPanel] = useState('Chat');
  const [page, setPage] = useState('Home');
  const [dialog, setDialog] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [notice, setNotice] = useState('');
  const [storageOk, setStorageOk] = useState(true);
  const timer = useRef(null),
    conversation = useRef(null),
    textarea = useRef(null),
    file = useRef(null),
    preview = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const ok = updateProject({
      ...project,
      messages,
      versions,
      activeVersion: index,
    });
    queueMicrotask(() => setStorageOk(ok));
  }, [project, messages, versions, index]);
  const moveVersion = (to) => {
    setIndex(to);
    setProject(versions[to]);
  };
  const commit = (next, nextMessages = messages) => {
    const history = [...versions.slice(0, index + 1), cleanVersion(next)].slice(
      -30,
    );
    setVersions(history);
    setIndex(history.length - 1);
    setProject(next);
    setMessages(nextMessages);
  };
  const send = (e) => {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    const text = prompt.trim();
    const nextMessages = [
      ...messages,
      { role: 'user', text, attachment: attachment?.name },
    ];
    setMessages(nextMessages);
    setPrompt('');
    setAttachment(null);
    setBusy(true);
    requestAnimationFrame(() => {
      conversation.current?.scrollTo({
        top: conversation.current.scrollHeight,
        behavior: 'smooth',
      });
    });
    timer.current = setTimeout(() => {
      const result = applyDemoEdit(project, text);
      const all = [
        ...nextMessages,
        { role: 'assistant', text: result.reply, changed: result.changed },
      ];
      if (result.changed) commit(result.project, all);
      else setMessages(all);
      setBusy(false);
      requestAnimationFrame(() => {
        conversation.current?.scrollTo({
          top: conversation.current.scrollHeight,
          behavior: 'smooth',
        });
        textarea.current?.focus();
      });
    }, 500);
  };
  const download = () => {
    const clone = preview.current.querySelector('.b-website').cloneNode(true);
    clone.querySelectorAll('img').forEach((img) => {
      img.src = new URL(img.getAttribute('src'), location.origin).href;
    });
    const css = [...document.styleSheets]
      .map((sheet) => {
        try {
          return [...sheet.cssRules].map((rule) => rule.cssText).join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
    const blob = new Blob(
      [
        `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${project.name.replace(/[<>&]/g, '')}</title><style>${css}body{margin:0}.b-website{min-height:100vh}</style>${clone.outerHTML}</html>`,
      ],
      { type: 'text/html' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      'Website exported. Artwork still loads from this app’s hosted assets.',
    );
  };
  const previewUrl = `/site?project=${encodeURIComponent(project.id)}`;
  return (
    <div className={`builder-app b-editor mobile-${mobileTab.toLowerCase()}`}>
      <header className="b-editor-top">
        <Brand />
        <a className="b-back" href="/dashboard">
          <ArrowLeft size={16} />
          Projects
        </a>
        <button
          className="b-project-title"
          onClick={() => setDialog('Project settings')}
        >
          {project.name}
          <ChevronDown size={16} />
        </button>
        <span className="b-saved">
          <CircleCheck size={15} />
          {busy ? 'Updating…' : storageOk ? 'Saved' : 'Not saved'}
        </span>
        <div className="b-editor-actions">
          <IconButton
            icon={Undo2}
            label="Undo change"
            disabled={index <= 0 || busy}
            onClick={() => moveVersion(index - 1)}
          />
          <IconButton
            icon={Redo2}
            label="Redo change"
            disabled={index >= versions.length - 1 || busy}
            onClick={() => moveVersion(index + 1)}
          />
          <IconButton
            icon={History}
            label="Version history"
            onClick={() => setDialog('Version history')}
          />
          <button
            className="b-outline"
            onClick={() => setDialog('Share preview')}
          >
            <Share2 size={17} />
            Share
          </button>
          <GlowButton onClick={() => setDialog('Publish website')}>
            Publish
          </GlowButton>
        </div>
      </header>
      <div className="b-mobile-tabs" role="tablist" aria-label="Builder view">
        {['Chat', 'Preview'].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={mobileTab === t}
            onClick={() => setMobileTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="b-editor-body">
        <nav className="b-tool-rail" aria-label="Builder tools">
          {[
            [MessageSquare, 'Chat'],
            [File, 'Pages'],
            [Palette, 'Design'],
            [Image, 'Assets'],
          ].map(([Icon, name]) => (
            <IconButton
              key={name}
              icon={Icon}
              label={name}
              active={panel === name}
              aria-pressed={panel === name}
              onClick={() => {
                setPanel(name);
                setMobileTab('Chat');
              }}
            />
          ))}
          <IconButton
            className="b-mobile-history"
            icon={History}
            label="Version history"
            onClick={() => setDialog('Version history')}
          />
          <IconButton
            icon={Settings}
            label="Builder settings"
            onClick={() => setDialog('Project settings')}
          />
        </nav>
        <aside className="b-chat-panel">
          <header>
            <h1>{panel === 'Chat' ? 'Build with Fusion' : panel}</h1>
            <IconButton
              icon={MessageSquare}
              label="New conversation"
              onClick={() => setDialog('New conversation')}
            />
          </header>
          {panel === 'Chat' ? (
            <>
              <div
                className="b-conversation"
                ref={conversation}
                role="log"
                aria-label="Website conversation"
                aria-live="polite"
              >
                {messages.map((m, i) => (
                  <div key={i} className={`b-message ${m.role}`}>
                    {m.role === 'assistant' && (
                      <img
                        className="b-message-avatar"
                        src={orb}
                        alt="Fusion AI"
                      />
                    )}
                    <div>
                      <p>{m.text}</p>
                      {m.attachment && (
                        <small>
                          <Paperclip size={13} />
                          {m.attachment}
                        </small>
                      )}
                      {m.checklist && (
                        <ul>
                          {m.checklist.map((item) => (
                            <li key={item}>
                              <Check size={16} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {m.version && (
                        <button
                          className="b-version-card"
                          onClick={() => setDialog('Version history')}
                        >
                          <CompCrop type="architecture" />
                          <span>
                            First design · Version 1
                            <strong>View changes</strong>
                          </span>
                        </button>
                      )}
                      {m.changed && (
                        <span className="b-preview-updated">
                          <Check size={16} />
                          Preview updated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="b-message assistant">
                    <img className="b-message-avatar" src={orb} alt="" />
                    <p className="b-working">
                      Updating your preview<span>…</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="b-chat-composer">
                <form className="b-composer" onSubmit={send}>
                  <textarea
                    ref={textarea}
                    aria-label="Ask Fusion to change your website"
                    placeholder="Ask Fusion to change anything…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        send(e);
                      }
                    }}
                  />
                  {attachment && (
                    <div className="b-attachment">
                      {attachment.name}
                      <IconButton
                        icon={X}
                        label="Remove attachment"
                        onClick={() => setAttachment(null)}
                      />
                    </div>
                  )}
                  <div className="b-composer-bottom">
                    <div>
                      <IconButton
                        icon={Paperclip}
                        label="Attach reference"
                        onClick={() => file.current.click()}
                      />
                      <IconButton
                        icon={Image}
                        label="Attach image"
                        onClick={() => file.current.click()}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="b-outline"
                        onClick={() => setDialog('Demo editing')}
                      >
                        Build
                        <ChevronDown size={14} />
                      </button>
                      <GlowButton
                        aria-label="Send message"
                        disabled={!prompt.trim() || busy}
                      >
                        <Send size={20} />
                      </GlowButton>
                    </div>
                  </div>
                </form>
                <p className="b-demo-note">
                  Local demo · changes save on this device.
                </p>
              </div>
            </>
          ) : (
            <div className="b-tool-panel">
              {panel === 'Pages' ? (
                <>
                  <p>Website pages</p>
                  {['Home', 'Work', 'About', 'Contact'].map((name) => (
                    <button
                      className={`b-page-item ${page === name ? 'selected' : ''}`}
                      key={name}
                      onClick={() => {
                        setPage(name);
                        setMobileTab('Preview');
                      }}
                    >
                      <File size={17} />
                      {name}
                    </button>
                  ))}
                </>
              ) : panel === 'Design' ? (
                <>
                  <h2>Website appearance</h2>
                  <label>
                    Hero heading
                    <textarea
                      value={project.heading}
                      onChange={(e) =>
                        setProject({ ...project, heading: e.target.value })
                      }
                      onBlur={() => commit(project)}
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={project.description}
                      onChange={(e) =>
                        setProject({ ...project, description: e.target.value })
                      }
                      onBlur={() => commit(project)}
                    />
                  </label>
                  <label className="b-check-label">
                    <input
                      type="checkbox"
                      checked={!!project.dark}
                      onChange={(e) =>
                        commit({ ...project, dark: e.target.checked })
                      }
                    />
                    Dark theme
                  </label>
                  <label>
                    Accent color
                    <input
                      type="color"
                      value={project.accent ?? '#26211a'}
                      onChange={(e) =>
                        setProject({ ...project, accent: e.target.value })
                      }
                      onBlur={() => commit(project)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <h2>Reference images</h2>
                  <p>
                    Attach an image to your next message. Image analysis will be
                    available when AI generation is connected.
                  </p>
                  <button
                    className="b-outline"
                    onClick={() => file.current.click()}
                  >
                    <Plus size={18} />
                    Add an image
                  </button>
                  {attachment && <p>{attachment.name}</p>}
                  <CompCrop type="architecture" />
                </>
              )}
            </div>
          )}
        </aside>
        <main className="b-preview-panel">
          <div className="b-preview-toolbar">
            <div className="b-segment">
              <button
                className={panel !== 'Pages' ? 'active' : ''}
                onClick={() => setPanel('Chat')}
              >
                Preview
              </button>
              <button
                className={panel === 'Pages' ? 'active' : ''}
                onClick={() => {
                  setPanel('Pages');
                  setMobileTab('Chat');
                }}
              >
                Pages
              </button>
            </div>
            <div className="b-segment b-devices">
              {[
                [Monitor, 'Desktop'],
                [Tablet, 'Tablet'],
                [Smartphone, 'Phone'],
              ].map(([Icon, name]) => (
                <IconButton
                  key={name}
                  icon={Icon}
                  label={`${name} preview`}
                  active={device === name}
                  aria-pressed={device === name}
                  onClick={() => setDevice(name)}
                />
              ))}
            </div>
            <a
              className="b-preview-address"
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
            >
              {project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              .fusion.site
              <ExternalLink size={17} />
            </a>
          </div>
          <div className="b-preview-stage">
            <div
              ref={preview}
              className={`b-live-preview device-${device.toLowerCase()}`}
            >
              <Website project={project} page={page} />
            </div>
          </div>
        </main>
      </div>
      <input
        hidden
        ref={file}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setAttachment(f);
            setNotice(
              'Reference attached. This demo does not analyze uploaded images.',
            );
          }
        }}
      />
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
        <Dialog title={dialog} onClose={() => setDialog(null)}>
          {dialog === 'Version history' ? (
            <>
              <p>Restore any version saved on this device.</p>
              <div className="b-history">
                {versions.map((version, i) => (
                  <button
                    key={i}
                    className={index === i ? 'selected' : ''}
                    onClick={() => {
                      moveVersion(i);
                      setDialog(null);
                    }}
                  >
                    <History size={18} />
                    <span>
                      Version {i + 1}
                      <small>{version.heading}</small>
                    </span>
                    {index === i && <Check size={17} />}
                  </button>
                ))}
              </div>
            </>
          ) : dialog === 'Project settings' ? (
            <>
              <label>
                Website name
                <input
                  value={project.name}
                  maxLength={60}
                  onChange={(e) =>
                    setProject({ ...project, name: e.target.value })
                  }
                />
              </label>
              <p>
                Saved locally in this browser. This project is a frontend demo.
              </p>
              <GlowButton onClick={() => setDialog(null)}>Done</GlowButton>
            </>
          ) : dialog === 'Publish website' ? (
            <>
              <p>
                Your design is ready to preview or export. Public hosting is not
                connected to the builder yet.
              </p>
              <p>
                Downloading exports this page as HTML. Artwork loads from the
                app’s hosted assets.
              </p>
              <div className="b-dialog-actions">
                <a
                  className="b-outline"
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open preview
                  <ExternalLink size={16} />
                </a>
                <GlowButton onClick={download}>
                  <Download size={17} />
                  Download website
                </GlowButton>
              </div>
            </>
          ) : dialog === 'Share preview' ? (
            <>
              <p>
                This preview link shows the project saved in this browser.
                Custom projects and edits are not synced to other devices.
              </p>
              <input
                readOnly
                aria-label="Preview URL"
                value={location.origin + previewUrl}
              />
              <GlowButton
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      location.origin + previewUrl,
                    );
                    setNotice(
                      'Preview link copied. Local edits stay on this device.',
                    );
                    setDialog(null);
                  } catch {
                    setNotice('Select the preview URL above to copy it.');
                  }
                }}
              >
                Copy preview link
              </GlowButton>
            </>
          ) : dialog === 'New conversation' ? (
            <>
              <p>
                Start a fresh conversation while keeping the current website and
                version history?
              </p>
              <GlowButton
                onClick={() => {
                  setMessages([
                    {
                      role: 'assistant',
                      text: 'Your website is ready. What would you like to change?',
                    },
                  ]);
                  setPanel('Chat');
                  setDialog(null);
                }}
              >
                Start conversation
              </GlowButton>
            </>
          ) : (
            <>
              <p>Try a supported edit:</p>
              <ul>
                <li>Make the theme dark.</li>
                <li>Make the hero image larger.</li>
                <li>Change the heading to “A place to belong”.</li>
              </ul>
              <p>
                These are local preview edits. Full AI generation is not
                connected.
              </p>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
