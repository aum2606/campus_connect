const http = require('node:http');

const port = Number(process.env.PORT || process.env.PRODUCT_SERVICE_PORT) || 3002;
let products = [{ id: '501', name: 'Campus Hoodie', price: 1299 }];
let nextId = 502;
const serviceName = 'product-service';
let requestCount = 0;
let errorCount = 0;
let durationSeconds = 0;

function send(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(body === undefined ? '' : JSON.stringify(body)); }
function sendMetrics(res) {
  res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
  res.end(`# HELP campusconnect_http_requests_total HTTP requests handled\n# TYPE campusconnect_http_requests_total counter\ncampusconnect_http_requests_total{service="${serviceName}"} ${requestCount}\n# HELP campusconnect_http_errors_total HTTP responses with status 400 or above\n# TYPE campusconnect_http_errors_total counter\ncampusconnect_http_errors_total{service="${serviceName}"} ${errorCount}\n# HELP campusconnect_http_request_duration_seconds Request duration\n# TYPE campusconnect_http_request_duration_seconds summary\ncampusconnect_http_request_duration_seconds_sum{service="${serviceName}"} ${durationSeconds}\ncampusconnect_http_request_duration_seconds_count{service="${serviceName}"} ${requestCount}\n`);
}
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
  const started = process.hrtime.bigint();
  res.once('finish', () => {
    if (path === '/metrics') return;
    requestCount += 1;
    if (res.statusCode >= 400) errorCount += 1;
    durationSeconds += Number(process.hrtime.bigint() - started) / 1e9;
  });
  if (req.method === 'GET' && path === '/metrics') return sendMetrics(res);
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
