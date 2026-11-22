(() => {
  function initShareButton(buttonId, feedbackId, url, title, env = window) {
    const button = env.document.getElementById(buttonId);
    const feedback = env.document.getElementById(feedbackId);
    if (!button || !feedback) return;

    let busy = false;
    const message = text => {
      feedback.replaceChildren(env.document.createTextNode(text));
      feedback.hidden = false;
    };
    const manualLink = () => {
      message('Copy this link to share:');
      const input = env.document.createElement('input');
      input.type = 'url';
      input.readOnly = true;
      input.value = url;
      input.setAttribute('aria-label', 'Link to share');
      feedback.appendChild(input);
      input.focus();
      input.select();
    };

    button.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      button.disabled = true;
      feedback.hidden = true;
      try {
        if (typeof env.navigator.share === 'function') {
          try {
            await env.navigator.share({ title, url });
            message('Shared successfully.');
            return;
          } catch (error) {
            if (error && error.name === 'AbortError') return;
          }
        }

        try {
          if (!env.navigator.clipboard || typeof env.navigator.clipboard.writeText !== 'function') throw new Error('Clipboard unavailable');
          await env.navigator.clipboard.writeText(url);
          message('Link copied.');
        } catch (error) {
          manualLink();
        }
      } finally {
        busy = false;
        button.disabled = false;
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { initShareButton };
  else window.initShareButton = initShareButton;
})();
