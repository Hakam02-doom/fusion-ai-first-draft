export function isInspectableControl(control) {
  if (control.kind === 'hover') return true;
  if (control.inForm || control.isLink) return false;
  if (control.disclosure) return true;
  return !/buy|purchase|checkout|submit|join|sign up|sign in|delete|subscribe/i.test(
    control.text,
  );
}
