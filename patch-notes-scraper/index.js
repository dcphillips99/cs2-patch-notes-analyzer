import fs from "fs";

const API_URL = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=100&format=json";

async function fetchSteamNews() {
  const res = await fetch(API_URL, {
    headers: { "Accept-Encoding": "gzip" }
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const data = await res.json();
  return data.appnews.newsitems;
}

(async () => {
  try {
    const news = await fetchSteamNews();
    console.log(`✅ Fetched ${news.length} news items.`);
    fs.writeFileSync("steamPatchNotes.json", JSON.stringify(news, null, 2));
    console.log("💾 Saved to steamPatchNotes.json");
  } catch (err) {
    console.error("❌ Error fetching Steam news:", err);
  }
})();
