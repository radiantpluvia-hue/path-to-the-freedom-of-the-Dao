import fs from "node:fs";
import path from "node:path";

type EventFile = Array<{ id: string; title: string; description: string; type: string; effects?: any; executorId?: string }>;

const eventsDir = path.resolve(".");

const files = [
  "act1_events.json",
  "act2_events.json",
  "act3_events.json",
  "act4_events.json",
  "act5_events.json",
  "act6_events.json",
  "act7_events.json"
].filter(f => fs.existsSync(path.join(eventsDir, f)));

let ok = true;

for (const f of files) {
  const p = path.join(eventsDir, f);
  const raw = fs.readFileSync(p, "utf-8");
  const data: EventFile = JSON.parse(raw);

  // Basic structure checks
  const ids = new Set<string>();
  data.forEach((ev, i) => {
    if (!ev.id || !ev.title || !ev.description || !ev.type) {
      console.error(`[${f}] Bad event at index ${i}:`, ev);
      ok = false;
    }
    if (ids.has(ev.id)) {
      console.error(`[${f}] Duplicate id: ${ev.id}`);
      ok = false;
    }
    ids.add(ev.id);
  });

  console.log(`[OK] ${f}: ${data.length} events validated`);
}

if (!ok) {
  process.exitCode = 1;
} else {
  console.log("All event files validated ✅");
}
