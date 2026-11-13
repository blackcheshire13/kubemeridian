// Short dated updates on ICE and deusex, newest first. Each entry is checked against the
// repositories before it goes in, and says "tested" or "planned" wherever it is not live.
// `body` is trusted HTML written here (inline <code> only).

/** @typedef {{ date: string, product: 'ice' | 'deusex', status?: 'live' | 'tested' | 'planned', title: string, body: string }} NewsItem */

/** @type {NewsItem[]} */
export const NEWS = [
  {
    date: '2026-11-13',
    product: 'ice',
    status: 'tested',
    title: 'The install wizard works in the terminal',
    body: '<code>ice doctor</code> runs 29 read-only checks: what the cluster already has and what ICE would miss without it. <code>ice install</code> asks, for each piece, whether to use yours, install it or skip it, shows the plan and applies it with Helm; running it again reconciles. It can install PostgreSQL (CloudNativePG), Keycloak, TLS with cert-manager and Let\'s Encrypt, and an Envoy Gateway ingress. Access is added by command — a GitHub App, a deploy key or a GitLab group token — and checked with a live call before it is saved; the operator then opens pull requests as the GitHub App instead of with a personal token. All of this passes tests and has not yet been run on a live cluster. Still planned: the browser version, a GitOps mode that opens a pull request instead of installing, and secrets and a runtime sensor in the baseline.',
  },
  {
    date: '2026-11-06',
    product: 'ice',
    status: 'planned',
    title: 'An install wizard',
    body: 'ICE should install on a cluster that has nothing yet. A wizard, in the terminal and in the browser, will check what the cluster already runs, take access through a guided flow, and offer to install a missing baseline — ingress, TLS, a database, secrets, a runtime sensor — or open a pull request to your GitOps repository instead of applying anything. A Helm chart and a read-only cluster check are in open pull requests.',
  },
  {
    date: '2026-11-06',
    product: 'ice',
    status: 'tested',
    title: 'Findings ranked by evidence of exploitation',
    body: "The API now orders findings by how likely they are to be exploited: an entry in CISA's Known Exploited Vulnerabilities catalogue first, then the EPSS score, then whether a fix exists, then severity and how critical the workload is. Criticality is a four-tier profile setting; by default a critical workload counts twice as much as a medium one for the same signal. Priority labels in the console are still to come.",
  },
  {
    date: '2026-11-06',
    product: 'ice',
    status: 'tested',
    title: 'Runtime detectors become code',
    body: 'A new runtime detector has to ship with its MITRE ATT&amp;CK techniques, a version, and test events that must and must not trigger it, or CI rejects it. 8 of the 25 existing detectors already comply; the list of exceptions is only allowed to shrink. The PDF report now prints an ATT&amp;CK coverage matrix.',
  },
  {
    date: '2026-11-05',
    product: 'ice',
    title: 'ICE gets its own GitHub organization and module path',
    body: 'ICE now lives in a dedicated organization, devopstech-net, and its Go module is <code>devopstech.net/ice</code>. Every merge to main publishes the operator, API and console images to <code>ghcr.io/devopstech-net</code>, tagged by commit and pullable without logging in. The source stays private until the Apache-2.0 release, and there are no versioned releases yet.',
  },
  {
    date: '2026-11-02',
    product: 'ice',
    status: 'tested',
    title: 'Sign-in without an existing SSO',
    body: 'The console no longer needs an identity provider you already run. An optional bundled Keycloak gives a fresh install a login: a mandatory one-time password for local users, and sign-in with Google, Microsoft or GitHub, where GitHub accounts are matched by their immutable ID rather than by email. Not yet observed on a live cluster.',
  },
  {
    date: '2026-10-29',
    product: 'ice',
    status: 'live',
    title: 'Three more capabilities live: 13 live, 66 tested',
    body: 'Three capabilities were seen working on the live test cluster and moved from tested to live, each with a dated evidence mark: scanning the images a profile declares, without cluster access (19 October); a findings queue split into vulnerabilities, misconfigurations and secrets, with rule, resource and line (27 October); and the age of each CVE database shown next to the findings, flagged past 48 hours (29 October).',
  },
  {
    date: '2026-10-25',
    product: 'deusex',
    title: 'deusex prices its own work',
    body: "The loop now writes a token cost per merged pull request into its daily summary and warns when a plan's monthly pace passes 90% — so far only for the workers whose session logs it can read. A measurement the same week: 82–90% of a worker's time goes to running the test suite and 7–14% to the model, so the next change is targeted tests while iterating and the full suite once before commit.",
  },
];

/** Anchor id for an entry on /news/. @param {NewsItem} item */
export function newsId(item) {
  return `${item.date}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
