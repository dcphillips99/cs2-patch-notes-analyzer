import fetch from "node-fetch";
import fs from "fs";

const BASE_URL = "https://liquipedia.net/counterstrike/api.php";
const USER_AGENT = "MyCS2Bot/1.0 (https://example.com)";
const SLEEP_MS = 1100; // just over 1 request/second

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllPatchNotes() {
  let results = [];
  let apcontinue = null;

  while (true) {
    const params = new URLSearchParams({
      action: "query",
      list: "allpages",
      apprefix: "Counter-Strike_2/Updates/",
      aplimit: "50",
      format: "json"
    });

    if (apcontinue) params.append("apcontinue", apcontinue);

    const url = `${BASE_URL}?${params.toString()}`;
    console.log(`🔍 Fetching: ${url}`);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": "gzip"
      }
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();
    const pages = data?.query?.allpages || [];
    results.push(...pages.map(p => p.title));

    if (data.continue?.apcontinue) {
      apcontinue = data.continue.apcontinue;
      await sleep(SLEEP_MS); // wait before next page
    } else {
      break;
    }
  }

  return results;
}

(async () => {
  try {
    console.log("📄 Starting polite index fetch...");
    const pages = await fetchAllPatchNotes();
    console.log(`✅ Found ${pages.length} patch note pages.`);

    fs.writeFileSync("patchNotesIndex.json", JSON.stringify(pages, null, 2));
    console.log("💾 Saved to patchNotesIndex.json");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
