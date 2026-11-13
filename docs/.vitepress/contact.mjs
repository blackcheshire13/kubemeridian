// The one contact address and the subjects the calls to action use.
// Cloudflare's Email Address Obfuscation must stay OFF for the zone: it rewrites every
// mailto: into /cdn-cgi/l/email-protection#…, and when its decode script is blocked the
// VitePress router turns a click on that link into the site's 404.
export const EMAIL = 'hello@devopstech.net';
export const SUBJECT = { ice: 'ICE pilot', deusex: 'deusex', general: 'Hello from devopstech.net' };

/** @param {keyof typeof SUBJECT} topic */
export function mailto(topic) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT[topic])}`;
}

/** Web compose, for readers whose browser has no mail app behind mailto:. @param {keyof typeof SUBJECT} topic */
export function gmail(topic) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(SUBJECT[topic])}`;
}
