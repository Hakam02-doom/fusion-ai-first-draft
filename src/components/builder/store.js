export const STORE = 'fusion-builder-projects-v1';
export const samples = [
  {
    id: 'lumina',
    name: 'Lumina Studio',
    theme: 'lumina',
    status: 'Published',
    edited: 'Edited 2 hours ago',
    heading: 'Spaces that feel like home.',
    description:
      'Architecture and interiors shaped by light, material, and everyday life.',
    largeImage: true,
    simpleNav: true,
  },
  {
    id: 'orbit',
    name: 'Orbit Analytics',
    theme: 'orbit',
    status: 'Draft',
    edited: 'Edited 6 hours ago',
    heading: 'Understand your data. Drive real growth.',
    description:
      'Bring your team, your insights, and your next big idea together.',
  },
  {
    id: 'forma',
    name: 'Forma Objects',
    theme: 'forma',
    status: 'Draft',
    edited: 'Edited 1 day ago',
    heading: 'Timeless objects for modern living.',
    description: 'Thoughtful pieces for the spaces you call home.',
  },
];
export function readProjects() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(data) ? data : structuredClone(samples);
  } catch {
    return structuredClone(samples);
  }
}
export function saveProjects(projects) {
  try {
    localStorage.setItem(STORE, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
}
export function getProject(id) {
  return readProjects().find((p) => p.id === id) ?? samples[0];
}
export function updateProject(project) {
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index === -1) projects.unshift(project);
  else projects[index] = project;
  return saveProjects(projects);
}
export function createProject(prompt, theme = 'lumina') {
  const sample = samples.find((p) => p.theme === theme) ?? samples[0];
  const project = {
    ...sample,
    id: crypto.randomUUID(),
    name: 'Untitled website',
    status: 'Draft',
    edited: 'Edited just now',
    prompt,
  };
  updateProject(project);
  return project;
}
export function applyDemoEdit(project, prompt) {
  const next = { ...project, status: 'Draft', edited: 'Edited just now' };
  const quoted = prompt.match(/["“]([^"”]+)["”]/);
  let reply;
  if (/heading|headline|title/i.test(prompt) && quoted) {
    next.heading = quoted[1];
    reply = 'Updated the hero heading. You can review it in the preview.';
  } else if (/dark|light|cream|blue|orange/i.test(prompt)) {
    next.dark = /dark/i.test(prompt)
      ? true
      : /light|cream/i.test(prompt)
        ? false
        : Boolean(project.dark);
    next.accent = /blue/i.test(prompt)
      ? '#286ab4'
      : /orange/i.test(prompt)
        ? '#b24b25'
        : project.accent;
    reply =
      'Updated the preview colors. Your previous version is available in History.';
  } else if (/larger|bigger|image|navigation|simpl/i.test(prompt)) {
    next.largeImage = true;
    next.simpleNav = true;
    reply = 'Done. The imagery now leads, with a cleaner four-link navigation.';
  } else {
    return {
      project,
      reply:
        'This local demo supports preview edits. Try “Make the theme dark”, “Make the hero image larger”, or “Change the heading to “Your new heading””. Full AI generation is not connected yet.',
      changed: false,
    };
  }
  return { project: next, reply, changed: true };
}
