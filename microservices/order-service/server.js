const http = require('node:http');

const port = Number(process.env.ORDER_SERVICE_PORT) || 3003;
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
let orders = [];
let nextId = 1;

function send(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(body === undefined ? '' : JSON.stringify(body)); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON request body.')); } });
  });
}
async function fetchResource(serviceUrl, resource, id) {
  try {
    const response = await fetch(`${serviceUrl}/${resource}/${id}`, { signal: AbortSignal.timeout(3000) });
    return { status: response.status };
  } catch { return { status: 503 }; }
}

http.createServer(async (req, res) => {
  const path = new URL(req.url, `http://${req.headers.host}`).pathname;
  const match = path.match(/^\/orders(?:\/([^/]+))?$/);
  if (!match) return send(res, 404, { error: 'Route not found.' });
  const id = match[1];
  try {
    if (req.method === 'GET' && !id) return send(res, 200, orders);
    if (req.method === 'GET') {
      const order = orders.find((item) => item.id === id);
      return order ? send(res, 200, order) : send(res, 404, { error: 'Order not found.' });
    }
    if (req.method !== 'POST' || id) return send(res, 405, { error: 'Method not allowed.' });
    const body = await readBody(req);
    if (!body.userId || !body.productId || !Number.isInteger(body.quantity) || body.quantity < 1) return send(res, 400, { error: 'userId, productId, and positive integer quantity are required.' });
    const [user, product] = await Promise.all([
      fetchResource(userServiceUrl, 'users', body.userId),
      fetchResource(productServiceUrl, 'products', body.productId),
    ]);
    if (user.status === 503 || product.status === 503) return send(res, 503, { error: 'A required service is unavailable.' });
    if (user.status === 404 || product.status === 404) return send(res, 404, { error: 'Referenced user or product not found.' });
    const order = { id: String(nextId++), userId: body.userId, productId: body.productId, quantity: body.quantity };
    orders.push(order);
    return send(res, 201, order);
  } catch { return send(res, 500, { error: 'Internal server error.' }); }
}).listen(port, () => console.log(`Order Service listening on ${port}`));
