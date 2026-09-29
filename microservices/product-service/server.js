const http = require('node:http');

const port = Number(process.env.PRODUCT_SERVICE_PORT) || 3002;
let products = [{ id: '501', name: 'Campus Hoodie', price: 1299 }];
let nextId = 502;

function send(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(body === undefined ? '' : JSON.stringify(body)); }
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON request body.')); } });
  });
}
function validProduct(product) { return typeof product.name === 'string' && product.name.trim() && Number.isFinite(product.price) && product.price >= 0; }

http.createServer(async (req, res) => {
  const path = new URL(req.url, `http://${req.headers.host}`).pathname;
  const match = path.match(/^\/products(?:\/([^/]+))?$/);
  if (!match) return send(res, 404, { error: 'Route not found.' });
  const id = match[1];
  try {
    if (req.method === 'GET' && !id) return send(res, 200, products);
    const product = products.find((item) => item.id === id);
    if (req.method === 'GET') return product ? send(res, 200, product) : send(res, 404, { error: 'Product not found.' });
    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      if (!validProduct(body)) return send(res, 400, { error: 'Name and non-negative price are required.' });
      const created = { id: String(nextId++), name: body.name.trim(), price: body.price };
      products.push(created);
      return send(res, 201, created);
    }
    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      if (!product) return send(res, 404, { error: 'Product not found.' });
      if (!validProduct(body)) return send(res, 400, { error: 'Name and non-negative price are required.' });
      Object.assign(product, { name: body.name.trim(), price: body.price });
      return send(res, 200, product);
    }
    if (req.method === 'DELETE' && id) {
      if (!product) return send(res, 404, { error: 'Product not found.' });
      products = products.filter((item) => item.id !== id);
      return send(res, 204);
    }
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (error) { return send(res, 400, { error: error.message }); }
}).listen(port, () => console.log(`Product Service listening on ${port}`));
