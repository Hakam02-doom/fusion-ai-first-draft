import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Website } from './UI.jsx';
import css from '../../styles/builder.css?raw';
import { api, workspaceKey } from './client.js';
export async function importLegacyProject(project) {
  const mapKey = `fusion-import-${workspaceKey().slice(0, 16)}-${project.id}`;
  const known = localStorage.getItem(mapKey);
  if (known) {
    try {
      return await api('project', null, { query: `&id=${known}` });
    } catch {
      /* A deleted cloud copy can be imported again. */
    }
  }
  const html = renderToStaticMarkup(
    React.createElement(Website, { project }),
  ).replaceAll('src="/', 'src="https://fusion-ai-first-draft.vercel.app/');
  const p = await api('import', {
    prompt: project.prompt || project.description,
    site: {
      title: project.name,
      description: project.description || '',
      html,
      css: 'body{margin:0}' + css,
      js: '',
      reply: 'Imported your original website design.',
    },
  });
  localStorage.setItem(mapKey, p.id);
  return p;
}
