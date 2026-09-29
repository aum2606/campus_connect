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

## Lab 3 RESTful Student API

The complete in-memory CRUD implementation is in `backend/` and uses Express.js. Start it with:

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

`postman/Lab-3-RESTful-Web-Services.postman_collection.json` contains the CRUD and negative-test requests. Run the Express checks with `cd backend && npm test`.

### Spring Boot equivalent

`spring-student-api/` demonstrates the same `GET /students` and `POST /students` flow through `StudentController -> StudentService -> StudentRepository`, using an in-memory store. With JDK 17 and Maven installed, run it using `mvn spring-boot:run` from that directory.

### API design

`/students` identifies the Student collection and `/students/{id}` identifies one Student resource, so the API is resource-oriented. `GET` retrieves, `POST` creates, `PUT` replaces, and `DELETE` removes a resource. The status codes distinguish successful reads/updates (200), creation (201), deletion without a response body (204), invalid input (400), and a missing resource (404).

## Future service mapping

| UI component | Future API |
| --- | --- |
| Attendance | `GET /attendance` |
| Courses | `GET /courses` |
| Announcements | `GET /announcements` |
| Fee payment | `POST /payment` |
