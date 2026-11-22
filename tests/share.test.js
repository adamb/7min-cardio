const test = require('node:test');
const assert = require('node:assert/strict');
const { initShareButton } = require('../public/share.js');

function harness({ share, writeText } = {}) {
  const button = {
    disabled: false,
    listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    click() { return this.listeners.click(); },
  };
  const feedback = {
    hidden: true,
    children: [],
    replaceChildren(...children) { this.children = children; },
    appendChild(child) { this.children.push(child); },
    get textContent() { return this.children.map(child => child.textContent || '').join(''); },
  };
  const document = {
    getElementById(id) { return id === 'button' ? button : feedback; },
    createTextNode(text) { return { textContent: text }; },
    createElement() {
      return { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, focus() { this.focused = true; }, select() { this.selected = true; } };
    },
  };
  const env = { document, navigator: {} };
  if (share) env.navigator.share = share;
  if (writeText) env.navigator.clipboard = { writeText };
  initShareButton('button', 'feedback', 'https://7.dev.pr/', '7 Minute Cardio', env);
  return { button, feedback, env };
}

test('native share success reports success and uses canonical URL', async () => {
  let payload;
  const { button, feedback } = harness({ share: async value => { payload = value; } });
  await button.click();
  assert.deepEqual(payload, { title: '7 Minute Cardio', url: 'https://7.dev.pr/' });
  assert.equal(feedback.textContent, 'Shared successfully.');
});

test('native share cancellation is quiet and does not copy', async () => {
  let copied = false;
  const { button, feedback } = harness({
    share: async () => { const error = new Error(); error.name = 'AbortError'; throw error; },
    writeText: async () => { copied = true; },
  });
  await button.click();
  assert.equal(feedback.hidden, true);
  assert.equal(copied, false);
});

test('native share failure falls back to clipboard and reports only successful copy', async () => {
  let copied;
  const { button, feedback } = harness({
    share: async () => { throw new Error('share failed'); },
    writeText: async value => { copied = value; },
  });
  await button.click();
  assert.equal(copied, 'https://7.dev.pr/');
  assert.equal(feedback.textContent, 'Link copied.');
});

test('clipboard failure exposes a selectable manual URL without false success', async () => {
  const { button, feedback } = harness({ writeText: async () => { throw new Error('clipboard failed'); } });
  await button.click();
  const input = feedback.children[1];
  assert.equal(feedback.textContent, 'Copy this link to share:');
  assert.equal(input.value, 'https://7.dev.pr/');
  assert.equal(input.readOnly, true);
  assert.equal(input.focused, true);
  assert.equal(input.selected, true);
});

test('missing share and clipboard APIs exposes the manual URL', async () => {
  const { button, feedback } = harness();
  await button.click();
  assert.equal(feedback.children[1].value, 'https://7.dev.pr/');
});

test('repeated clicks are guarded until the pending share completes', async () => {
  let resolveShare;
  let calls = 0;
  const { button } = harness({ share: () => { calls++; return new Promise(resolve => { resolveShare = resolve; }); } });
  const pending = button.click();
  assert.equal(button.disabled, true);
  await button.click();
  assert.equal(calls, 1);
  resolveShare();
  await pending;
  assert.equal(button.disabled, false);
});
