import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import {
  useReferenceLoops,
  useReferenceScroll,
} from './components/ReferenceMotion.jsx';
import routes from './data/routes.json';
import routePreloads from './data/route-preloads.json';
import {
  routeGradient,
  moveRouteGradient,
} from './components/RouteGradient.js';

const modules = import.meta.glob('./pages/*.jsx');
const requests = new Map();
const imageRequests = new Map();
const normalizePath = (pathname) =>
  decodeURI(pathname).replace(/\/+$/, '') || '/';
function loadPage(path) {
  const route =
    routes.find((route) => route.path === path) ??
    routes.find((route) => route.path === '/404');
  if (!requests.has(route.path)) {
    const request = modules[`./pages/${route.component}.jsx`]().catch(
      (error) => {
        requests.delete(route.path);
        throw error;
      },
    );
    requests.set(route.path, request);
  }
  return requests.get(route.path);
}
function warmImages(path) {
  return Promise.allSettled(
    (routePreloads[path] ?? []).map(({ src, srcSet, sizes }) => {
      const key = `${src}:${innerWidth}`;
      if (!imageRequests.has(key)) {
        const image = new Image();
        if (sizes) image.sizes = sizes;
        if (srcSet) image.srcset = srcSet;
        image.src = src;
        imageRequests.set(
          key,
          image.decode().catch(() => {}),
        );
      }
      return imageRequests.get(key);
    }),
  );
}
const pages = Object.fromEntries(
  routes.map((route) => [route.path, lazy(() => loadPage(route.path))]),
);
const currentPath = () => normalizePath(location.pathname);

function PageReady({ children }) {
  useReferenceLoops();
  useReferenceScroll();
  useEffect(() => {
    if (location.hash)
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView(),
      );
  }, []);
  return children;
}

class PageErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="route-message">
        <h1>This page could not load.</h1>
        <p>Please refresh to get the latest version.</p>
        <button onClick={() => location.reload()}>Refresh page</button>
        <a href="/">Back to home</a>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function App() {
  const [screen, setScreen] = useState(() => ({
    path: currentPath(),
    Page: pages[currentPath()] ?? pages['/404'],
  }));
  const current = useRef(screen);
  const surface = useRef(null);
  const { path, Page } = screen;
  useLayoutEffect(() => {
    current.current = screen;
    const route =
      routes.find((route) => route.path === path) ??
      routes.find((route) => route.path === '/404');
    document.title = route.title;
    document.querySelector('meta[name="description"]').content =
      route.description;
  }, [path, screen]);

  useEffect(() => {
    let requestId = 0,
      transition,
      gradientAnimation;
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const status = (value) => {
      if (surface.current) surface.current.dataset.navigationState = value;
    };
    const scrollToDestination = (url, position) => {
      if (position)
        window.scrollTo({
          left: position[0],
          top: position[1],
          behavior: 'instant',
        });
      else if (url.hash)
        document
          .getElementById(decodeURIComponent(url.hash.slice(1)))
          ?.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    async function changePage(url, mode = 'push', position) {
      const id = ++requestId;
      transition?.skipTransition();
      const nextPath = normalizePath(url.pathname);
      if (nextPath === current.current.path) {
        if (mode === 'push' && url.href !== location.href)
          history.pushState(null, '', url);
        scrollToDestination(url, position);
        status('idle');
        return;
      }
      status('preparing');
      try {
        // Keep the current DOM and scroll position until the destination is ready.
        const images = warmImages(nextPath);
        const module = await loadPage(nextPath);
        let deadline;
        await Promise.race([
          images,
          new Promise((resolve) => {
            deadline = setTimeout(resolve, 600);
          }),
        ]);
        clearTimeout(deadline);
        if (id !== requestId) return;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Read the in-flight position before cancelling, so rapid navigation continues smoothly.
        const previousGradient = reduced
          ? null
          : routeGradient(surface.current);
        gradientAnimation?.cancel();
        const commit = () => {
          if (id !== requestId) return;
          if (mode === 'push') {
            history.replaceState(
              { ...history.state, fusionScroll: [scrollX, scrollY] },
              '',
              location.href,
            );
            history.pushState(null, '', url);
          }
          // The destination module is resolved, so this cannot flash Suspense's fallback.
          flushSync(() => setScreen({ path: nextPath, Page: module.default }));
          scrollToDestination(url, position);
        };
        if (
          previousGradient &&
          !reduced &&
          nextPath !== '/' &&
          nextPath !== '/404'
        ) {
          status('transitioning');
          commit();
          gradientAnimation = moveRouteGradient(
            previousGradient,
            routeGradient(surface.current),
          );
          if (surface.current)
            surface.current.dataset.navigationMode = gradientAnimation
              ? 'gradient-morph'
              : 'instant';
          if (gradientAnimation)
            await gradientAnimation.finished.catch(() => {});
        } else if (document.startViewTransition && !reduced) {
          if (surface.current)
            surface.current.dataset.navigationMode = 'crossfade';
          status('transitioning');
          transition = document.startViewTransition(commit);
          transition.ready.catch(() => {});
          await transition.finished.catch(() => {});
        } else {
          if (surface.current)
            surface.current.dataset.navigationMode = 'instant';
          commit();
        }
        if (id === requestId) status('idle');
      } catch {
        if (id === requestId) location.assign(url.href);
      }
    }
    function internalLink(event) {
      const anchor = event.target.closest?.('a[href]');
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      )
        return null;
      const url = new URL(anchor.href);
      return url.origin === location.origin ? url : null;
    }
    function prepare(event) {
      const url = internalLink(event);
      if (!url || normalizePath(url.pathname) === current.current.path) return;
      const nextPath = normalizePath(url.pathname);
      loadPage(nextPath).catch(() => {});
      void warmImages(nextPath);
    }
    function navigate(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const url = internalLink(event);
      if (!url) return;
      if (url.pathname === location.pathname && url.hash) {
        requestId++;
        transition?.skipTransition();
        status('idle');
        return;
      }
      event.preventDefault();
      void changePage(url);
    }
    const onPop = (event) => {
      void changePage(new URL(location.href), 'pop', event.state?.fusionScroll);
    };
    document.addEventListener('click', navigate);
    document.addEventListener('pointerover', prepare);
    document.addEventListener('focusin', prepare);
    window.addEventListener('popstate', onPop);
    return () => {
      requestId++;
      transition?.skipTransition();
      gradientAnimation?.cancel();
      history.scrollRestoration = previousRestoration;
      document.removeEventListener('click', navigate);
      document.removeEventListener('pointerover', prepare);
      document.removeEventListener('focusin', prepare);
      window.removeEventListener('popstate', onPop);
    };
  }, []);
  return (
    <div ref={surface} data-route={path} data-navigation-state="idle">
      <PageErrorBoundary key={path}>
        <Suspense
          fallback={<output className="route-message">Loading…</output>}
        >
          <PageReady>
            <Page />
          </PageReady>
        </Suspense>
      </PageErrorBoundary>
    </div>
  );
}
