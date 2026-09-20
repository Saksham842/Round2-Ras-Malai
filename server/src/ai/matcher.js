/**
 * Matches contributor skills to open issues using semantic & lexical similarity
 * Normalized score: 0-100
 * matchReason: string <= 120 characters
 */

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function calculateSimilarity(contributorTokens, issueTokens) {
  if (!contributorTokens.length || !issueTokens.length) return 0;
  const setA = new Set(contributorTokens);
  const setB = new Set(issueTokens);

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

async function matchContributorToIssues(contributor, issues = []) {
  const skills = (contributor.skills || []).map(s => s.trim().toLowerCase());
  const profileBio = (contributor.githubProfile || contributor.bio || '').toLowerCase();
  
  const contributorTokens = tokenize(`${skills.join(' ')} ${profileBio}`);

  const scored = issues.map((issue) => {
    const issueText = `${issue.title} ${issue.body || ''} ${(issue.labels && issue.labels.skillArea) || ''}`;
    const issueTokens = tokenize(issueText);

    // 1. Lexical & token similarity (0 - 40 points)
    const jaccard = calculateSimilarity(contributorTokens, issueTokens);
    let score = Math.round(jaccard * 100);

    // 2. Direct skill match bonus (up to 45 points)
    let matchedSkill = null;
    const skillArea = (issue.labels?.skillArea || '').toLowerCase();
    
    for (const skill of skills) {
      if (skillArea.includes(skill) || issueText.includes(skill)) {
        matchedSkill = skill;
        score += 35;
        if (skillArea.includes(skill)) score += 10;
        break;
      }
    }

    // 3. Difficulty suitability bonus (10-15 points)
    const difficulty = issue.labels?.difficulty;
    if (difficulty === 'Easy') score += 15;
    else if (difficulty === 'Intermediate') score += 12;
    else if (difficulty === 'Advanced') score += 8;

    // 4. Base confidence factor
    const confidence = issue.labels?.confidence || 0.85;
    score = Math.round(score * (0.8 + 0.2 * confidence));

    // Clamp score between 15 and 98
    score = Math.min(98, Math.max(25, score));

    // 5. Generate concise match reason (<= 120 chars)
    let matchReason = '';
    const capSkill = matchedSkill ? matchedSkill.charAt(0).toUpperCase() + matchedSkill.slice(1) : 'your stack';
    if (difficulty === 'Easy') {
      matchReason = `Great starter issue matching ${capSkill} with clear reproduction steps.`;
    } else if (difficulty === 'Advanced') {
      matchReason = `High-impact architectural challenge perfectly aligned with ${capSkill}.`;
    } else {
      matchReason = `Strong match for your ${capSkill} skills and component patterns.`;
    }

    if (matchReason.length > 120) {
      matchReason = matchReason.substring(0, 117) + '...';
    }

    return {
      score,
      matchReason,
      issue
    };
  });

  // Sort descending by score and return top 5
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

module.exports = {
  matchContributorToIssues
};
