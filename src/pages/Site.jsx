import { useEffect, useState } from 'react';
import { api } from '../components/builder/client.js';
import GeneratedPreview from '../components/builder/GeneratedPreview.jsx';
import '../styles/builder.css';
export default function Site() {
  const [site, setSite] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    let live = true;
    const request = q.get('share')
      ? fetch(
          `/api/builder?action=public&id=${encodeURIComponent(q.get('share'))}`,
        ).then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          return d;
        })
      : api('project', null, {
          query: `&id=${encodeURIComponent(q.get('project') || '')}`,
        });
    request
      .then((p) => {
        if (live) {
          if (!p.site)
            throw new Error('This project has not generated a website yet.');
          document.title = p.site.title;
          setSite(p.site);
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, []);
  return (
    <main className="b-public-site">
      {error ? (
        <div className="b-load-state">
          <h1>Website unavailable</h1>
          <p role="alert">{error}</p>
          <a href="/dashboard">Back to Fusion</a>
        </div>
      ) : site ? (
        <GeneratedPreview site={site} title={site.title} />
      ) : (
        <output className="b-load-state">Loading website…</output>
      )}
    </main>
  );
}
