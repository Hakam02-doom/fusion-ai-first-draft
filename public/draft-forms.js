// Keep the reference contact/waitlist UI usable without sending review data
// to the original template owner's inbox or production form endpoint.
document.addEventListener('submit', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.reportValidity()) return;
  let notice = form.querySelector('[data-draft-notice]');
  if (!notice) {
    notice = document.createElement('p');
    notice.dataset.draftNotice = '';
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'color:white;font:14px/1.6 Inter,sans-serif;margin-top:16px';
    form.append(notice);
  }
  notice.textContent = 'This is a preview. Your information has not been sent.';
}, true);
