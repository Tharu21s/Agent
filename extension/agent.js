const DATASET = [
  "Chrome extensions run in a secure environment using Manifest V3.",
  "Cosine similarity measures the angle between two text embeddings.",
  "Keyword search works by matching exact terms from the query.",
  "Semantic search uses vector similarity instead of exact matching.",
  "AI agents can plan, choose tools, and execute reasoning steps."
];

function textToVector(text) {
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  const vector = {};
  for (const token of tokens) {
    vector[token] = (vector[token] || 0) + 1;
  }
  return vector;
}

function cosSim(vec1, vec2) {
  let dotPdt = 0,magni1 = 0, magni2 = 0;
  for (const word in vec1) {
    magni1 += vec1[word] ** 2;
    if (vec2[word]) dotPdt += vec1[word] * vec2[word];
  }
  for (const word in vec2) {
    magni2 += vec2[word] ** 2;
  }
  return magni1 && magni2 ? dotPdt / (Math.sqrt(magni1) * Math.sqrt(magni2)) : 0;
}


function keywordSearch(query) {
  const words = query.toLowerCase().split(/\W+/);
  return DATASET.map(text => {
    const score = words.filter(w => text.toLowerCase().includes(w)).length;
    return { text, score };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
}

function semanticSearch(query) {
  const qVec = textToVector(query);
  return DATASET.map(text => {
    const score = cosSim(qVec, textToVector(text));
    return { text, score };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
}

function pineconefall(query) {
  return {
    text: "Pinecone fallback: no strong match found locally.",
    score: 0.50,
    source: "pinecone"
  };
}

function decideStrategy(query) {
  const words = query.trim().split(/\s+/);
  if (words.length > 5) return "semantic_search";
  if (words.length <= 3) return "keyword_search";
  return "hybrid";
}

export function runAgent(query) {
  const start = performance.now();
  const decision = decideStrategy(query);

  let semantic = [];
  let keyword = [];
  let bestMatch = null;
  let usedFallback = false;

  if (decision === "semantic_search" || decision === "hybrid") {
    semantic = semanticSearch(query);
  }

  if (decision === "keyword_search" || decision === "hybrid") {
    keyword = keywordSearch(query);
  }

  const candidates = [];
  for (const r of semantic) candidates.push({ ...r, source: "local" });
  for (const r of keyword) candidates.push({ ...r, source: "local" });

  candidates.sort((a, b) => b.score - a.score);

  const top = candidates[0];
  if (!top || top.score < 0.75) {
    bestMatch = pineconefall(query);
    usedFallback = true;
  } else {
    bestMatch = top;
  }

  const end = performance.now();

  return {
    planner_decision: decision,
    used_fallback_tool: usedFallback,
    best_match: {
      text: bestMatch.text,
      score: Number(bestMatch.score.toFixed(2)),
      source: bestMatch.source
    },
    trace: {
      reasoning: `Planner selected: ${decision}`,
      semantic_top_k_scores: semantic.map(s => s.score.toFixed(2)),
      keyword_top_k_scores: keyword.map(k => k.score.toFixed(2)),
      latency_ms: Math.round(end - start)
    }
  };
}
