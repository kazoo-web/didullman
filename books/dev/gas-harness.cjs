// Runs apps-script/Code.gs in Node with in-memory stand-ins for the Apps Script
// services it uses (SpreadsheetApp, LockService, ContentService). Dev/test only.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const CODE = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');

function makeSheet(name) {
  const rows = [];
  return {
    name, rows,
    appendRow(r) { rows.push(Array.from(r, cellIn)); },
    setFrozenRows() {},
    getLastRow() { return rows.length; },
    getRange(row, col, nRows, nCols) {
      return {
        getValues() {
          const out = [];
          for (let i = 0; i < nRows; i++) {
            const src = rows[row - 1 + i] || [];
            out.push(Array.from({ length: nCols }, (_, j) => (src[col - 1 + j] === undefined ? '' : src[col - 1 + j])));
          }
          return out;
        },
        setValues(vals) {
          vals.forEach((v, i) => {
            const r = rows[row - 1 + i] || (rows[row - 1 + i] = []);
            v.forEach((x, j) => { r[col - 1 + j] = cellIn(x); });
          });
        }
      };
    }
  };
}
// Mimic Sheets: a leading apostrophe forces text and isn't returned; an unescaped "=..." would become a formula.
function cellIn(v) {
  if (typeof v === 'string' && v.startsWith("'")) return v.slice(1);
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) throw new Error('Formula injection: ' + v);
  return v;
}

function createBackend() {
  const sheets = {};
  let locked = false;
  const ss = {
    getSheetByName: (n) => sheets[n] || null,
    insertSheet: (n) => (sheets[n] = makeSheet(n))
  };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, flush() {} },
    LockService: {
      getScriptLock: () => ({
        waitLock() { if (locked) throw new Error('Lock timeout'); locked = true; },
        releaseLock() { locked = false; }
      })
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({ text, setMimeType() { return this; } })
    },
    JSON, Date, Math, Array, Object, String, Number
  };
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx, { filename: 'Code.gs' });
  return {
    sheets,
    ctx,
    get(params) { return JSON.parse(ctx.doGet({ parameter: params }).text); },
    post(body) { return JSON.parse(ctx.doPost({ postData: { contents: typeof body === 'string' ? body : JSON.stringify(body) } }).text); }
  };
}

module.exports = { createBackend };
