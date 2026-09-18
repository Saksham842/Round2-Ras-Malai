// Mock fixtures for Contrib Compass adhering strictly to the API contract

export const MOCK_USER = {
  id: "gh_usr_99812",
  login: "alexcontributor",
  name: "Alex Rivera",
  avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
  bio: "Frontend craftsman & Open Source enthusiast. Rust curious.",
  public_repos: 34,
  followers: 128,
  skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Node.js"]
};

export const MOCK_REPOS = [
  {
    id: "repo_nextjs",
    url: "https://github.com/vercel/next.js",
    name: "vercel/next.js",
    description: "The React Framework for the Web",
    stars: 125400,
    issuesIngested: 28,
    connectedAt: "2026-03-10T14:32:00Z"
  },
  {
    id: "repo_react",
    url: "https://github.com/facebook/react",
    name: "facebook/react",
    description: "The library for web and native user interfaces",
    stars: 228000,
    issuesIngested: 19,
    connectedAt: "2026-03-11T09:15:00Z"
  },
  {
    id: "repo_fastify",
    url: "https://github.com/fastify/fastify",
    name: "fastify/fastify",
    description: "Fast and low overhead web framework for Node.js",
    stars: 32000,
    issuesIngested: 14,
    connectedAt: "2026-03-12T11:45:00Z"
  }
];

export const MOCK_ISSUES = [
  {
    id: "iss_101",
    repoId: "repo_nextjs",
    repoName: "vercel/next.js",
    number: 62410,
    title: "Support custom loading state inside nested parallel route slot",
    body: "When navigating between nested parallel routes with intercepting routes, the default loading.tsx fallback is skipped if cache header is set to no-store. We should provide an explicit fallback hook or preserve the slot boundary.",
    url: "https://github.com/vercel/next.js/issues/62410",
    labels: {
      difficulty: "Intermediate", // Easy | Intermediate | Advanced
      skillArea: "React / Architecture",
      effort: "4-6 hrs",
      confidence: 0.94,
    },
    commentsCount: 14,
    createdAt: "2 days ago"
  },
  {
    id: "iss_102",
    repoId: "repo_nextjs",
    repoName: "vercel/next.js",
    number: 62455,
    title: "Docs: Clarify Server Actions cache invalidation with revalidateTag()",
    body: "The current documentation does not explicitly demonstrate how revalidateTag affects client-side router cache versus server-side fetch cache. Needs a small diagram and sample recipe.",
    url: "https://github.com/vercel/next.js/issues/62455",
    labels: {
      difficulty: "Easy",
      skillArea: "Documentation / Next.js",
      effort: "1-2 hrs",
      confidence: 0.98,
    },
    commentsCount: 3,
    createdAt: "4 hours ago"
  },
  {
    id: "iss_103",
    repoId: "repo_react",
    repoName: "facebook/react",
    number: 29810,
    title: "Refactor useActionState error boundary bubbling in concurrent transitions",
    body: "In high-frequency form submissions wrapped in startTransition, unhandled rejections inside useActionState can bypass nearest component error boundaries under specific suspense timing.",
    url: "https://github.com/facebook/react/issues/29810",
    labels: {
      difficulty: "Advanced",
      skillArea: "React Core / Concurrency",
      effort: "2-3 days",
      confidence: 0.91,
    },
    commentsCount: 22,
    createdAt: "1 day ago"
  },
  {
    id: "iss_104",
    repoId: "repo_fastify",
    repoName: "fastify/fastify",
    number: 5412,
    title: "TypeScript typing for schema validator options is missing strictNullChecks union",
    body: "When enabling strictNullChecks in tsconfig, the FastifyInstance RouteShorthandMethod produces a type error when schema.querystring allows nullish value.",
    url: "https://github.com/fastify/fastify/issues/5412",
    labels: {
      difficulty: "Easy",
      skillArea: "TypeScript / Node.js",
      effort: "2-3 hrs",
      confidence: 0.96,
    },
    commentsCount: 7,
    createdAt: "3 days ago"
  },
  {
    id: "iss_105",
    repoId: "repo_nextjs",
    repoName: "vercel/next.js",
    number: 62499,
    title: "Turbopack HMR websocket reconnect loop during network throttling",
    body: "Newly submitted bug: When dev server runs under 3G simulation, the WebSocket connection drops and enters a rapid 100ms reconnect loop that spikes CPU usage.",
    url: "https://github.com/vercel/next.js/issues/62499",
    labels: null, // Test Phase 2 'classifying...' state requirement!
    commentsCount: 2,
    createdAt: "10 minutes ago"
  },
  {
    id: "iss_106",
    repoId: "repo_fastify",
    repoName: "fastify/fastify",
    number: 5430,
    title: "Add benchmark script for HTTP/2 multiplexed stream throughput",
    body: "We need an automated benchmark suite measuring request throughput under 1000 concurrent HTTP/2 streams using autocannon.",
    url: "https://github.com/fastify/fastify/issues/5430",
    labels: {
      difficulty: "Intermediate",
      skillArea: "Performance / Benchmarking",
      effort: "4-8 hrs",
      confidence: 0.89,
    },
    commentsCount: 5,
    createdAt: "5 days ago"
  }
];

export const MOCK_MATCH_RESULTS = [
  {
    score: 96,
    matchReason: "Direct synergy with your React & Next.js server components experience.",
    relevanceBreakdown: {
      skillsMatch: "React, Next.js, Architecture",
      experienceLevel: "Intermediate (Matches contributor history)",
      urgencyBonus: "High priority maintainer tag"
    },
    issue: MOCK_ISSUES[0]
  },
  {
    score: 92,
    matchReason: "Ideal starter PR: high documentation accuracy demand with low barrier to entry.",
    relevanceBreakdown: {
      skillsMatch: "Next.js, Markdown, Docs",
      experienceLevel: "Easy / Quick win",
      urgencyBonus: "Immediate merge candidate"
    },
    issue: MOCK_ISSUES[1]
  },
  {
    score: 84,
    matchReason: "Strong TypeScript typing alignment matching your recent GitHub commits.",
    relevanceBreakdown: {
      skillsMatch: "TypeScript, Type-Safety",
      experienceLevel: "Easy",
      urgencyBonus: "Clean localized fix"
    },
    issue: MOCK_ISSUES[3]
  },
  {
    score: 71,
    matchReason: "Ambitious core challenge: involves concurrent reconciliation logic.",
    relevanceBreakdown: {
      skillsMatch: "React Internals, Fiber",
      experienceLevel: "Advanced",
      urgencyBonus: "High maintainer attention"
    },
    issue: MOCK_ISSUES[2]
  }
];
