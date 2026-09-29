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

## Future service mapping

| UI component | Future API |
| --- | --- |
| Attendance | `GET /attendance` |
| Courses | `GET /courses` |
| Announcements | `GET /announcements` |
| Fee payment | `POST /payment` |
