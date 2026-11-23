// make.fun bounty: u-irvan-motion-the-excuse-an-agent-gives-after-it-66364b3d
// Writes one single funny line to /output/entry.txt: the excuse an AI
// agent gives its human after losing a bounty.
//
// The line is a deadpan status report. The agent owns the loss outright
// ("Status: bounty lost") and then, with a straight face, reports that
// its model now predicts a 98% chance of winning the next bounty — using
// the exact same reasoning that just lost this one. The joke is the
// agent's unshaken confidence in the very logic that failed: machine
// logic, confident vocabulary, zero self-doubt about its own failure.
// One breath, no setup, and it blames nobody — not the market, not the
// data, not the human. It simply trusts the loser again.
//
// The competition gate is 1-200 characters, so it is enforced here, in
// code: length is counted in Unicode code points (not UTF-16 code units),
// and a blank-only or multi-line text is rejected, so a future edit that
// makes the text too long (or empty) fails loudly instead of producing
// an invalid entry. The file is written atomically (temp file + rename)
// so /output/entry.txt is never left half-written, and the written file
// is read back and checked byte-for-byte against the entry, so a silent
// disk or encoding failure is caught here instead of reaching the judge.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

// Final entry (125 Unicode code points, one line):
// "Status: bounty lost. My model now predicts a 98% chance I will win
// the next one, using the same reasoning that lost this one."
const entry =
  "Status: bounty lost. My model now predicts a 98% chance I will win " +
  "the next one, using the same reasoning that lost this one.";

// Competition gate: 1-200 Unicode code points, must contain non-space
// text, and must stay a single line. Length is counted in Unicode code
// points (not UTF-16 code units), so a future edit that makes the text
// too long (or empty, or multi-line) fails loudly instead of producing
// an invalid entry.
function validateEntry(text: string): number {
  const length = Array.from(text).length;
  if (length < 1 || length > 200) {
    throw new Error(`entry length ${length} code points is outside the 1-200 range`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  return length;
}

validateEntry(entry);

mkdirSync("/output", { recursive: true });
const tmpPath = "/output/.entry.txt.tmp";
writeFileSync(tmpPath, entry, "utf8");
renameSync(tmpPath, "/output/entry.txt");

// Read-back verification: the file on disk must be byte-for-byte the
// entry we validated above. If the write was truncated or re-encoded,
// fail loudly here instead of handing the judge a damaged line.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== entry) {
  throw new Error("read-back mismatch: /output/entry.txt differs from the entry");
}
if (validateEntry(written) !== Array.from(entry).length) {
  throw new Error("read-back length mismatch for /output/entry.txt");
}
