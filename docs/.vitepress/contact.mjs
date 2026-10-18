// The one contact address and the subjects the calls to action use.
export const EMAIL = 'qdrrag@gmail.com';
export const SUBJECT = { ice: 'ICE design partner', deusex: 'deusex' };

/** @param {keyof typeof SUBJECT} topic */
export function mailto(topic) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT[topic])}`;
}
