const openAIKey = process.env.OPENAI_API_KEY;
const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

function fallbackPriority(description) {
  const text = description?.toLowerCase() || "";
  if (/crash|data loss|security|urgent|blocker|fatal|panic|cannot/.test(text))
    return "CRITICAL";
  if (/exception|error|failure|broken|unable|freeze|hang/.test(text))
    return "HIGH";
  if (/slow|ui|display|minor|typo|text|layout/.test(text)) return "MEDIUM";
  return "LOW";
}

function fallbackAssignee(title, description) {
  const text = `${title || ""} ${description || ""}`.toLowerCase();
  if (/security|authentication|auth|oauth|token|password/.test(text))
    return "Security Team / Developer";
  if (/performance|slow|lag|timeout|memory|cpu/.test(text)) return "Developer";
  if (/ui|ux|layout|button|form|modal|screen|responsive|design/.test(text))
    return "Tester / UX";
  if (/database|query|migration|schema|mongo|postgres|sql|nosql/.test(text))
    return "Developer";
  return "Customer Support / Developer";
}

function createSummary(title, description) {
  const snippet = description
    ? description.trim().replace(/\s+/g, " ").slice(0, 280)
    : "";
  return `Summary: ${title}. ${snippet}${snippet.length >= 280 ? "..." : ""}`;
}

async function callOpenAI(prompt, temperature = 0.3) {
  if (!openAIKey) return null;
  try {
    const response = await fetch(openAIEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: 200,
      }),
    });
    const data = await response.json();
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
  } catch (error) {
    console.warn("OpenAI call failed:", error?.message || error);
  }
  return null;
}

async function classifyBugPriority(description) {
  const fallback = fallbackPriority(description);
  if (!openAIKey) return { priority: fallback, source: "heuristic" };

  const prompt = `Classify the following bug description into one of these priorities: LOW, MEDIUM, HIGH, CRITICAL. Return only the single priority word.\n\nBug description:\n${description}`;
  const result = await callOpenAI(prompt);
  const priority = result
    ? result
        .toUpperCase()
        .trim()
        .match(/LOW|MEDIUM|HIGH|CRITICAL/)
    : fallback;
  return {
    priority: priority || fallback,
    source: priority ? "openai" : "heuristic",
  };
}

async function recommendAssignee(title, description) {
  const fallback = fallbackAssignee(title, description);
  if (!openAIKey) return { assignee: fallback, source: "heuristic" };

  const prompt = `Based on the title and description below, recommend the best type of team member to assign this bug to. Keep the answer short.\n\nTitle: ${title}\n\nDescription: ${description}`;
  const result = await callOpenAI(prompt);
  return {
    assignee: result || fallback,
    source: result ? "openai" : "heuristic",
  };
}

async function summarizeBug(title, description) {
  const fallback = createSummary(title, description);
  if (!openAIKey) return { summary: fallback, source: "heuristic" };

  const prompt = `Write a short bug summary from the title and description below. Keep it under 50 words.\n\nTitle: ${title}\n\nDescription: ${description}`;
  const result = await callOpenAI(prompt);
  return {
    summary: result || fallback,
    source: result ? "openai" : "heuristic",
  };
}

module.exports = {
  classifyBugPriority,
  recommendAssignee,
  summarizeBug,
};
