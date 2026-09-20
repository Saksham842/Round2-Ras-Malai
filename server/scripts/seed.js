const queries = require('../src/db/queries');
const { classifyAndEmbedIssue } = require('../src/ai/classify');

const DEMO_USER = {
  id: 'demo_user_contrib_compass',
  github_id: '583231',
  username: 'alexcontributor',
  name: 'Alex Rivera',
  avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
  access_token: 'mock_demo_token'
};

const SEED_REPOS = [
  {
    id: 'repo_nextjs',
    github_repo_id: '70107786',
    owner: 'vercel',
    name: 'next.js',
    full_name: 'vercel/next.js',
    description: 'The React Framework for the Web',
    url: 'https://github.com/vercel/next.js',
    stars: 125400,
    issues: [
      {
        id: 'iss_next_1',
        number: 62410,
        title: 'Support custom loading state inside nested parallel route slot',
        body: 'When navigating between nested parallel routes with intercepting routes, the default loading.tsx fallback is skipped if cache header is set to no-store. We should provide an explicit fallback hook or preserve the slot boundary.',
        url: 'https://github.com/vercel/next.js/issues/62410',
        comments_count: 14,
        difficulty: 'Intermediate',
        skill_area: 'React / Architecture',
        effort: '4-6 hrs',
        confidence: 0.94,
        summary: 'Preserve slot boundary or add an explicit fallback hook when nested parallel routes skip loading.tsx with cache: no-store.'
      },
      {
        id: 'iss_next_2',
        number: 62104,
        title: 'Fix hydration mismatch on Image component when priority flag is set dynamically',
        body: 'Client-side hydration throws warning when priority is toggled inside useEffect. Image preloader link tag gets rendered twice in head.',
        url: 'https://github.com/vercel/next.js/issues/62104',
        comments_count: 9,
        difficulty: 'Intermediate',
        skill_area: 'React / Next.js',
        effort: '2-4 hrs',
        confidence: 0.91,
        summary: 'Prevent duplicate <link rel="preload"> tags in head when Image priority is toggled dynamically during hydration.'
      },
      {
        id: 'iss_next_3',
        number: 61890,
        title: 'Update documentation for generateStaticParams with dynamic segments',
        body: 'The guide is missing an example of passing searchParams alongside dynamic catch-all route segments. Adding a clear TypeScript snippet will help first-time contributors.',
        url: 'https://github.com/vercel/next.js/issues/61890',
        comments_count: 3,
        difficulty: 'Easy',
        skill_area: 'Documentation',
        effort: '<1 hr',
        confidence: 0.98,
        summary: 'Add TypeScript examples explaining how searchParams and catch-all dynamic route segments interact in generateStaticParams.'
      },
      {
        id: 'iss_next_4',
        number: 62550,
        title: 'Turbopack compiler memory leak when watching large monorepo with 50+ packages',
        body: 'During dev server watch mode on large enterprise repos, memory climbs to 8GB after multiple HMR updates in Turbopack AST cache.',
        url: 'https://github.com/vercel/next.js/issues/62550',
        comments_count: 22,
        difficulty: 'Advanced',
        skill_area: 'Architecture / Rust',
        effort: '>1 day',
        confidence: 0.95,
        summary: 'Profile Turbopack AST cache eviction during continuous HMR cycles in 50+ package monorepos to stop 8GB memory leak.'
      },
      {
        id: 'iss_next_5',
        number: 62312,
        title: 'Add aria-labels to navigation indicators in Link component',
        body: 'Accessibility audit found missing aria-current attribute on active navigation Link elements in App Router.',
        url: 'https://github.com/vercel/next.js/issues/62312',
        comments_count: 5,
        difficulty: 'Easy',
        skill_area: 'CSS / UI',
        effort: '<2 hrs',
        confidence: 0.96,
        summary: 'Inject aria-current="page" into active navigation Link elements in App Router to satisfy accessibility standards.'
      }
    ]
  },
  {
    id: 'repo_react',
    github_repo_id: '10270250',
    owner: 'facebook',
    name: 'react',
    full_name: 'facebook/react',
    description: 'The library for web and native user interfaces',
    url: 'https://github.com/facebook/react',
    stars: 228000,
    issues: [
      {
        id: 'iss_react_1',
        number: 28412,
        title: 'useActionState pending transition drops re-renders under concurrent stress',
        body: 'In React 19 canary, rapid dispatch of form action transitions while Suspense boundary is resolving causes intermediate pending state to flicker.',
        url: 'https://github.com/facebook/react/issues/28412',
        comments_count: 18,
        difficulty: 'Advanced',
        skill_area: 'React / Architecture',
        effort: '>1 day',
        confidence: 0.92
      },
      {
        id: 'iss_react_2',
        number: 28310,
        title: 'Fix typo in DevTools Profiler tooltip description',
        body: 'Minor spelling mistake in the Commit tree flamegraph tooltip where "unnecesary" is missing an s.',
        url: 'https://github.com/facebook/react/issues/28310',
        comments_count: 2,
        difficulty: 'Easy',
        skill_area: 'Documentation',
        effort: '<1 hr',
        confidence: 0.99
      },
      {
        id: 'iss_react_3',
        number: 28205,
        title: 'Refactor useId hook to support custom prefix in micro-frontends',
        body: 'When multiple React roots run on the same page, DOM id collisions occur unless a unique prefix provider is injected.',
        url: 'https://github.com/facebook/react/issues/28205',
        comments_count: 11,
        difficulty: 'Intermediate',
        skill_area: 'React',
        effort: '4-6 hrs',
        confidence: 0.89
      },
      {
        id: 'iss_react_4',
        number: 28114,
        title: 'Improve TypeScript typings for RefObject with cleanup functions',
        body: 'Ref callback cleanups introduced in React 19 need updated generic constraint types in @types/react.',
        url: 'https://github.com/facebook/react/issues/28114',
        comments_count: 7,
        difficulty: 'Intermediate',
        skill_area: 'TypeScript',
        effort: '2-4 hrs',
        confidence: 0.93
      }
    ]
  },
  {
    id: 'repo_tailwind',
    github_repo_id: '106017343',
    owner: 'tailwindlabs',
    name: 'tailwindcss',
    full_name: 'tailwindlabs/tailwindcss',
    description: 'A utility-first CSS framework for rapid UI development',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    stars: 82000,
    issues: [
      {
        id: 'iss_tw_1',
        number: 14210,
        title: 'Support CSS container query units in arbitrary variant syntax',
        body: 'Arbitrary variant parsing fails when using cqh/cqw container query length units inside square brackets @container[cqw>200px]:grid-cols-2.',
        url: 'https://github.com/tailwindlabs/tailwindcss/issues/14210',
        comments_count: 8,
        difficulty: 'Intermediate',
        skill_area: 'CSS / TailwindCSS',
        effort: '2-4 hrs',
        confidence: 0.92
      },
      {
        id: 'iss_tw_2',
        number: 14095,
        title: 'Add dark mode transition utilities to core plugins',
        body: 'Provide smooth default color and background-color transitions when toggling .dark class on root HTML element.',
        url: 'https://github.com/tailwindlabs/tailwindcss/issues/14095',
        comments_count: 6,
        difficulty: 'Easy',
        skill_area: 'CSS / TailwindCSS',
        effort: '<2 hrs',
        confidence: 0.96
      },
      {
        id: 'iss_tw_3',
        number: 14330,
        title: 'Tailwind Oxide Rust engine segfault on circular CSS @import rule',
        body: 'When circular dependencies exist between stylesheet imports, the Oxide parser enters recursion without depth limit.',
        url: 'https://github.com/tailwindlabs/tailwindcss/issues/14330',
        comments_count: 15,
        difficulty: 'Advanced',
        skill_area: 'Architecture / Rust',
        effort: '>1 day',
        confidence: 0.94
      }
    ]
  }
];

async function seed() {
  console.log('🌱 Seeding Contrib Compass SQLite database...');

  // 1. Seed demo user
  queries.upsertUser(DEMO_USER);
  console.log(`✅ Seeded user: ${DEMO_USER.username}`);

  // 2. Seed repos and issues
  for (const r of SEED_REPOS) {
    const savedRepo = queries.upsertRepo({
      id: r.id,
      github_repo_id: r.github_repo_id,
      owner: r.owner,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      url: r.url,
      stars: r.stars,
      connected_by_user_id: DEMO_USER.id
    });
    console.log(`📁 Seeded repo: ${savedRepo.full_name}`);

    for (const iss of r.issues) {
      queries.upsertIssue({
        id: iss.id,
        repo_id: savedRepo.id,
        github_issue_id: String(iss.number),
        number: iss.number,
        title: iss.title,
        body: iss.body,
        url: iss.url,
        state: 'open',
        comments_count: iss.comments_count,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString()
      });

      queries.upsertIssueLabel({
        issue_id: iss.id,
        difficulty: iss.difficulty,
        skill_area: iss.skill_area,
        effort: iss.effort,
        confidence: iss.confidence,
        summary: iss.summary || `${iss.difficulty} priority: ${iss.title.slice(0, 95)}.`
      });
    }
    console.log(`   ↳ Seeded ${r.issues.length} triaged issues for ${savedRepo.full_name}`);
  }

  console.log('🎉 Seeding complete! Contrib Compass database is ready for demo.');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seed };
