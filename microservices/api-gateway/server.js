const http = require('node:http');
const { port, serviceRegistry } = require('./config');

const serviceName = 'api-gateway';
let requestCount = 0;
let errorCount = 0;
let durationSeconds = 0;

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function sendMetrics(res) {
  res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
  res.end(`# HELP campusconnect_http_requests_total HTTP requests handled\n# TYPE campusconnect_http_requests_total counter\ncampusconnect_http_requests_total{service="${serviceName}"} ${requestCount}\n# HELP campusconnect_http_errors_total HTTP responses with status 400 or above\n# TYPE campusconnect_http_errors_total counter\ncampusconnect_http_errors_total{service="${serviceName}"} ${errorCount}\n# HELP campusconnect_http_request_duration_seconds Request duration\n# TYPE campusconnect_http_request_duration_seconds summary\ncampusconnect_http_request_duration_seconds_sum{service="${serviceName}"} ${durationSeconds}\ncampusconnect_http_request_duration_seconds_count{service="${serviceName}"} ${requestCount}\n`);
}

http.createServer((request, response) => {
  const path = new URL(request.url, `http://${request.headers.host}`).pathname;
  const started = process.hrtime.bigint();
  response.once('finish', () => {
    if (path === '/metrics') return;
    requestCount += 1;
    if (response.statusCode >= 400) errorCount += 1;
    durationSeconds += Number(process.hrtime.bigint() - started) / 1e9;
  });
  if (request.method === 'GET' && path === '/metrics') return sendMetrics(response);
  if (request.method === 'GET' && path === '/health') return send(response, 200, { status: 'ok', service: 'api-gateway' });
  const target = serviceRegistry.find((service) => path === service.prefix || path.startsWith(`${service.prefix}/`));
  if (!target) return send(response, 404, { error: 'Gateway route not found.' });
  if (!target.url) return send(response, 503, { error: `${target.name} URL is not configured.` });
  const targetUrl = new URL(request.url, target.url);
  const proxyRequest = http.request(targetUrl, { method: request.method, headers: { ...request.headers, host: targetUrl.host } }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(response);
    proxyResponse.on('end', () => console.log(`${request.method} ${path} -> ${target.name} ${proxyResponse.statusCode}`));
  });
  proxyRequest.on('error', () => {
    console.log(`${request.method} ${path} -> ${target.name} 502`);
    if (!response.headersSent) send(response, 502, { error: `${target.name} is unavailable.` });
  });
  request.pipe(proxyRequest);
}).listen(port, () => console.log(`API Gateway listening on ${port}`));
