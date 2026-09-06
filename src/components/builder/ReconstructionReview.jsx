import { useState, useEffect } from 'react';
import { api } from './client.js';
export default function ReconstructionReview({ reconstruction }) {
  const [width, setWidth] = useState(1440),
    [images, setImages] = useState(null),
    [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !reconstruction?.jobId) return;
    let live = true,
      urls = [];

    Promise.all(
      ['reference', 'generated'].map((kind) =>
        api('reconstruction-artifact', null, {
          query: `&job=${reconstruction.comparisonJobId || reconstruction.jobId}&name=${kind}-${width}.png`,
          binary: true,
        }),
      ),
    )
      .then((blobs) => {
        urls = blobs.map(URL.createObjectURL);
        if (live) setImages(urls);
        else urls.forEach(URL.revokeObjectURL);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
      urls.forEach(URL.revokeObjectURL);
    };
  }, [open, width, reconstruction?.jobId, reconstruction?.comparisonJobId]);
  if (!reconstruction?.report) return null;
  const check = reconstruction.report.checks.find((c) => c.width === width);
  const baseline =
    reconstruction.status === 'edited' ||
    (reconstruction.mode && reconstruction.mode !== 'clone');
  return (
    <details
      className="b-reconstruction-review"
      onToggle={(e) => {
        setOpen(e.currentTarget.open);
        if (!e.currentTarget.open) {
          setImages(null);
          setError('');
        }
      }}
    >
      <summary>
        Reference comparison ·{' '}
        {baseline
          ? 'Captured baseline'
          : reconstruction.report.passed
            ? 'Static layout matched'
            : 'Needs correction'}
      </summary>
      <p>
        {baseline
          ? 'This comparison describes the captured baseline, before later edits. '
          : 'Measured at the captured sizes. '}
        Animation and control coverage are listed separately.
      </p>
      <div className="b-segment">
        {[1440, 768, 390].map((w) => (
          <button
            key={w}
            onClick={() => {
              if (width === w) return;
              setImages(null);
              setError('');
              setWidth(w);
            }}
            aria-pressed={width === w}
          >
            {w}px
          </button>
        ))}
      </div>
      {check && (
        <p>
          {(check.visual.differentPixelRatio * 100).toFixed(2)}% sampled pixels
          differ · {check.missingHeadings.length} missing headings
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {images ? (
        <div className="b-comparison-images">
          {images.map((url, i) => (
            <figure key={url}>
              <figcaption>{i ? 'Reconstruction' : 'Reference'}</figcaption>
              <a href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt={`${i ? 'Reconstruction' : 'Reference'} at ${width} pixels`}
                />
              </a>
            </figure>
          ))}
        </div>
      ) : open && !error ? (
        <p>Loading comparison…</p>
      ) : null}
      <p>
        {reconstruction.coverage?.capturedControls || 0} captured control
        states. {reconstruction.coverage?.scope}
      </p>
      {!!reconstruction.coverage?.warnings?.length && (
        <ul>
          {reconstruction.coverage.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </details>
  );
}
