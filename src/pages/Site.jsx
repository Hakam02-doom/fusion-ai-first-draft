import { getProject } from '../components/builder/store.js';
import { Website } from '../components/builder/UI.jsx';
import '../styles/builder.css';
export default function Site() {
  return (
    <Website
      project={getProject(new URLSearchParams(location.search).get('project'))}
    />
  );
}
