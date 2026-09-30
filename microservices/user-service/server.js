const http = require('node:http');

const port = Number(process.env.PORT || process.env.USER_SERVICE_PORT) || 3001;
let users = [{ id: '101', name: 'Aarav Patel', email: 'aarav@example.com' }];
let nextId = 102;

function send(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(body === undefined ? '' : JSON.stringify(body)); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON request body.')); } });
  });
}
function validUser(user) { return typeof user.name === 'string' && user.name.trim() && typeof user.email === 'string' && /^\S+@\S+\.\S+$/.test(user.email); }

http.createServer(async (req, res) => {
  const path = new URL(req.url, `http://${req.headers.host}`).pathname;
  const match = path.match(/^\/users(?:\/([^/]+))?$/);
  if (!match) return send(res, 404, { error: 'Route not found.' });
  const id = match[1];
  try {
    if (req.method === 'GET' && !id) return send(res, 200, users);
    const user = users.find((item) => item.id === id);
    if (req.method === 'GET') return user ? send(res, 200, user) : send(res, 404, { error: 'User not found.' });
    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      if (!validUser(body)) return send(res, 400, { error: 'Name and valid email are required.' });
      const created = { id: String(nextId++), name: body.name.trim(), email: body.email.trim().toLowerCase() };
      users.push(created);
      return send(res, 201, created);
    }
    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      if (!user) return send(res, 404, { error: 'User not found.' });
      if (!validUser(body)) return send(res, 400, { error: 'Name and valid email are required.' });
      Object.assign(user, { name: body.name.trim(), email: body.email.trim().toLowerCase() });
      return send(res, 200, user);
    }
    if (req.method === 'DELETE' && id) {
      if (!user) return send(res, 404, { error: 'User not found.' });
      users = users.filter((item) => item.id !== id);
      return send(res, 204);
    }
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) { return send(res, 400, { error: error.message }); }
}).listen(port, () => console.log(`User Service listening on ${port}`));
