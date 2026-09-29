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

## Future service mapping

| UI component | Future API |
| --- | --- |
| Attendance | `GET /attendance` |
| Courses | `GET /courses` |
| Announcements | `GET /announcements` |
| Fee payment | `POST /payment` |
