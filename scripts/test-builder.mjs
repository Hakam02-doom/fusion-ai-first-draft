import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import {
  samples,
  readProjects,
  createProject,
  updateProject,
  getProject,
  applyDemoEdit,
  saveProjects,
} from '../src/components/builder/store.js';

beforeEach(() => {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
});

test('creating and editing a project preserves immutable sample defaults', () => {
  const defaults = structuredClone(samples);
  const project = createProject('Create a furniture store', 'forma');
  assert.equal(readProjects().length, 4);
  assert.equal(project.theme, 'forma');
  const edit = applyDemoEdit(
    project,
    'Change the heading to “A place to belong”',
  );
  assert.equal(edit.changed, true);
  updateProject(edit.project);
  assert.equal(getProject(project.id).heading, 'A place to belong');
  assert.equal(project.heading, defaults[2].heading);
  assert.deepEqual(samples, defaults);
});

test('unsupported prompts do not claim an edit or change the project', () => {
  const project = structuredClone(samples[0]);
  const result = applyDemoEdit(project, 'Connect my payment account');
  assert.equal(result.changed, false);
  assert.equal(result.project, project);
  assert.match(result.reply, /not connected/);
});

test('preview edits and restored active history positions survive serialization', () => {
  const project = structuredClone(samples[0]);
  const edited = applyDemoEdit(project, 'Make the theme dark').project;
  assert.equal(edited.dark, true);
  updateProject({ ...project, versions: [project, edited], activeVersion: 0 });
  const restored = getProject(project.id);
  assert.equal(restored.activeVersion, 0);
  assert.equal(restored.versions[1].dark, true);
  assert.notEqual(restored.dark, true);
});

test('storage failure is reported without discarding built-in templates', () => {
  globalThis.localStorage.setItem = () => {
    throw new Error('Quota exceeded');
  };
  assert.equal(saveProjects([]), false);
  assert.equal(readProjects().length, 3);
});
