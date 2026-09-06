import { categories } from '../../shared/categories.js';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
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
  PanelsTopLeft,
  Square,
  RefreshCw,
} from 'lucide-react';
import {
  Brand,
  IconButton,
  GlowButton,
  Dialog,
  orb,
} from '../components/builder/UI.jsx';
import {
  api,
  generate,
  imageData,
  exportProject,
} from '../components/builder/client.js';
import GeneratedPreview from '../components/builder/GeneratedPreview.jsx';
import WorkspaceAccess from '../components/builder/WorkspaceAccess.jsx';
import { samples } from '../components/builder/store.js';
import '../styles/builder.css';
export default function Workspace() {
  const [project, setProject] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [prompt, setPrompt] = useState(''),
    [busy, setBusy] = useState(false),
    [stage, setStage] = useState(''),
    [messages, setMessages] = useState([]),
    [device, setDevice] = useState('Desktop'),
    [mobileTab, setMobileTab] = useState('Chat'),
    [panel, setPanel] = useState('Chat'),
    [dialog, setDialog] = useState(null),
    [name, setName] = useState(''),
    [designRequest, setDesignRequest] = useState(''),
    [pending, setPending] = useState(false);
  const controller = useRef(null),
    file = useRef(null),
    conversation = useRef(null),
    textarea = useRef(null),
    lastRequest = useRef(null);
  const accept = (p) => {
    setProject(p);
    setMessages(p.messages || []);
  };
  async function run(text, p = project, { redesign = false } = {}) {
    if (!p || busy || !text.trim()) return;
    setBusy(true);
    setError('');
    setPrompt('');
    setStage('Preparing your website');
    setPanel('Chat');
    lastRequest.current = { text, redesign };
    setMessages([...(p.messages || []), { role: 'user', text }]);
    controller.current = new AbortController();
    try {
      accept(
        await generate(p.id, text, setStage, controller.current.signal, {
          redesign,
        }),
      );
      setMobileTab('Preview');
    } catch (e) {
      setError(
        e.name === 'AbortError'
          ? 'Generation stopped. Your saved version is unchanged.'
          : e.message,
      );
      try {
        const saved = await api('project', null, { query: `&id=${p.id}` });
        setProject(saved);
      } catch {
        /* Retain the current version when offline. */
      }
    } finally {
      setBusy(false);
      setStage('');
    }
  }
  const startInitial = useEffectEvent((p) => run(p.prompt, p));
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const url = new URL(location.href);
        let id = url.searchParams.get('project');
        let p;
        if (samples.some((s) => s.id === id)) {
          const sample = samples.find((s) => s.id === id);
          const { importLegacyProject } =
            await import('../components/builder/migrate.js');
          p = await importLegacyProject(sample);
          id = p.id;
          history.replaceState(null, '', `/workspace?project=${id}`);
        } else
          p = await api('project', null, {
            query: `&id=${encodeURIComponent(id || '')}`,
          });
        if (!live) return;
        accept(p);
        if (p.generationError) {
          setError(p.generationError);
          lastRequest.current = {
            text: p.failedPrompt || p.prompt,
            redesign: false,
          };
        }
        setLoading(false);
        if (url.searchParams.get('new') === '1') {
          history.replaceState(null, '', `/workspace?project=${id}`);
          startInitial(p);
        }
      } catch (e) {
        if (live) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      live = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    conversation.current?.scrollTo({
      top: conversation.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, stage, error]);
  const mutate = async (action, body = {}) => {
    if (busy || pending) return;
    setPending(true);
    try {
      const p = await api(action, { id: project.id, ...body });
      accept(p);
      return p;
    } catch (e) {
      setNotice(e.message);
    } finally {
      setPending(false);
    }
  };
  const discover = async (reroll = false) => {
    setStage('Finding matching Framer references');
    const p = await mutate('discover', { reroll });
    setStage('');
    if (p) setPanel('References');
  };
  const shareUrl = project?.shareId
    ? `${location.origin}/site?share=${project.shareId}`
    : '';
  const previewUrl = project ? `/site?project=${project.id}` : '#';
  const download = async () => {
    setPending(true);
    try {
      await exportProject(project.id);
      setNotice(
        'Downloaded your editable React project and standalone website.',
      );
    } catch (e) {
      setNotice(e.message);
    } finally {
      setPending(false);
    }
  };
  if (loading || !project)
    return (
      <div className="builder-app b-load-state">
        <Brand />
        <h1>{loading ? 'Opening your workspace…' : 'Website unavailable'}</h1>
        {error && <p role="alert">{error}</p>}
        <a className="b-outline" href="/dashboard">
          Back to projects
        </a>
      </div>
    );
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
          onClick={() => {
            setName(project.name);
            setDialog('Project settings');
          }}
        >
          {project.name}
          <ChevronDown size={16} />
        </button>
        <span className="b-saved">
          <CircleCheck size={15} />
          {busy ? 'Building…' : pending ? 'Saving…' : 'Saved'}
        </span>
        <div className="b-editor-actions">
          <IconButton
            icon={Undo2}
            label="Undo change"
            disabled={project.activeVersion <= 0 || busy || pending}
            onClick={() =>
              mutate('restore', { index: project.activeVersion - 1 })
            }
          />
          <IconButton
            icon={Redo2}
            label="Redo change"
            disabled={
              project.activeVersion >= project.versions.length - 1 ||
              busy ||
              pending
            }
            onClick={() =>
              mutate('restore', { index: project.activeVersion + 1 })
            }
          />
          <IconButton
            icon={History}
            label="Version history"
            onClick={() => setDialog('Version history')}
          />
          <button
            className="b-outline"
            disabled={!project.site || busy}
            onClick={() => setDialog('Share website')}
          >
            <Share2 size={17} />
            Share
          </button>
          <GlowButton
            disabled={!project.site || busy}
            onClick={() => setDialog('Publish website')}
          >
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
            [PanelsTopLeft, 'References'],
            [File, 'Pages'],
            [Palette, 'Design'],
            [Image, 'Assets'],
          ].map(([Icon, label]) => (
            <IconButton
              key={label}
              icon={Icon}
              label={label}
              active={panel === label}
              aria-pressed={panel === label}
              onClick={() => {
                setPanel(label);
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
            label="Workspace access"
            onClick={() => setDialog('Workspace access')}
          />
        </nav>
        <aside className="b-chat-panel">
          <header>
            <h1>{panel === 'Chat' ? 'Build with Fusion' : panel}</h1>
            <IconButton
              icon={MessageSquare}
              label="Focus chat"
              onClick={() => {
                setPanel('Chat');
                textarea.current?.focus();
              }}
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
                {!messages.length && (
                  <div className="b-message assistant">
                    <img
                      className="b-message-avatar"
                      src={orb}
                      alt="Fusion AI"
                    />
                    <div>
                      <p>
                        {project.site
                          ? 'Your website is ready. What would you like to change?'
                          : 'I’ll find a Framer reference for your brief, inspect its design, and build your first website.'}
                      </p>
                      <p>{project.prompt}</p>
                      {!busy && (
                        <button
                          className="b-outline"
                          onClick={() => run(project.prompt)}
                        >
                          Generate website
                        </button>
                      )}
                    </div>
                  </div>
                )}
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
                      {m.changed && (
                        <span className="b-preview-updated">
                          <Check size={16} />
                          Preview updated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(busy || stage) && (
                  <div className="b-message assistant">
                    <img className="b-message-avatar" src={orb} alt="" />
                    <p className="b-working">
                      {stage}
                      <span>…</span>
                    </p>
                  </div>
                )}
                {error && (
                  <div className="b-generation-error" role="alert">
                    <p>{error}</p>
                    <button
                      className="b-outline"
                      disabled={busy}
                      onClick={() =>
                        run(
                          lastRequest.current?.text || project.prompt,
                          project,
                          { redesign: lastRequest.current?.redesign },
                        )
                      }
                    >
                      <RefreshCw size={15} />
                      Retry
                    </button>
                    <button
                      className="b-outline"
                      onClick={() => {
                        setError('');
                        setPanel('References');
                      }}
                    >
                      View references
                    </button>
                  </div>
                )}
              </div>
              <div className="b-chat-composer">
                <form
                  className="b-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(prompt);
                  }}
                >
                  <textarea
                    ref={textarea}
                    maxLength={6000}
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
                        run(prompt);
                      }
                    }}
                  />
                  <div className="b-composer-bottom">
                    <div>
                      <IconButton
                        icon={Paperclip}
                        label="Attach image"
                        disabled={busy || pending}
                        onClick={() => file.current.click()}
                      />
                      <button
                        type="button"
                        className="b-outline"
                        onClick={() => setPanel('References')}
                      >
                        References
                      </button>
                    </div>
                    {busy ? (
                      <button
                        type="button"
                        className="b-outline"
                        onClick={() => controller.current?.abort()}
                      >
                        <Square size={15} />
                        Stop
                      </button>
                    ) : (
                      <GlowButton
                        aria-label="Send message"
                        disabled={!prompt.trim() || pending}
                      >
                        <Send size={20} />
                      </GlowButton>
                    )}
                  </div>
                </form>
                <p className="b-demo-note">
                  Frontend generation · versions save to your workspace.
                </p>
              </div>
            </>
          ) : (
            <div className="b-tool-panel">
              {panel === 'References' ? (
                <>
                  <h2>Design references</h2>
                  <p>
                    Matches from Framer’s{' '}
                    {project.category.replaceAll('-', ' ')} category. Choose a
                    reference or let Fusion pick one.
                  </p>
                  <label>
                    Category
                    <select
                      value={project.category}
                      disabled={busy || pending}
                      onChange={async (e) => {
                        setStage('Finding references');
                        await mutate('discover', { category: e.target.value });
                        setStage('');
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c.replaceAll('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="b-outline"
                    disabled={busy || pending}
                    onClick={() => discover(true)}
                  >
                    <RefreshCw size={16} />
                    {project.candidates?.length
                      ? 'Find other designs'
                      : 'Find matching designs'}
                  </button>
                  {stage && <output>{stage}…</output>}
                  {project.candidates?.map((r) => (
                    <article
                      key={r.listingUrl}
                      className={`b-reference-card ${project.reference?.listingUrl === r.listingUrl ? 'selected' : ''}`}
                    >
                      {r.thumbnail && (
                        <img
                          src={r.thumbnail}
                          alt={`${r.name} template preview`}
                          loading="lazy"
                        />
                      )}
                      <h3>{r.name}</h3>
                      <p>{r.reason}</p>
                      <div>
                        <a href={r.previewUrl} target="_blank" rel="noreferrer">
                          Open live preview <ExternalLink size={13} />
                        </a>
                        <button
                          className="b-outline"
                          disabled={
                            busy ||
                            pending ||
                            project.reference?.listingUrl === r.listingUrl
                          }
                          onClick={() =>
                            mutate('select', { listingUrl: r.listingUrl })
                          }
                        >
                          {project.reference?.listingUrl === r.listingUrl
                            ? 'Selected'
                            : 'Select'}
                        </button>
                      </div>
                      <small>
                        <a href={r.listingUrl} target="_blank" rel="noreferrer">
                          Creator listing
                        </a>{' '}
                        · {r.license}
                      </small>
                    </article>
                  ))}
                  {project.reference && (
                    <GlowButton
                      disabled={busy || pending}
                      onClick={() =>
                        run(project.prompt, project, { redesign: true })
                      }
                    >
                      {project.site
                        ? 'Build another design'
                        : 'Build this design'}
                    </GlowButton>
                  )}
                  {project.inspection && (
                    <p>
                      {project.inspection.available
                        ? 'Reference inspected at desktop and mobile sizes.'
                        : project.inspection.reason}
                    </p>
                  )}
                </>
              ) : panel === 'Pages' ? (
                <>
                  <h2>Your website</h2>
                  <button
                    className="b-page-item selected"
                    onClick={() => setMobileTab('Preview')}
                  >
                    <File size={17} />
                    Home
                  </button>
                  <p>
                    This version builds complete single-page websites.
                    Navigation links move between sections.
                  </p>
                  {project.validation && (
                    <p>
                      <Check size={16} />
                      Desktop and phone browser checks passed.
                    </p>
                  )}
                </>
              ) : panel === 'Design' ? (
                <>
                  <h2>Make it yours</h2>
                  <p>
                    Describe a typography, color, spacing or layout change.
                    Fusion updates the actual website and saves a new version.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(designRequest);
                      setDesignRequest('');
                    }}
                  >
                    <label>
                      Design change
                      <textarea
                        value={designRequest}
                        maxLength={6000}
                        placeholder="Use an editorial serif for headings and warm ivory backgrounds…"
                        onChange={(e) => setDesignRequest(e.target.value)}
                      />
                    </label>
                    <GlowButton
                      disabled={!designRequest.trim() || busy || pending}
                    >
                      Apply change
                    </GlowButton>
                  </form>
                  <button
                    className="b-outline"
                    disabled={!project.site || pending}
                    onClick={download}
                  >
                    <Download size={16} />
                    Download React source
                  </button>
                </>
              ) : (
                <>
                  <h2>Your images</h2>
                  <p>
                    Upload images for your website. Mention an image by its
                    filename in chat to use it. PNG, JPEG or WebP, up to 1.2 MB
                    each.
                  </p>
                  <button
                    className="b-outline"
                    disabled={busy || pending}
                    onClick={() => file.current.click()}
                  >
                    <Plus size={16} />
                    Upload image
                  </button>
                  {project.assets.map((a) => (
                    <figure className="b-uploaded-image" key={a.id}>
                      <img src={a.url} alt={a.description} />
                      <figcaption>{a.description}</figcaption>
                    </figure>
                  ))}
                </>
              )}
            </div>
          )}
        </aside>
        <main className="b-preview-panel">
          <div className="b-preview-toolbar">
            <div className="b-segment">
              <button
                className="active"
                onClick={() => setMobileTab('Preview')}
              >
                Preview
              </button>
              <button
                onClick={() => {
                  setPanel('References');
                  setMobileTab('Chat');
                }}
              >
                Reference
              </button>
            </div>
            <div className="b-segment b-devices">
              {[
                [Monitor, 'Desktop'],
                [Tablet, 'Tablet'],
                [Smartphone, 'Phone'],
              ].map(([Icon, label]) => (
                <IconButton
                  key={label}
                  icon={Icon}
                  label={`${label} preview`}
                  active={device === label}
                  aria-pressed={device === label}
                  onClick={() => setDevice(label)}
                />
              ))}
            </div>
            <a
              className="b-preview-address"
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open preview
              <ExternalLink size={17} />
            </a>
          </div>
          <div className="b-preview-stage">
            <div
              className={`b-live-preview b-generated-container device-${device.toLowerCase()}`}
            >
              <GeneratedPreview site={project.site} />
            </div>
          </div>
        </main>
      </div>
      <input
        hidden
        ref={file}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setPending(true);
          try {
            accept(
              await api('upload', {
                id: project.id,
                name: f.name,
                data: await imageData(f),
              }),
            );
            setNotice('Image uploaded. Ask Fusion to use it in your website.');
            setPanel('Assets');
          } catch (e) {
            setNotice(e.message);
          } finally {
            setPending(false);
            e.target.value = '';
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
              <p>Restore a saved design. Your conversation stays available.</p>
              <div className="b-history">
                {!project.versions.length && (
                  <p>Your first version appears here after generation.</p>
                )}
                {project.versions.map((v, i) => (
                  <button
                    key={v.id}
                    disabled={busy || pending}
                    className={project.activeVersion === i ? 'selected' : ''}
                    onClick={async () => {
                      await mutate('restore', { index: i });
                      setDialog(null);
                    }}
                  >
                    <History size={18} />
                    <span>
                      Version {i + 1}
                      <small>{v.prompt}</small>
                    </span>
                    {project.activeVersion === i && <Check size={17} />}
                  </button>
                ))}
              </div>
            </>
          ) : dialog === 'Project settings' ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await mutate('rename', { name });
                setDialog(null);
              }}
            >
              <label>
                Website name
                <input
                  value={name}
                  maxLength={100}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <GlowButton disabled={pending}>Save name</GlowButton>
            </form>
          ) : dialog === 'Workspace access' ? (
            <WorkspaceAccess />
          ) : (
            <>
              <p>
                Publish a snapshot of your current design. Anyone with its link
                can view the website. Your chat, uploads list and version
                history stay private.
              </p>
              {shareUrl && (
                <>
                  <label>
                    Published website URL
                    <input
                      readOnly
                      aria-label="Published website URL"
                      value={shareUrl}
                    />
                  </label>
                  <a
                    href={shareUrl}
                    className="b-outline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open website <ExternalLink size={16} />
                  </a>
                  <button
                    className="b-outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        setNotice('Website link copied.');
                      } catch {
                        setNotice('Select and copy the website URL manually.');
                      }
                    }}
                  >
                    Copy link
                  </button>
                </>
              )}
              <div className="b-dialog-actions">
                <GlowButton
                  disabled={busy || pending || !project.site}
                  onClick={async () => {
                    const p = await mutate('share');
                    if (p) setNotice('Your website is published.');
                  }}
                >
                  {pending
                    ? 'Saving…'
                    : shareUrl
                      ? 'Publish latest version'
                      : 'Publish website'}
                </GlowButton>
                <button
                  className="b-outline"
                  disabled={!project.site || pending}
                  onClick={download}
                >
                  <Download size={16} />
                  Download React
                </button>
              </div>
              {shareUrl && (
                <button
                  className="b-outline"
                  disabled={pending}
                  onClick={() => mutate('unpublish')}
                >
                  Unpublish
                </button>
              )}
              <p>
                Contact delivery, checkout and other backend features are
                outside this frontend release.
              </p>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
