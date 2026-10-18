// The one contact address and the subjects the calls to action use.
export const EMAIL = 'hello@devopstech.net';
export const SUBJECT = { ice: 'ICE design partner', deusex: 'deusex', general: 'Hello from devopstech.net' };

/** @param {keyof typeof SUBJECT} topic */
export function mailto(topic) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT[topic])}`;
}
