// The design-partner form's choices and limits, shared by the page (PilotForm.vue) and the
// worker that receives it (workers/pilot), so the two cannot drift apart.
export const TEAM = ['1–4', '5–20', '21–50', '51 or more'];
export const CLUSTERS = ['1', '2–5', '6–20', '21 or more'];
export const GITOPS = ['Argo CD', 'Flux', 'Another GitOps tool', 'CI applies manifests', 'By hand, no GitOps yet'];
export const LIMITS = { name: 120, email: 200, company: 120, catch: 2000 };
