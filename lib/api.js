import { MOCK_USER, MOCK_REPOS, MOCK_ISSUES, MOCK_MATCH_RESULTS } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// In-memory / localStorage cache for connected repos and updated issues during session
let localConnectedRepos = [...MOCK_REPOS];
let localIssues = [...MOCK_ISSUES];

/**
 * Check if the app is configured to use live backend or if mock mode is forced
 */
export const isMockMode = () => {
  if (typeof window !== "undefined") {
    const forced = localStorage.getItem("contrib_force_mock");
    if (forced !== null) return forced === "true";
  }
  return !process.env.NEXT_PUBLIC_API_URL;
};

export const setMockMode = (enabled) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("contrib_force_mock", enabled ? "true" : "false");
    window.dispatchEvent(new Event("api-mode-change"));
  }
};

export const PERSONA_PROFILES = {
  saksham842: {
    login: "Saksham842",
    name: "Saksham",
    avatar_url: "https://avatars.githubusercontent.com/u/96324200?v=4",
    bio: "Full Stack Engineer & Open Source Contributor.",
    public_repos: 28,
    followers: 42,
    skills: ["Next.js", "React", "TypeScript", "Node.js", "TailwindCSS", "AI / LLM"],
    skillWeights: { "Next.js": 94, "React": 92, "TypeScript": 88, "Node.js": 82, "TailwindCSS": 85, "AI / LLM": 79 }
  },
  shadcn: {
    login: "shadcn",
    name: "shadcn",
    avatar_url: "https://avatars.githubusercontent.com/u/124599?v=4",
    bio: "Building UI components, Radix UI & design systems.",
    public_repos: 42,
    followers: 98000,
    skills: ["React", "TypeScript", "TailwindCSS", "UI/UX", "Next.js"],
    skillWeights: { "React": 98, "TypeScript": 95, "TailwindCSS": 99, "UI/UX": 96, "Next.js": 94 }
  },
  leerob: {
    login: "leerob",
    name: "Lee Robinson",
    avatar_url: "https://avatars.githubusercontent.com/u/9113740?v=4",
    bio: "VP of Product at Vercel. Next.js & React educator.",
    public_repos: 89,
    followers: 45000,
    skills: ["Next.js", "React", "TypeScript", "Architecture", "Web Performance"],
    skillWeights: { "Next.js": 99, "React": 95, "TypeScript": 92, "Architecture": 90, "Web Performance": 88 }
  },
  torvalds: {
    login: "torvalds",
    name: "Linus Torvalds",
    avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
    bio: "Creator of Linux and Git.",
    public_repos: 6,
    followers: 215000,
    skills: ["C", "Linux Kernel", "Systems", "Git", "Performance", "Low Level"],
    skillWeights: { "C": 99, "Linux Kernel": 99, "Systems": 96, "Git": 98, "Performance": 94 }
  }
};

/**
 * Auto-detect skills from a GitHub profile by analyzing public repositories
 */
export async function fetchGithubProfileSkills(username) {
  if (!username) throw new Error("Please provide a valid GitHub username");
  const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();

  // Check predefined personas first for instantaneous demo experience
  if (PERSONA_PROFILES[cleanUsername]) {
    await new Promise((r) => setTimeout(r, 400));
    return PERSONA_PROFILES[cleanUsername];
  }

  try {
    // 1. Fetch GitHub User Profile
    const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`);
    if (!userRes.ok) {
      if (userRes.status === 404) throw new Error(`GitHub user "@${cleanUsername}" was not found.`);
      throw new Error(`GitHub API rate limit or error (${userRes.status}).`);
    }
    const userData = await userRes.json();

    // 2. Fetch Public Repos to aggregate languages and topics
    const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=30&sort=pushed`);
    let reposData = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    const languageCounts = {};
    const topicCounts = {};

    if (Array.isArray(reposData)) {
      reposData.forEach((repo) => {
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + (repo.stargazers_count > 5 ? 3 : 1);
        }
        if (Array.isArray(repo.topics)) {
          repo.topics.forEach((t) => {
            const formatted = t.charAt(0).toUpperCase() + t.slice(1);
            topicCounts[formatted] = (topicCounts[formatted] || 0) + 1;
          });
        }
      });
    }

    // Combine top languages and popular topics
    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);

    const mergedSkills = Array.from(new Set([...sortedLanguages, ...sortedTopics]));
    const topSkills = mergedSkills.length > 0 ? mergedSkills.slice(0, 6) : ["JavaScript", "React", "Node.js", "Open Source"];

    const skillWeights = {};
    topSkills.forEach((sk, idx) => {
      skillWeights[sk] = Math.max(65, 96 - idx * 6);
    });

    return {
      login: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      bio: userData.bio || `Active GitHub developer with ${userData.public_repos || 0} public repositories.`,
      public_repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      skills: topSkills,
      skillWeights,
    };
  } catch (err) {
    console.warn(`[GitHub API] Fallback for ${cleanUsername}:`, err.message);
    // Graceful fallback profile to keep demo rock solid
    return {
      login: cleanUsername,
      name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 80000000) + 100000}?v=4`,
      bio: `Open Source Developer. Explores modern frontend and fullstack architectures.`,
      public_repos: 12,
      followers: 18,
      skills: ["React", "TypeScript", "Next.js", "TailwindCSS", "Node.js"],
      skillWeights: { "React": 92, "TypeScript": 88, "Next.js": 85, "TailwindCSS": 81, "Node.js": 75 },
      isFallback: true,
      fallbackReason: err.message
    };
  }
}


/**
 * Authenticate with GitHub
 * POST /api/auth/github -> { sessionToken, user }
 */
export async function loginWithGithub(code = null) {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 600));
    const token = "gh_mock_sess_token_" + Math.random().toString(36).substring(2, 9);
    if (typeof window !== "undefined") {
      localStorage.setItem("contrib_session_token", token);
      localStorage.setItem("contrib_user", JSON.stringify(MOCK_USER));
    }
    return { sessionToken: token, user: MOCK_USER, isMock: true };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to authenticate with GitHub`);
    const data = await res.json();
    if (typeof window !== "undefined" && data.sessionToken) {
      localStorage.setItem("contrib_session_token", data.sessionToken);
      localStorage.setItem("contrib_user", JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    console.warn("[API] Live backend unavailable, falling back to mock session:", err.message);
    const token = "gh_fallback_token_8829";
    if (typeof window !== "undefined") {
      localStorage.setItem("contrib_session_token", token);
      localStorage.setItem("contrib_user", JSON.stringify(MOCK_USER));
    }
    return { sessionToken: token, user: MOCK_USER, isMockFallback: true };
  }
}

/**
 * Connect a GitHub repository for indexing
 * POST /api/repos/connect { repoUrl } -> { repoId, issuesIngested }
 */
export async function connectRepo(repoUrl) {
  if (!repoUrl || !repoUrl.includes("github.com/")) {
    throw new Error("Please provide a valid GitHub repository URL (e.g. https://github.com/owner/repo)");
  }

  const parts = repoUrl.replace("https://github.com/", "").split("/").filter(Boolean);
  const repoName = parts.slice(0, 2).join("/");

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 900));
    const newRepo = {
      id: `repo_${Date.now()}`,
      url: repoUrl,
      name: repoName || "custom/repository",
      description: "Auto-ingested open source repository",
      stars: Math.floor(Math.random() * 10000) + 500,
      issuesIngested: Math.floor(Math.random() * 25) + 10,
      connectedAt: new Date().toISOString()
    };
    localConnectedRepos.unshift(newRepo);
    return {
      repoId: newRepo.id,
      issuesIngested: newRepo.issuesIngested,
      repo: newRepo,
      isMock: true
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/repos/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getStoredToken()}`,
      },
      body: JSON.stringify({ repoUrl }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to connect repository`);
    return await res.json();
  } catch (err) {
    console.warn("[API] connectRepo failed on live API, using local mock fallback:", err.message);
    const newRepo = {
      id: `repo_${Date.now()}`,
      url: repoUrl,
      name: repoName || "custom/repository",
      description: "Auto-ingested open source repository",
      stars: 1200,
      issuesIngested: 15,
      connectedAt: new Date().toISOString()
    };
    localConnectedRepos.unshift(newRepo);
    return {
      repoId: newRepo.id,
      issuesIngested: newRepo.issuesIngested,
      repo: newRepo,
      isMockFallback: true
    };
  }
}

/**
 * Get connected repositories list
 */
export async function getConnectedRepos() {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 200));
    return localConnectedRepos;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/repos`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    });
    if (!res.ok) throw new Error("Failed to fetch connected repos");
    return await res.json();
  } catch (err) {
    return localConnectedRepos;
  }
}

/**
 * Fetch issues from one or multiple repos
 * GET /api/issues?repo=<id> or GET /api/issues?repo=id1,id2
 */
export async function getIssues(repoIds = null) {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 450));
    if (!repoIds) return localIssues;
    const ids = Array.isArray(repoIds) ? repoIds : repoIds.split(",");
    if (ids.length === 0 || ids.includes("all")) return localIssues;
    const filtered = localIssues.filter((iss) => ids.includes(iss.repoId));
    return filtered.length > 0 ? filtered : localIssues;
  }

  try {
    const param = Array.isArray(repoIds) ? repoIds.join(",") : repoIds || "";
    const url = param ? `${API_BASE_URL}/api/issues?repo=${encodeURIComponent(param)}` : `${API_BASE_URL}/api/issues`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getStoredToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch issues`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("[API] getIssues live error, fallback to mock:", err.message);
    return localIssues;
  }
}

/**
 * Match issues against contributor skills and GitHub profile
 * POST /api/match { skills: [], githubProfile } -> [{ issue, score, matchReason }]
 */
export async function getMatches(skills = [], githubProfile = "alexcontributor") {
  const normalizedSkills = Array.isArray(skills)
    ? skills
    : String(skills).split(",").map((s) => s.trim()).filter(Boolean);

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 700));
    // Dynamically adjust scores slightly based on skill matches
    const enriched = MOCK_MATCH_RESULTS.map((item, idx) => {
      const hasSkill = normalizedSkills.some((sk) =>
        item.issue.title.toLowerCase().includes(sk.toLowerCase()) ||
        item.issue.labels?.skillArea?.toLowerCase().includes(sk.toLowerCase())
      );
      const bonus = hasSkill ? 6 : 0;
      const finalScore = Math.min(99, Math.max(50, item.score + bonus - idx * 3));
      return {
        ...item,
        score: finalScore,
      };
    });
    return enriched;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getStoredToken()}`,
      },
      body: JSON.stringify({ skills: normalizedSkills, githubProfile }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to match issues`);
    return await res.json();
  } catch (err) {
    console.warn("[API] getMatches live error, fallback to mock:", err.message);
    return MOCK_MATCH_RESULTS;
  }
}

/**
 * Maintainer feedback to correct issue labels
 * POST /api/issues/:id/correct-label { difficulty, skillArea, effort }
 */
export async function correctLabel(issueId, newLabels) {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 400));
    const target = localIssues.find((i) => i.id === issueId);
    if (target) {
      target.labels = {
        ...target.labels,
        ...newLabels,
        confidence: 1.0,
        maintainerVerified: true,
      };
    }
    return { success: true, updatedIssue: target, isMock: true };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/issues/${issueId}/correct-label`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getStoredToken()}`,
      },
      body: JSON.stringify(newLabels),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update issue labels`);
    return await res.json();
  } catch (err) {
    console.warn("[API] correctLabel live error, updating locally:", err.message);
    const target = localIssues.find((i) => i.id === issueId);
    if (target) {
      target.labels = { ...target.labels, ...newLabels, maintainerVerified: true };
    }
    return { success: true, updatedIssue: target, isMockFallback: true };
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("contrib_session_token") || "";
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("contrib_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
