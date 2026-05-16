---
name: non-technical-user-facing-language
description: User-facing content must avoid technical jargon; describe systems by role, not technology
metadata:
  type: feedback
---

In this codebase, any user-facing content involving a technical explanation MUST be removed or rewritten in terms a non-technical person understands. Example: instead of "Gemini 2.5 Pro is...", say "Our extracting agent is..." or "Our matching agent is..." depending on the use-case.

**Why:** This is a product for non-technical users (incubator/accelerator staff); naming specific models/vendors is meaningless and intimidating to them. A prior commit ("removed everything about 2.5 Pro") already started this cleanup.

**How to apply:** When writing or editing UI text, generated emails, labels, tooltips, or any copy a user sees, describe a system by its role ("extracting agent", "matching agent", "enrichment") rather than its underlying technology (Gemini, Vertex AI, Apify, Firestore, etc.). Internal developer docs (CLAUDE.md, AGENTS.md, code comments) may keep technical terms.
