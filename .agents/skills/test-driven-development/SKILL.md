---
name: test-driven-development
description: >-
  Comprehensive guide to Test-Driven Development (TDD) for modern fullstack applications.
  Covers the Red-Green-Refactor cycle, unit & integration testing for Next.js/React components
  (React Testing Library, Jest), Express REST API testing (Supertest), and deterministic mocking
  for external APIs (Octokit GitHub API, Groq LLM).
  Use when creating new features, fixing bugs, or writing test suites.
---

# Test-Driven Development (TDD) Workflow

## Core Philosophy: Red-Green-Refactor

TDD is a disciplined development methodology where tests are written **before** production code:

```
    ┌──────────────┐
    │   1. RED     │ ── Write a failing test specifying the desired behavior
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  2. GREEN    │ ── Write the MINIMAL code required to make the test pass
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ 3. REFACTOR  │ ── Clean up code, remove duplication, maintain passing tests
    └──────────────┘
```

### Golden Rules of TDD:
1. **Never write production code without a failing test first.**
2. **Write only enough test code to demonstrate a failure (compile errors count as failures).**
3. **Write only enough production code to pass the failing test.**
4. **Always mock external I/O (network, third-party APIs, disk) in unit tests.**

---

## 1. Backend TDD: Express API with Supertest

### Phase 1: Write the Failing Test (RED)
Before implementing `POST /api/match`, define the contract test:

```javascript
// server/tests/match.test.js
const request = require("supertest");
const express = require("express");
const matchRoutes = require("../src/routes/match");

// Create minimal test app
const app = express();
app.use(express.json());
app.use("/api/match", matchRoutes);

describe("POST /api/match", () => {
  it("should return 400 Bad Request if skills array is missing or empty", async () => {
    const res = await request(app)
      .post("/api/match")
      .send({ skills: [] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        message: "Skills array is required and must contain at least one skill",
        code: "VALIDATION_ERROR"
      }
    });
  });

  it("should return matches with normalized 0-100 scores and matchReason", async () => {
    const res = await request(app)
      .post("/api/match")
      .send({ skills: ["React", "TypeScript"] });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const firstMatch = res.body[0];
    expect(firstMatch).toHaveProperty("score");
    expect(firstMatch.score).toBeGreaterThanOrEqual(0);
    expect(firstMatch.score).toBeLessThanOrEqual(100);
    expect(firstMatch).toHaveProperty("matchReason");
    expect(typeof firstMatch.matchReason).toBe("string");
    expect(firstMatch.matchReason.length).toBeLessThanOrEqual(120);
    expect(firstMatch).toHaveProperty("issue");
  });
});
```

### Phase 2: Make It Pass (GREEN)
Implement just enough logic in `server/src/routes/match.js`:

```javascript
const express = require("express");
const router = express.Router();
const { matchContributorToIssues } = require("../ai/matcher");
const { getCachedIssues } = require("../services/cache");

router.post("/", async (req, res, next) => {
  try {
    const { skills, githubProfile } = req.body;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        error: {
          message: "Skills array is required and must contain at least one skill",
          code: "VALIDATION_ERROR"
        }
      });
    }

    const issues = await getCachedIssues();
    const results = await matchContributorToIssues({ skills, githubProfile }, issues);
    return res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### Phase 3: Refactor (REFACTOR)
Extract validation logic into reusable middleware (`validateSkills`) and verify tests still pass.

---

## 2. Frontend TDD: React Components with RTL

When building components like `IssueCard`, test behavioral outputs rather than internal component state.

### Testing Behavior Over Implementation:
```javascript
// components/__tests__/IssueCard.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import IssueCard from "../IssueCard";

const mockIssue = {
  id: "iss_42",
  repoName: "facebook/react",
  number: 28412,
  title: "Support async transitions",
  body: "Details about async transitions...",
  url: "https://github.com/facebook/react/issues/28412",
  labels: {
    difficulty: "Advanced",
    skillArea: "React / State",
    effort: "1-2 days",
    confidence: 0.95
  },
  commentsCount: 8,
  createdAt: "2026-09-18T10:00:00Z"
};

describe("<IssueCard />", () => {
  it("renders issue title, repo name, and difficulty badge", () => {
    render(<IssueCard issue={mockIssue} />);

    expect(screen.getByText(/Support async transitions/i)).toBeInTheDocument();
    expect(screen.getByText(/facebook\/react/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced/i)).toBeInTheDocument();
    expect(screen.getByText(/React \/ State/i)).toBeInTheDocument();
  });

  it("calls onSelect handler with the issue object when clicked", () => {
    const handleSelect = jest.fn();
    render(<IssueCard issue={mockIssue} isInteractive={true} onSelect={handleSelect} />);

    const card = screen.getByRole("article");
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockIssue);
  });

  it("displays score meter and reason when showScore is provided", () => {
    render(
      <IssueCard
        issue={mockIssue}
        showScore={88}
        matchReason="Strong alignment with React core skills"
      />
    );

    expect(screen.getByText("88%")).toBeInTheDocument();
    expect(screen.getByText(/Strong alignment with React core skills/i)).toBeInTheDocument();
  });
});
```

---

## 3. Mocking External Services (GitHub & Groq)

Never trigger live API calls during unit test suites. Use deterministic mocks:

### Mocking Groq SDK:
```javascript
jest.mock("groq-sdk", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  difficulty: "Easy",
                  skillArea: "Documentation",
                  effort: "1-2 hrs"
                })
              }
            }
          ]
        })
      }
    }
  }));
});
```

### Mocking Octokit:
```javascript
jest.mock("@octokit/rest", () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: {
        issues: {
          listForRepo: jest.fn().mockResolvedValue({
            data: [
              {
                id: 101,
                number: 1,
                title: "Fix broken link",
                body: "Link in readme is 404",
                html_url: "https://github.com/test/repo/issues/1",
                state: "open",
                comments: 2
              }
            ]
          })
        }
      }
    }))
  };
});
```

---

## 4. TDD Verification Commands

Add these test runners to `package.json`:

```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --collectCoverageFrom='src/**/*.{js,jsx}'"
  }
}
```

### Coverage Goals for Critical Paths:
- **API routes & error handlers**: 90%+ branch coverage
- **Matching & classification algorithms**: 95%+ unit coverage
- **Interactive UI components**: 85%+ statement coverage
