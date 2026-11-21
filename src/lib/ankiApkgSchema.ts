export const ANKI_COL_SCHEMA_SQL = `
CREATE TABLE col (id integer primary key, crt integer not null, mod integer not null, scm integer not null, ver integer not null, dty integer not null, usn integer not null, ls integer not null, conf text not null, models text not null, decks text not null, dconf text not null, tags text not null);
CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null, mod integer not null, usn integer not null, tags text not null, flds text not null, sfld text not null, csum integer not null, flags integer not null, data text not null);
CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null, ord integer not null, mod integer not null, usn integer not null, type integer not null, queue integer not null, due integer not null, ivl integer not null, factor integer not null, reps integer not null, lapses integer not null, left integer not null, odue integer not null, odid integer not null, flags integer not null, data text not null);
CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null, ease integer not null, ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null, type integer not null);
CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
`;

const CARD_CSS = `.card{font-family:Inter,system-ui,sans-serif;text-align:center;color:#0f172a;background:#fff;padding:24px;line-height:1.5}.lemma{font-family:Newsreader,Georgia,serif;font-size:34px;font-weight:500}.ipa{font-family:monospace;font-size:13px;color:#64748b;margin-top:4px}.sent{margin:16px auto 0;max-width:460px;font-size:16px;color:#334155}.defs{margin:14px auto 0;max-width:480px;text-align:left;font-size:15px}.meta{margin-top:14px;font-size:12px;color:#64748b}`;
const QFMT = `<div class="lemma">{{Lemma}}</div>{{#IPA}}<div class="ipa">{{IPA}}</div>{{/IPA}}{{#Sentence}}<div class="sent">{{Sentence}}</div>{{/Sentence}}`;
const AFMT = `{{FrontSide}}<hr><div class="defs">{{Definition}}</div><div class="meta">{{#CEFR}}<b>{{CEFR}}</b> · {{/CEFR}}{{POS}}{{#Rank}} · #{{Rank}}{{/Rank}}{{#Source}} · {{Source}}{{/Source}}</div>`;

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
