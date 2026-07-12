import { getStore } from "@netlify/blobs";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=300, stale-while-revalidate=3600",
};

export default async () => {
  const store = getStore("live-events");
  const feed = await store.get("exa-discoveries", { type: "json" });
  return new Response(JSON.stringify(feed ?? { updatedAt: null, events: [] }), { headers });
};
