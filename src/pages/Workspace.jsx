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
  reconstruct,
  watchReconstruction,
  imageData,
  exportProject,
} from '../components/builder/client.js';
import ReconstructionReview from '../components/builder/ReconstructionReview.jsx';
import GeneratedPreview from '../components/builder/GeneratedPreview.jsx';
import WorkspaceAccess from '../components/builder/WorkspaceAccess.jsx';
import { samples } from '../components/builder/store.js';
import '../styles/builder.css';
const workflowLabels = {
  capturing: 'Inspect reference',
  rebuilding: 'Reconstruct design',
  comparing: 'Compare layouts',
  personalizing: 'Apply your brief',
  editing: 'Apply your changes',
  checking: 'Check all screen sizes',
  saving: 'Save version',
};
export default function Workspace() {
  const [project, setProject] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [prompt, setPrompt] = useState(''),
    [busy, setBusy] = useState(false),
    [stage, setStage] = useState(''),
    [progress, setProgress] = useState(null),
    [stageHistory, setStageHistory] = useState([]),
    [elapsed, setElapsed] = useState(0),
    [draft, setDraft] = useState(null),
    [reconstructionJob, setReconstructionJob] = useState(null),
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
    setDraft(
      p.generation?.draftSite
        ? {
            draftSite: p.generation.draftSite,
            completed: p.generation.completed,
            total: p.generation.total || 6,
          }
        : null,
    );
    const savedMessages = p.messages || [];
    const pendingPrompt = p.generation?.prompt;
    setMessages(
      pendingPrompt && savedMessages.at(-1)?.text !== pendingPrompt
        ? [...savedMessages, { role: 'user', text: pendingPrompt }]
        : savedMessages,
    );
  };
  async function run(
    text,
    p = project,
    { redesign = false, mode: requestedMode } = {},
  ) {
    if (!p || busy || !text.trim()) return;
    const mode =
      requestedMode ||
      (p.generation?.engine === 'reconstruction' && p.generation.prompt === text
        ? p.generation.mode || 'clone'
        : p.site?.variants?.length
          ? 'edit'
          : !p.site && !p.generation
            ? 'build'
            : null);
    setBusy(true);
    setError('');
    setPrompt('');
    setStage('Preparing your website');
    setStageHistory(['Preparing your website']);
    setProgress(null);
    setReconstructionJob(null);
    setElapsed(0);
    setPanel('Chat');
    lastRequest.current = { text, redesign, mode };
    setMessages([...(p.messages || []), { role: 'user', text }]);
    controller.current = new AbortController();
    try {
      accept(
        await (mode ? reconstruct : generate)(
          p.id,
          text,
          (next) => {
            setStage(next);
            setStageHistory((items) =>
              items.at(-1) === next ? items : [...items, next],
            );
            setProgress(null);
          },
          controller.current.signal,
          {
            redesign,
            mode,
            onProgress: setProgress,
            onCheckpoint: setDraft,
            onJob: (job) => {
              setReconstructionJob(job);
              setProgress(
                ['editing', 'personalizing', 'comparing'].includes(job.phase)
                  ? job.progress || null
                  : null,
              );
            },
          },
        ),
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
        accept(saved);
      } catch {
        /* Retain the current version when offline. */
      }
    } finally {
      setBusy(false);
      setStage('');
    }
  }
  useEffect(() => {
    if (!busy) return;
    const start = reconstructionJob?.createdAt || Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [busy, reconstructionJob?.createdAt]);
  const startInitial = useEffectEvent((p) => run(p.prompt, p));
  const reconnectJob = useEffectEvent(async (p) => {
    setBusy(true);
    controller.current = new AbortController();
    try {
      accept(
        await watchReconstruction(
          p.id,
          p.reconstruction.jobId,
          setStage,
          controller.current.signal,
          {
            onJob: (job) => {
              setReconstructionJob(job);
              setProgress(
                ['editing', 'personalizing', 'comparing'].includes(job.phase)
                  ? job.progress || null
                  : null,
              );
              setStageHistory(job.events.map((e) => e.stage));
            },
            onCheckpoint: setDraft,
          },
        ),
      );
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
      const saved = await api('project', null, { query: `&id=${p.id}` }).catch(
        () => null,
      );
      if (saved) accept(saved);
    } finally {
      setBusy(false);
      setStage('');
    }
  });
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
            redesign: p.generation?.redesign || false,
            mode:
              p.generation?.mode ||
              (p.generation?.engine === 'reconstruction' ? 'clone' : undefined),
          };
        }
        setLoading(false);
        if (
          p.reconstruction &&
          ['queued', 'running', 'comparing'].includes(p.reconstruction.status)
        ) {
          reconnectJob(p);
        } else if (url.searchParams.get('new') === '1') {
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
                          : 'I’ll choose a Framer reference, reconstruct and compare its design, then apply your brief with Kimi.'}
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
                    <div className="b-generation-progress">
                      {!!reconstructionJob?.steps?.length && (
                        <ol
                          className="b-workflow-steps"
                          aria-label="Website workflow"
                        >
                          {reconstructionJob.steps.map((step) => (
                            <li
                              key={step}
                              data-state={
                                reconstructionJob.completedSteps?.includes(step)
                                  ? 'complete'
                                  : reconstructionJob.phase === step
                                    ? 'current'
                                    : 'pending'
                              }
                              aria-current={
                                reconstructionJob.phase === step
                                  ? 'step'
                                  : undefined
                              }
                            >
                              <span>{workflowLabels[step]}</span>
                              {reconstructionJob.completedSteps?.includes(
                                step,
                              ) && <Check size={13} aria-label="Completed" />}
                            </li>
                          ))}
                        </ol>
                      )}
                      {!reconstructionJob?.steps?.length &&
                        stageHistory.length > 1 && (
                          <ol aria-label="Generation progress">
                            {stageHistory
                              .slice(0, -1)
                              .slice(-4)
                              .map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                          </ol>
                        )}
                      <p className="b-working">
                        {stage}
                        <span>…</span>
                      </p>
                      <small aria-live="off">
                        {Math.floor(elapsed / 60)}:
                        {String(elapsed % 60).padStart(2, '0')} elapsed
                        {progress?.detail ? ` · ${progress.detail}` : ''}
                      </small>
                    </div>
                  </div>
                )}
                {reconstructionJob?.browser?.liveUrl && (
                  <a
                    className="b-outline"
                    href={reconstructionJob.browser.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch browser inspection
                  </a>
                )}
                <ReconstructionReview reconstruction={project.reconstruction} />
                {!busy && draft && !error && (
                  <button
                    className="b-outline"
                    onClick={() =>
                      run(
                        project.generation?.prompt ||
                          lastRequest.current?.text ||
                          project.prompt,
                        project,
                        {
                          redesign:
                            project.generation?.redesign ||
                            lastRequest.current?.redesign ||
                            false,
                          mode:
                            project.generation?.mode ||
                            lastRequest.current?.mode ||
                            (project.generation?.engine === 'reconstruction'
                              ? 'clone'
                              : undefined),
                        },
                      )
                    }
                  >
                    Resume generation
                  </button>
                )}
                {error && (
                  <div className="b-generation-error" role="alert">
                    <p>{error}</p>
                    <button
                      className="b-outline"
                      disabled={busy}
                      onClick={() =>
                        run(
                          lastRequest.current?.text ||
                            project.generation?.prompt ||
                            project.failedPrompt ||
                            project.prompt,
                          project,
                          {
                            redesign: lastRequest.current?.redesign,
                            mode:
                              lastRequest.current?.mode ||
                              project.generation?.mode ||
                              (project.generation?.engine === 'reconstruction'
                                ? 'clone'
                                : undefined),
                          },
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
                        onClick={async () => {
                          if (
                            reconstructionJob &&
                            ['queued', 'running'].includes(
                              reconstructionJob.status,
                            )
                          )
                            await api('reconstruction-cancel', {
                              job: reconstructionJob.id,
                            });
                          controller.current?.abort();
                        }}
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
                    <>
                      <GlowButton
                        disabled={busy || pending}
                        onClick={() =>
                          run(project.prompt, project, { mode: 'build' })
                        }
                      >
                        Build from this reference
                      </GlowButton>
                      <GlowButton
                        disabled={busy || pending}
                        onClick={() =>
                          run(project.prompt, project, {
                            redesign: true,
                            mode: 'clone',
                          })
                        }
                      >
                        Reconstruct this reference
                      </GlowButton>
                      <p>
                        Build applies your brief after checking the captured
                        layout. Reconstruct keeps the reference content for you
                        to edit later.
                      </p>
                    </>
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
            {draft && (
              <output className="b-draft-status">
                Draft preview · {draft.completed}/{draft.total} steps saved
                {busy ? ' · Building…' : ' · Saved draft'}
              </output>
            )}
            <div
              className={`b-live-preview b-generated-container device-${device.toLowerCase()}`}
            >
              <GeneratedPreview site={draft?.draftSite || project.site} />
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
