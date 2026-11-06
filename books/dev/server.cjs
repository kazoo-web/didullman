// Local test server. Dev only; not deployed.
//   node books/dev/server.cjs
// Serves the poll on http://localhost:8080/books/ and a stand-in Apps Script
// web app on http://localhost:8081/exec that behaves like the real one where it
// matters for the browser:
//   - answers with a 302 redirect to a different origin (port 8082), where the JSON lives
//   - rejects OPTIONS, so any request that triggers a CORS preflight fails, as it would live
// The site server hands the page a config.js pointing at the stand-in, so the real
// config.js is never edited for testing.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createBackend } = require('./gas-harness.cjs');

const ROOT = path.join(__dirname, '..');
const PORTS = { site: +(process.env.SITE_PORT || 8080), exec: +(process.env.EXEC_PORT || 8081), echo: +(process.env.ECHO_PORT || 8082) };
const backend = createBackend();
const pending = new Map();
let seq = 0;
const log = [];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };

function start() {
  const site = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = url.pathname.replace(/^\/books\/?/, '/');
    if (p === '/') p = '/index.html';
    if (p === '/config.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      return res.end(`window.BOOK_POLL_CONFIG = { apiUrl: ${JSON.stringify(process.env.LIVE_API || `http://localhost:${PORTS.exec}/exec`)} };`);
    }
    const file = path.join(ROOT, path.normalize(p));
    if (!file.startsWith(ROOT) || file.includes(path.sep + 'apps-script') || file.includes(path.sep + 'dev')) {
      res.writeHead(404); return res.end();
    }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  });

  const exec = http.createServer((req, res) => {
    log.push({ method: req.method, contentType: req.headers['content-type'] || null });
    if (req.method === 'OPTIONS') { res.writeHead(405); return res.end(); }
    const url = new URL(req.url, 'http://x');
    if (url.pathname !== '/exec') { res.writeHead(404); return res.end(); }
    const respond = (out) => {
      const id = String(++seq);
      pending.set(id, out);
      res.writeHead(302, { Location: `http://localhost:${PORTS.echo}/echo?id=${id}`, 'Access-Control-Allow-Origin': '*' });
      res.end();
    };
    if (req.method === 'GET') return respond(backend.get(Object.fromEntries(url.searchParams)));
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => respond(backend.post(body)));
      return;
    }
    res.writeHead(405); res.end();
  });

  const echo = http.createServer((req, res) => {
    const id = new URL(req.url, 'http://x').searchParams.get('id');
    if (req.method !== 'GET' || !pending.has(id)) { res.writeHead(404); return res.end(); }
    const out = pending.get(id); pending.delete(id);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(out));
  });

  return Promise.all([
    new Promise((r) => site.listen(PORTS.site, r)),
    new Promise((r) => exec.listen(PORTS.exec, r)),
    new Promise((r) => echo.listen(PORTS.echo, r))
  ]).then(() => ({
    backend, log, PORTS,
    close: () => Promise.all([site, exec, echo].map((s) => new Promise((r) => s.close(r))))
  }));
}

module.exports = { start };
if (require.main === module) {
  start().then(({ PORTS }) => console.log(`Poll: http://localhost:${PORTS.site}/books/  (stand-in API on :${PORTS.exec})`));
}
