const serviceRegistry = [
  { prefix: '/users', name: 'User Service', url: process.env.USER_SERVICE_URL },
  { prefix: '/products', name: 'Product Service', url: process.env.PRODUCT_SERVICE_URL },
  { prefix: '/orders', name: 'Order Service', url: process.env.ORDER_SERVICE_URL },
];

for (const service of serviceRegistry) {
  if (!service.url) throw new Error(`${service.name.toUpperCase().replaceAll(' ', '_')}_URL is required.`);
}

module.exports = { port: Number(process.env.GATEWAY_PORT) || 8080, serviceRegistry };
