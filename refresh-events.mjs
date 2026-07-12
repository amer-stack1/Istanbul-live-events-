import { getStore } from "@netlify/blobs";

const searches = [
  ["ecommerce", "upcoming 2026 e-commerce e-export retail event conference exhibition Istanbul Turkey"],
  ["medical", "upcoming 2026 medical device medtech digital health event conference exhibition Istanbul Turkey"],
  ["ai", "upcoming 2026 artificial intelligence machine learning event conference workshop Istanbul Turkey"],
  ["startups", "upcoming 2026 startup entrepreneur investor demo day accelerator event Istanbul Turkey"],
];

const stopWords = /\b(202[0-9]|Istanbul|Turkey|Türkiye|event|conference|summit|exhibition|fair|workshop|startup|medical|artificial intelligence|e-commerce)\b/gi;
const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
const idFor = url => `exa-${[...url].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)}`;

function toEvent(result, category) {
  const text = clean([result.title, result.text, ...(result.highlights ?? [])].join(" "));
  return {
    id: idFor(result.url),
    category,
    name: clean(result.title) || "Untitled event listing",
    // Search results are deliberately not treated as confirmed dates. The UI labels these as discoveries.
    start: null,
    end: null,
    dateLabel: result.publishedDate ? `Discovered source published ${result.publishedDate.slice(0, 10)}` : "Date: check organiser",
    venue: "Istanbul / online — check organiser",
    summary: clean(text.replace(stopWords, "")).slice(0, 360) || "Live event discovery from Exa.",
    admission: "Check organiser",
    url: result.url,
    source: new URL(result.url).hostname.replace(/^www\./, ""),
    discovery: true,
  };
}

async function searchExa(category, query) {
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.EXA_API_KEY },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults: 12,
      contents: { text: { maxCharacters: 1400 }, highlights: { maxCharacters: 700 } },
    }),
  });
  if (!response.ok) throw new Error(`Exa returned ${response.status}`);
  const { results = [] } = await response.json();
  return results.filter(result => result.url && /istanbul|turkey|türkiye/i.test(`${result.title} ${result.text}`)).map(result => toEvent(result, category));
}

export default async () => {
  if (!process.env.EXA_API_KEY) throw new Error("EXA_API_KEY is not configured in Netlify environment variables.");
  const batches = await Promise.all(searches.map(([category, query]) => searchExa(category, query)));
  const unique = new Map();
  for (const event of batches.flat()) unique.set(event.url, event);
  const feed = { updatedAt: new Date().toISOString(), events: [...unique.values()] };
  await getStore("live-events").setJSON("exa-discoveries", feed);
  console.log(`Stored ${feed.events.length} Exa discoveries.`);
};

// Runs at minute 15, every six hours. Netlify schedules this only after production deployment.
export const config = { schedule: "15 */6 * * *" };
