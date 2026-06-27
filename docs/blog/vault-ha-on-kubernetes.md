---
title: "Vault HA on Kubernetes: auto-unseal, dynamic secrets, and a DR runbook"
description: A production-minded HashiCorp Vault setup on Kubernetes — HA storage, auto-unseal via cloud KMS, Kubernetes auth, dynamic secrets and a disaster-recovery runbook.
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/blog/vault-ha-on-kubernetes
---

# Vault HA on Kubernetes: auto-unseal, dynamic secrets, and a DR runbook

*2026-06-27 · vault · kubernetes · security · secrets-management*

HashiCorp Vault is easy to demo and hard to run well. This is a production-minded
setup on Kubernetes: **HA storage, auto-unseal via cloud KMS, Kubernetes auth,
dynamic secrets** — plus the disaster-recovery runbook you can actually follow at 3am.

## Why auto-unseal matters

Manual unseal with key shares does not survive pod restarts at scale. Every restart
becomes a human-in-the-loop event, and the key shares end up pasted into chats they
should never touch. **Auto-unseal via cloud KMS** (AWS KMS, GCP KMS) lets Vault unseal
itself on start — no human, no shares in flight.

```hcl
# seal stanza — auto-unseal via AWS KMS (illustrative)
seal "awskms" {
  region     = "eu-central-1"
  kms_key_id = "<kms-key-id>"
}
```

The unseal key never leaves the KMS. Vault holds only a reference.

## The setup

- **Storage / HA.** Integrated Raft storage or a PostgreSQL backend with TLS. Pick one
  and own its backups — this is your real source of truth.
- **Auth: the Kubernetes method.** Pods authenticate with their ServiceAccount token;
  Vault maps `ServiceAccount → policy`. No long-lived tokens baked into manifests.
- **Secret delivery.** Vault Agent Injector (sidecar) or external-secrets — apps receive
  secrets at runtime, not at build time.
- **Dynamic secrets.** Short-lived database and cloud credentials, issued on demand and
  auto-revoked. Stop shipping static passwords that nobody can rotate.

## Hardening checklist

- TLS everywhere — listener *and* storage backend.
- Least-privilege policies: one policy per workload, never a shared god-token.
- An audit device enabled and shipped off-box.
- Periodic key rotation, and a **tested restore** — not just a backup that exists.

## The DR runbook (the part everyone skips)

1. **Backups.** Automated Raft snapshots (or PG dumps) to object storage, encrypted,
   and verified — a backup you've never restored is a hope, not a plan.
2. **Restore drill.** Stand up a fresh Vault, restore the snapshot, confirm it
   auto-unseals via KMS, verify Kubernetes auth still maps correctly.
3. **KMS dependency.** Document the KMS key and region. If you lose the key, you lose
   Vault — guard it like the crown jewel it is.
4. **Break-glass.** Keep a sealed, offline copy of recovery keys for the
   KMS-unavailable scenario. Test that the envelope opens.

## Results

- No manual unseal; Vault survives restarts and node loss unattended.
- Apps consume short-lived secrets, so the blast radius of a leak drops sharply.
- A restore you've actually rehearsed — which is the only kind that counts.

---

*Written by the engineer behind [KubeMeridian](/) · [About](/about) ·
[GitHub](https://github.com/blackcheshire13)*
