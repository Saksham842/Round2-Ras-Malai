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
