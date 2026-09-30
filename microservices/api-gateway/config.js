const serviceRegistry = [
  { prefix: '/users', name: 'User Service', url: process.env.USER_SERVICE_URL },
  { prefix: '/products', name: 'Product Service', url: process.env.PRODUCT_SERVICE_URL },
  { prefix: '/orders', name: 'Order Service', url: process.env.ORDER_SERVICE_URL },
];

for (const service of serviceRegistry) {
  if (service.url && !service.url.startsWith('http://') && !service.url.startsWith('https://')) service.url = `http://${service.url}`;
}

module.exports = { port: Number(process.env.PORT || process.env.GATEWAY_PORT) || 8080, serviceRegistry };
