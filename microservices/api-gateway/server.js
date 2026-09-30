const http = require('node:http');
const { port, serviceRegistry } = require('./config');

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

http.createServer((request, response) => {
  const path = new URL(request.url, `http://${request.headers.host}`).pathname;
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
