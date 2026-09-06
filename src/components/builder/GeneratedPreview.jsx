import { useMemo } from 'react';
import { siteDocument } from '../../../shared/site.js';
export default function GeneratedPreview({ site, title = 'Website preview' }) {
  const html = useMemo(() => (site ? siteDocument(site) : ''), [site]);
  if (!site)
    return (
      <div className="b-generation-empty">
        <h2>Your website starts here.</h2>
        <p>
          Describe your business and the design you have in mind. Fusion will
          find a reference and build your first version.
        </p>
      </div>
    );
  return (
    <iframe
      className="b-generated-frame"
      title={title}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcDoc={html}
    />
  );
}
