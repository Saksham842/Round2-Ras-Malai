# Page 1

CONTRIB COMPASS

AI-powered contributor matching for open-source projects

Morrow 1.0 • Round 1 Pitch

Team: \[Your Team Name\]

# Page 2

The Problem

New contributors face a wall of noise.

Hundreds of open issues across dozens of repos, no sense of difficulty,
no sense of which skills are needed --- so most first-timers never open
a PR at all.

Maintainers, meanwhile, spend hours hand-labeling "good first issue"
tags that go stale within weeks.

60%+

of first-time OSS contributors drop off before their first merged PR

HOURS

lost weekly by maintainers manually triaging and labeling issues

# Page 3

The Solution

Contrib Compass connects contributors to the right issue ---
automatically.

Auto-Triage

Embeddings + LLM classify every open issue by difficulty, skill area,
and effort --- no manual labeling.

Smart Matching

Matches a contributor's skills or GitHub profile to ranked issues across
multiple repos at once.

Self-Improving

Maintainer corrections feed back into the model, so matching accuracy
compounds over time.

# Page 4

How It's Built

1

GitHub API

Ingests issues from connected repos via REST/GraphQL

→

2

Embeddings

Sentence-transformer embeddings capture issue content & context

→

3

Groq LLM

llama-3.3-70b classifies difficulty, skill area, effort

→

4

Match Engine

Ranks issues against contributor skills/profile

Stack

Frontend: Next.js + Tailwind • Backend: Node/Express • Data: Postgres
(Supabase) • Auth: GitHub OAuth • AI: Groq (llama-3.3-70b) +
sentence-transformer embeddings

# Page 5

Round 1 Demo Scope

Connect 1--2 real open-source repos via GitHub OAuth

Auto-label a live issue feed by difficulty & skill area

Show a contributor matched to 3 ranked issues, end to end

Why It Keeps Growing

Contrib Compass is a live service --- the more repos and contributors
that use it, the smarter the matching gets.

Post-hackathon roadmap:

Discord/Slack bot integration

First-PR streak gamification

Org-wide maintainer dashboards

Building for open source, in the open.
