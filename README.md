# CampusConnect

CampusConnect is a responsive student service portal. Open `index.html` in a browser.

## Implemented interactions

- Theme switch
- Time-based greeting and live date/time
- Announcement search

## Lab 2 API integration

The Student Profile, Announcements, and Assignments sections load data with JavaScript `fetch()`. Each request checks the response status, converts JSON using `response.json()`, and displays an error message if it fails.

| Section | Method and endpoint | JSON fields displayed |
| --- | --- | --- |
| Student Profile | `GET https://jsonplaceholder.typicode.com/users/1` | `name`, `username`, `email`, `phone` |
| Announcements | `GET https://jsonplaceholder.typicode.com/posts?_limit=5` | `title`, `body` |
| Assignments | `GET https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5` | `title`, `completed` |

## Lab 3 and 4 Student REST API

The complete Express CRUD API is in `backend/`. Lab 4 replaces Lab 3's in-memory store with MongoDB. Copy `backend/.env.example` to `backend/.env`, add an Atlas connection string, then start it with:

```sh
cd backend
npm install
npm start
```

The API runs at `http://localhost:3000`; interactive OpenAPI/Swagger documentation is at `http://localhost:3000/api-docs`.

| Operation | Method | Endpoint | Success | Errors |
| --- | --- | --- | --- | --- |
| List students | `GET` | `/students` | 200 | 500 |
| Get student | `GET` | `/students/{id}` | 200 | 404, 500 |
| Create student | `POST` | `/students` | 201 | 400, 500 |
| Update student | `PUT` | `/students/{id}` | 200 | 400, 404, 500 |
| Delete student | `DELETE` | `/students/{id}` | 204 | 404, 500 |

Example request body:

```json
{
  "name": "Aarav Patel",
  "email": "aarav@example.com",
  "course": "Computer Science",
  "semester": 5
}
```

`postman/Lab-3-RESTful-Web-Services.postman_collection.json` contains the CRUD and negative-test requests. Run the validation checks with `cd backend && npm test`.

### Spring Boot equivalent

`spring-student-api/` demonstrates the same `GET /students` and `POST /students` flow through `StudentController -> StudentService -> StudentRepository`, using an in-memory store. With JDK 17 and Maven installed, run it using `mvn spring-boot:run` from that directory.

### API design

`/students` identifies the Student collection and `/students/{id}` identifies one Student resource, so the API is resource-oriented. `GET` retrieves, `POST` creates, `PUT` replaces, and `DELETE` removes a resource. The status codes distinguish successful reads/updates (200), creation (201), deletion without a response body (204), invalid input (400), and a missing resource (404).

## Lab 4 full-stack integration

```
React client       Android client
     \                 /
      \ HTTP / JSON   /
        Express Student API
                 |
            MongoDB Atlas
```

MongoDB owns persistent Student data. Email is a unique index so one email cannot identify more than one Student. The API enables CORS for `http://localhost:5173` by default; change `CORS_ORIGIN` in `.env` only when needed. After creating a student, restart the server and request `GET /students` to verify persistence.

### React CRUD client

`student-client/` lists, creates, updates, and deletes Students, refreshes after every write, and shows loading, network, validation, and API errors. Copy `.env.example` to `.env`, then run:

```sh
cd student-client
npm install
npm run dev
```

`VITE_API_BASE_URL` is the sole React API URL configuration.

### Android List + Add client

Open `android-student-client/` in Android Studio and run it on an emulator. `MainActivity` uses Retrofit to load Students into a `RecyclerView` and add a Student. Its single base URL is `http://10.0.2.2:3000/`, which reaches the host machine from the Android Emulator.

React and Android call REST rather than MongoDB directly so database credentials and validation stay on the server, client applications are not coupled to MongoDB, and the database can later change without rewriting both clients. Both clients use the same HTTP/JSON resource contract; React handles browser CORS and its development URL, while Android uses Retrofit, an emulator host address, and Toast feedback.

## Lab 5 Docker and containerization

Lab 5 packages the Express Student API and MongoDB as separate containers. The API uses `mongodb` - the Compose service name - rather than `localhost` to reach MongoDB inside the Docker network.

```sh
# Build and start both Lab 5 services
docker compose -f compose.lab5.yaml up --build -d

# Verify containers and test http://localhost:3000/students in Postman
docker compose -f compose.lab5.yaml ps
docker compose -f compose.lab5.yaml logs api

# Stop containers but retain student-mongo-data for the persistence test
docker compose -f compose.lab5.yaml down
```

`backend/Dockerfile` builds the API image. `compose.lab5.yaml` injects `PORT`, `MONGO_URI`, and `CORS_ORIGIN`, creates the `student-network`, and mounts the named `student-mongo-data` volume at MongoDB's `/data/db`. To prove persistence, create a Student through the API, run `docker compose -f compose.lab5.yaml down`, run it again with `up -d`, then request `GET /students` again. Do not append `-v` to `down` when demonstrating persistence.

## Lab 6 microservices

The default `compose.yaml` runs three independently runnable services on the `campus-network`:

```
Postman -> User Service (:3001)
        -> Product Service (:3002)
        -> Order Service (:3003) -> User Service / Product Service
```

Each service owns its resource data: Users, Products, or Orders. The Order Service does not access another service's data directly; it validates IDs with `GET http://user-service:3001/users/{id}` and `GET http://product-service:3002/products/{id}` over the Docker network. `USER_SERVICE_URL` and `PRODUCT_SERVICE_URL` are Compose environment variables, never `localhost` inside a container.

```sh
docker compose -f compose.lab6.yaml up --build -d
docker compose -f compose.lab6.yaml ps
docker compose -f compose.lab6.yaml logs
```

Use `postman/Microservices-Lab-6.postman_collection.json` to test User, Product, and Order endpoints. `POST /orders` with user `101` and product `501` returns 201. A missing referenced resource returns 404; if User or Product Service is stopped, the same request returns 503. Restart that service and retry to verify recovery.

## Lab 7 API Gateway, discovery, and cloud deployment

```
Client / Postman (Internet)
           |
   API Gateway (:8080, public)
           |
      campus-network
  /--------|--------\
User     Product    Order
Service  Service    Service
```

Lab 7 exposes only the API Gateway. User, Product, and Order have no host port mappings and remain reachable only on `campus-network`. The gateway routes `/users`, `/products`, and `/orders`, logs the method/path/target/status, returns `GET /health` itself, and responds with 502 when a target is unavailable.

Service discovery is configuration-based: `USER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, and `ORDER_SERVICE_URL` are injected by `compose.yaml` and read by `microservices/api-gateway/config.js`. The route handler only reads the resulting registry. To prove this, change a service URL or port in Compose, run `docker compose up --build -d`, and test the same gateway path - no gateway code changes are required.

```sh
docker compose up --build -d
curl http://localhost:8080/health
curl http://localhost:8080/users
docker compose logs api-gateway
```

`postman/API-Gateway-Lab-7.postman_collection.json` tests the health check and all routed resource families. Stop a target service with `docker compose stop user-service`, then request `http://localhost:8080/users` to verify the gateway's 502 response; restart it with `docker compose start user-service`.

An API Gateway gives clients one public entry point, hides internal service locations, and centralizes cross-cutting behavior such as logging and failure responses. Static configuration is simple and works for a small known deployment, but it needs a redeploy/restart when locations change. Dynamic discovery (such as Consul, Eureka, or Kubernetes DNS) can register instances automatically, track health, and route around failed or scaled instances.

### Cloud deployment - Render Free

`render.yaml` deploys all four services as Render Free web services. This avoids the card requirement, but it is a demonstration setup: User, Product, and Order are public rather than private.

1. In Render, select **New > Blueprint**, choose this repository and `main`, then apply `render.yaml`.
2. Wait for the User, Product, and Order services to deploy. Copy their public `https://...onrender.com` URLs from the Render dashboard.
3. In **campusconnect-order-service > Environment**, set `USER_SERVICE_URL` and `PRODUCT_SERVICE_URL` to the copied User and Product URLs. Save and manually redeploy Order Service.
4. In **campusconnect-api-gateway > Environment**, set `USER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, and `ORDER_SERVICE_URL` to the corresponding public service URLs. Save and manually redeploy the gateway.
5. Copy the gateway's public URL into the Postman collection variable `gatewayUrl`, then run `/health`, `/users`, `/products`, and `/orders`.

Render supplies the `PORT` environment variable to each free web service; the service code now uses it automatically. Free web services can sleep after inactivity, so the first request can take about a minute. If you later add MongoDB Atlas persistence, add its connection string only in the Render dashboard as a secret environment variable.

Compared with Lab 6, clients no longer need to know individual service ports. Operational concerns are collected at the gateway, while services stay private. Configuration makes endpoint locations replaceable without routing-code changes. Cloud deployment moves the public entry point beyond the local machine, which requires environment configuration and platform monitoring. The gateway makes client testing simpler, but its availability becomes important to the whole system.

## Future service mapping

| UI component | Future API |
| --- | --- |
| Attendance | `GET /attendance` |
| Courses | `GET /courses` |
| Announcements | `GET /announcements` |
| Fee payment | `POST /payment` |
