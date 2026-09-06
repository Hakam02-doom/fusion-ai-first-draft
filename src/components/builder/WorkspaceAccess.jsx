import { useState } from 'react';
import { workspaceKey, restoreWorkspace } from './client.js';
export default function WorkspaceAccess() {
  const [show, setShow] = useState(false),
    [key, setKey] = useState(''),
    [error, setError] = useState(''),
    [copied, setCopied] = useState(false);
  return (
    <>
      <p>
        Projects save to a private workspace. Keep your recovery key to
        open this workspace on another device. Anyone with this key can access
        and edit your projects.
      </p>
      <button className="b-outline" onClick={() => setShow(!show)}>
        {show ? 'Hide recovery key' : 'Show recovery key'}
      </button>
      {show && (
        <label>
          Recovery key
          <input
            readOnly
            aria-label="Workspace recovery key"
            value={workspaceKey()}
          />
          <button
            className="b-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(workspaceKey());
                setCopied(true);
              } catch {
                setError('Select and copy the recovery key manually.');
              }
            }}
          >
            {copied ? 'Copied' : 'Copy key'}
          </button>
        </label>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            restoreWorkspace(key);
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <label>
          Open an existing workspace
          <input
            type="password"
            autoComplete="off"
            aria-label="Existing workspace recovery key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your recovery key"
          />
        </label>
        <button className="b-outline" disabled={!key.trim()}>
          Open workspace
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
