import { Component, lazy, Suspense, useEffect, useState } from 'react';
import routes from './data/routes.json';

const modules = import.meta.glob('./pages/*.jsx');
const pages = Object.fromEntries(
  routes.map((route) => [
    route.path,
    lazy(modules[`./pages/${route.component}.jsx`]),
  ]),
);
const currentPath = () =>
  decodeURI(location.pathname).replace(/\/+$/, '') || '/';

function PageReady({ children }) {
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
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    const route =
      routes.find((route) => route.path === path) ??
      routes.find((route) => route.path === '/404');
    document.title = route.title;
    document.querySelector('meta[name="description"]').content =
      route.description;
    if (!location.hash) window.scrollTo(0, 0);
  }, [path]);

  useEffect(() => {
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
      const anchor = event.target.closest('a[href]');
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      )
        return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      event.preventDefault();
      history.pushState(null, '', url.pathname + url.search + url.hash);
      setPath(currentPath());
      if (!url.hash) window.scrollTo(0, 0);
    }
    document.addEventListener('click', navigate);
    return () => document.removeEventListener('click', navigate);
  }, []);
  const Page = pages[path] ?? pages['/404'];
  return (
    <div>
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
