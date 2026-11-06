<script setup lang="ts">
// The design-partner application. Posts to /api/pilot (workers/pilot), which mails it to the
// site's inbox. Without JavaScript the form posts natively and the worker redirects back
// here with ?sent=1. The bare address stays below the form either way.
import { onMounted, ref } from 'vue';
import PartnerCta from './PartnerCta.vue';
import { TEAM, CLUSTERS, GITOPS, LIMITS } from '../../pilot-fields.mjs';

const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle');
const problem = ref('');
const sentTo = ref('');
let openedAt = 0;

onMounted(() => {
  openedAt = Date.now();
  if (new URLSearchParams(location.search).get('sent') === '1') state.value = 'sent';
});

async function submit(event: Event) {
  const form = event.target as HTMLFormElement;
  const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
  state.value = 'sending';
  problem.value = '';
  try {
    const res = await fetch('/api/pilot', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ ...fields, elapsed: Date.now() - openedAt }),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !body.ok) throw new Error(body.error || `the server answered ${res.status}`);
    sentTo.value = fields.email;
    state.value = 'sent';
    form.reset();
  } catch (err) {
    problem.value = err instanceof Error ? err.message : String(err);
    state.value = 'error';
  }
}
</script>

<template>
  <div class="pilot">
    <div v-if="state === 'sent'" class="sent" role="status">
      <p class="sent-title">Application sent.</p>
      <p>
        I'll reply<template v-if="sentTo"> to <strong>{{ sentTo }}</strong></template> within two working
        days. If nothing arrives, check spam, or write to the address below.
      </p>
    </div>

    <form v-else action="/api/pilot" method="post" @submit.prevent="submit">
      <div class="grid">
        <label class="field">
          <span>Your name</span>
          <input name="name" type="text" autocomplete="name" required :maxlength="LIMITS.name" />
        </label>
        <label class="field">
          <span>Work email</span>
          <input name="email" type="email" autocomplete="email" required :maxlength="LIMITS.email" />
        </label>
        <label class="field">
          <span>Company <em>optional</em></span>
          <input name="company" type="text" autocomplete="organization" :maxlength="LIMITS.company" />
        </label>
        <label class="field">
          <span>Engineers on the team</span>
          <select name="team" required>
            <option value="" disabled selected>Choose</option>
            <option v-for="o in TEAM" :key="o" :value="o">{{ o }}</option>
          </select>
        </label>
        <label class="field">
          <span>Kubernetes clusters</span>
          <select name="clusters" required>
            <option value="" disabled selected>Choose</option>
            <option v-for="o in CLUSTERS" :key="o" :value="o">{{ o }}</option>
          </select>
        </label>
        <label class="field">
          <span>How changes reach the clusters</span>
          <select name="gitops" required>
            <option value="" disabled selected>Choose</option>
            <option v-for="o in GITOPS" :key="o" :value="o">{{ o }}</option>
          </select>
        </label>
      </div>
      <label class="field wide">
        <span>What should ICE catch first?</span>
        <textarea
          name="catch"
          rows="4"
          required
          :maxlength="LIMITS.catch"
          placeholder="Images with known-exploited CVEs, drift from the GitOps repo, secrets in config maps…"
        ></textarea>
      </label>
      <!-- left empty by people; bots that fill every field are dropped by the worker -->
      <label class="hp" aria-hidden="true">Website <input name="website" type="text" tabindex="-1" autocomplete="off" /></label>

      <div class="submit">
        <button type="submit" class="dt-btn" :disabled="state === 'sending'">
          {{ state === 'sending' ? 'Sending…' : 'Apply for the pilot' }}
        </button>
        <p class="note">This starts a conversation, not a commitment. I reply within two working days.</p>
      </div>
      <p v-if="state === 'error'" class="error" role="alert">
        The application didn't go through ({{ problem }}). Your answers are still in the form; try again,
        or send them to the address below.
      </p>
    </form>

    <div class="alt">
      <p>Prefer email?</p>
      <PartnerCta topic="ice" variant="address" />
    </div>
  </div>
</template>

<style scoped>
.pilot {
  margin: 24px 0 8px;
  padding: 24px 0 0;
  border-top: 1px solid var(--vp-c-divider);
}
form {
  display: grid;
  gap: 18px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}
.field {
  display: grid;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.field em {
  font-style: normal;
  font-weight: 400;
  color: var(--vp-c-text-2);
}
input,
select,
textarea {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-weight: 400;
  font-size: 16px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: var(--dt-radius-control);
}
textarea {
  resize: vertical;
  line-height: 1.5;
}
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
  border-color: transparent;
}
.hp {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.submit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
}
.submit .dt-btn {
  border: 0;
  cursor: pointer;
}
.submit .dt-btn:disabled {
  cursor: progress;
  opacity: 0.75;
}
.note {
  margin: 0 !important;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.error {
  margin: 0 !important;
  padding: 12px 14px;
  font-size: 15px;
  line-height: 1.5;
  border-left: 3px solid var(--dt-brass);
  background: var(--dt-paper-2);
}
.sent {
  padding: 16px 18px;
  background: var(--dt-paper-2);
  border-left: 3px solid var(--dt-ice);
}
.sent p {
  margin: 0 !important;
  line-height: 1.55;
}
.sent .sent-title {
  margin-bottom: 4px !important;
  font-size: 20px;
  font-weight: 600;
}
.alt {
  margin-top: 28px;
}
.alt > p {
  margin: 0 !important;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.alt :deep(.mail) {
  margin-top: 6px !important;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
