// devopstech-pilot: receives the ICE design-partner form (docs/ice/design-partners.md) on
// devopstech.net/api/pilot and mails it through Cloudflare Email Routing to the site's inbox.
// JSON in → JSON out (the page's fetch); a native form post → 303 back to the page.
import { EmailMessage } from 'cloudflare:email';
import { TEAM, CLUSTERS, GITOPS, LIMITS } from '../../../docs/.vitepress/pilot-fields.mjs';

const FROM = 'pilot@devopstech.net';
const ORIGINS = new Set(['https://devopstech.net', 'https://www.devopstech.net']);
const BACK = 'https://devopstech.net/ice/design-partners';
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const MIN_ELAPSED_MS = 3000; // a person needs longer than this to fill six fields

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: { allow: 'POST' } });
    }
    const wantsJson = (request.headers.get('accept') || '').includes('application/json');
    const origin = request.headers.get('origin');
    if (origin && !ORIGINS.has(origin)) {
      return answer(wantsJson, 403, 'this form only accepts posts from devopstech.net');
    }

    if (env.LIMIT) {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const { success } = await env.LIMIT.limit({ key: ip });
      if (!success) {
        return answer(wantsJson, 429, 'too many applications from this address, try again in a minute');
      }
    }

    let data;
    try {
      const type = request.headers.get('content-type') || '';
      data = type.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
    } catch {
      return answer(wantsJson, 400, 'the form could not be read');
    }

    // Bots: a filled hidden field, or a JSON post faster than a person types. Pretend success.
    if (str(data.website) || (data.elapsed !== undefined && Number(data.elapsed) < MIN_ELAPSED_MS)) {
      return answer(wantsJson, 200);
    }

    const form = {
      name: str(data.name).slice(0, LIMITS.name),
      email: str(data.email).slice(0, LIMITS.email),
      company: str(data.company).slice(0, LIMITS.company),
      team: str(data.team),
      clusters: str(data.clusters),
      gitops: str(data.gitops),
      catch: str(data.catch, true).slice(0, LIMITS.catch),
    };
    const problem = validate(form);
    if (problem) {
      return answer(wantsJson, 422, problem);
    }

    try {
      await env.MAIL.send(new EmailMessage(FROM, env.TO, mime(form, env.TO)));
    } catch (err) {
      console.error('send failed', err && err.message);
      return answer(wantsJson, 502, 'the mail service did not accept the message');
    }
    return answer(wantsJson, 200);
  },
};

function str(value, multiline = false) {
  const s = typeof value === 'string' ? value : '';
  return (multiline ? s.replace(/\r\n?/g, '\n') : s.replace(/[\r\n]+/g, ' ')).trim();
}

function validate(f) {
  if (!f.name) {
    return 'your name is missing';
  }
  if (!EMAIL_RE.test(f.email)) {
    return 'the email address does not look right';
  }
  if (!TEAM.includes(f.team)) {
    return 'choose the team size';
  }
  if (!CLUSTERS.includes(f.clusters)) {
    return 'choose the number of clusters';
  }
  if (!GITOPS.includes(f.gitops)) {
    return 'choose how changes reach the clusters';
  }
  if (!f.catch) {
    return 'say what ICE should catch first';
  }
  return '';
}

function answer(wantsJson, status, error) {
  const ok = status === 200;
  if (wantsJson) {
    return Response.json(ok ? { ok } : { ok, error }, { status });
  }
  if (ok) {
    return Response.redirect(`${BACK}?sent=1#apply`, 303);
  }
  return new Response(`The application didn't go through: ${error}. Go back and try again, or write to hello@devopstech.net.`, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

// RFC 2047 for headers, base64 body: names and answers may be in any language.
const b64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const word = (s) => `=?UTF-8?B?${b64(s)}?=`;

function mime(f, to) {
  const subject = `ICE pilot: ${f.company || f.name} (${f.team} engineers, ${f.clusters} clusters)`;
  const body = [
    `Name: ${f.name}`,
    `Email: ${f.email}`,
    `Company: ${f.company || '—'}`,
    `Engineers on the team: ${f.team}`,
    `Kubernetes clusters: ${f.clusters}`,
    `How changes reach the clusters: ${f.gitops}`,
    '',
    'What ICE should catch first:',
    f.catch,
    '',
    '— sent from devopstech.net/ice/design-partners; reply goes to the applicant',
  ].join('\n');
  const lines = b64(body).match(/.{1,76}/g) || [];
  return [
    `From: ${word('ICE pilot form')} <${FROM}>`,
    `To: <${to}>`,
    `Reply-To: ${word(f.name)} <${f.email}>`,
    `Subject: ${word(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@devopstech.net>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    ...lines,
    '',
  ].join('\r\n');
}
