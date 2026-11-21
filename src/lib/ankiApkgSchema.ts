export const ANKI_COL_SCHEMA_SQL = `
CREATE TABLE col (id integer primary key, crt integer not null, mod integer not null, scm integer not null, ver integer not null, dty integer not null, usn integer not null, ls integer not null, conf text not null, models text not null, decks text not null, dconf text not null, tags text not null);
CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null, mod integer not null, usn integer not null, tags text not null, flds text not null, sfld text not null, csum integer not null, flags integer not null, data text not null);
CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null, ord integer not null, mod integer not null, usn integer not null, type integer not null, queue integer not null, due integer not null, ivl integer not null, factor integer not null, reps integer not null, lapses integer not null, left integer not null, odue integer not null, odid integer not null, flags integer not null, data text not null);
CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null, ease integer not null, ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null, type integer not null);
CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
`;

const BRAND_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M2 20V14.75H8.5V9.5H15.5V4H22V20H2Z" fill="currentColor"/></svg>`;
const CARD_CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,500&display=swap');
.card{font-family:Inter,-apple-system,system-ui,sans-serif;background:#FAF9F6;color:#0F172A;margin:0;padding:24px 16px;text-align:left;-webkit-font-smoothing:antialiased}
.thr-card{max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,.08)}
.thr-bar{height:3px;background:#0F172A}
.thr-body{padding:20px 22px}
.thr-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px;color:#64748B;font-size:10.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.thr-brand{display:inline-flex;align-items:center;gap:6px;color:#0F172A}
.thr-src{font-family:'JetBrains Mono',monospace;font-weight:500;letter-spacing:0;text-transform:none;color:#64748B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.thr-lemma{font-family:Newsreader,Georgia,serif;font-size:36px;font-weight:500;line-height:1.08;letter-spacing:-.02em;color:#0F172A}
.thr-ipa{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#64748B;margin-top:4px}
.thr-sent{margin-top:16px;padding:12px 14px;border-radius:12px;background:#F8FAFC;border:1px solid #E2E8F0;font-size:15px;line-height:1.55;color:#1E293B}
.thr-div{height:1px;background:#E2E8F0;margin:16px 0}
.thr-pills{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}
.thr-pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:600;border:1px solid #E2E8F0;background:#F8FAFC;color:#475569}
.thr-pill.cefr{background:#0F172A;border-color:#0F172A;color:#FFFFFF}
.thr-pill.rank{font-family:'JetBrains Mono',monospace;font-weight:500}
.thr-defs{font-size:14.5px;line-height:1.55;color:#0F172A}
.nightMode .card,.night_mode .card{background:#0A0A0C;color:#F8FAFC}
.nightMode .thr-card,.night_mode .thr-card{background:#141418;border-color:rgba(255,255,255,.12)}
.nightMode .thr-bar,.night_mode .thr-bar{background:#FFFFFF}
.nightMode .thr-brand,.night_mode .thr-brand,.nightMode .thr-lemma,.night_mode .thr-lemma,.nightMode .thr-defs,.night_mode .thr-defs{color:#F8FAFC}
.nightMode .thr-sent,.night_mode .thr-sent{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);color:#E2E8F0}
.nightMode .thr-div,.night_mode .thr-div{background:rgba(255,255,255,.1)}
.nightMode .thr-pill,.night_mode .thr-pill{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);color:#CBD5E1}
.nightMode .thr-pill.cefr,.night_mode .thr-pill.cefr{background:#FFFFFF;border-color:#FFFFFF;color:#0F172A}`;
const QFMT = `<div class="thr-card"><div class="thr-bar"></div><div class="thr-body"><div class="thr-top"><span class="thr-brand">${BRAND_SVG}<span>Threshold</span></span>{{#Source}}<span class="thr-src">{{Source}}</span>{{/Source}}</div><div class="thr-lemma">{{Lemma}}</div>{{#IPA}}<div class="thr-ipa">{{IPA}}</div>{{/IPA}}{{#Sentence}}<div class="thr-sent">{{Sentence}}</div>{{/Sentence}}</div></div>`;
const AFMT = `<div class="thr-card"><div class="thr-bar"></div><div class="thr-body"><div class="thr-top"><span class="thr-brand">${BRAND_SVG}<span>Threshold</span></span>{{#Source}}<span class="thr-src">{{Source}}</span>{{/Source}}</div><div class="thr-lemma">{{Lemma}}</div>{{#IPA}}<div class="thr-ipa">{{IPA}}</div>{{/IPA}}{{#Sentence}}<div class="thr-sent">{{Sentence}}</div>{{/Sentence}}<div class="thr-div"></div><div class="thr-pills">{{#CEFR}}<span class="thr-pill cefr">{{CEFR}}</span>{{/CEFR}}{{#POS}}<span class="thr-pill">{{POS}}</span>{{/POS}}{{#Rank}}<span class="thr-pill rank">#{{Rank}}</span>{{/Rank}}</div><div class="thr-defs">{{Definition}}</div></div></div>`;

export const FIELD_NAMES = ["Lemma", "IPA", "POS", "CEFR", "Rank", "Sentence", "Definition", "Source"];

export function buildColMetadata(deckId: number, modelId: number, deckName: string, nowSec: number) {
  const flds = FIELD_NAMES.map((name, ord) => ({ name, ord, sticky: false, rtl: false, font: "Inter", size: 18, media: [] }));
  const models = {
    [modelId]: {
      id: modelId, name: "Threshold Vocabulary", type: 0, mod: nowSec, usn: -1, sortf: 0, did: deckId,
      tmpls: [{ name: "Recognition", ord: 0, qfmt: QFMT, afmt: AFMT, bqfmt: "", bafmt: "", did: null }],
      flds, css: CARD_CSS, latexPre: "", latexPost: "", req: [[0, "all", [0]]],
    },
  };
  const decks = {
    1: { id: 1, name: "Default", mod: nowSec, usn: -1, lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0], collapsed: false, desc: "", dyn: 0, conf: 1, extendNew: 10, extendRev: 50 },
    [deckId]: { id: deckId, name: deckName, mod: nowSec, usn: -1, lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0], collapsed: false, desc: "Exported from Threshold", dyn: 0, conf: 1, extendNew: 10, extendRev: 50 },
  };
  const dconf = {
    1: { id: 1, name: "Default", mod: nowSec, usn: 0, maxTaken: 60, autoplay: true, timer: 0, replayq: true, new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20 }, rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 200 }, lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 } },
  };
  const conf = { activeDecks: [1], curDeck: 1, newSpread: 0, collapseTime: 1200, timeLim: 0, estTimes: true, dueCounts: true, curModel: String(modelId), nextPos: 1, sortType: "noteFld", sortBackwards: false, addToCur: true };
  return { conf: JSON.stringify(conf), models: JSON.stringify(models), decks: JSON.stringify(decks), dconf: JSON.stringify(dconf) };
}
