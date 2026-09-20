/**
 * Cleans and sanitizes GitHub issue title and body for LLM processing
 * and vector similarity comparison.
 */
function sanitizeIssueText(title = '', body = '') {
  let text = `${title}\n\n${body || ''}`;

  // 1. Remove markdown images and links to images
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // 2. Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 3. Remove HTML tags but keep inner text
  text = text.replace(/<\/?[^>]+(>|$)/g, ' ');

  // 4. Remove badge/shield links
  text = text.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '');

  // 5. Strip common GitHub issue template headers to focus on user content
  const boilerplateHeaders = [
    /###? (Describe the bug|Bug description|Description)/gi,
    /###? (To Reproduce|Steps to Reproduce|Reproduction steps)/gi,
    /###? (Expected behavior|Expected outcome)/gi,
    /###? (Actual behavior|Current behavior)/gi,
    /###? (Environment|System Information|System Info|Browser)/gi,
    /###? (Additional context|Additional information)/gi
  ];
  for (const pattern of boilerplateHeaders) {
    text = text.replace(pattern, '');
  }

  // 6. Strip URLs (replace with empty or domain hint)
  text = text.replace(/https?:\/\/[^\s)]+/g, '');

  // 7. Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  // 8. Truncate to reasonable character count (e.g. max 2000 chars) for fast analysis
  if (text.length > 2000) {
    text = text.substring(0, 2000) + '...';
  }

  return text;
}

module.exports = {
  sanitizeIssueText
};
