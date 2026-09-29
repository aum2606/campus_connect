const themeToggle = document.querySelector('#theme-toggle');
const greeting = document.querySelector('#greeting');
const currentDate = document.querySelector('#current-date');
const search = document.querySelector('#announcement-search');
const profileDetails = document.querySelector('#profile-details');
const profileError = document.querySelector('#profile-error');
const announcementList = document.querySelector('#announcement-list');
const announcementsError = document.querySelector('#announcements-error');
const assignmentList = document.querySelector('#assignment-list');
const assignmentsError = document.querySelector('#assignments-error');
const emptyState = document.querySelector('#no-announcements');

const API = {
  profile: 'https://jsonplaceholder.typicode.com/users/1',
  announcements: 'https://jsonplaceholder.typicode.com/posts?_limit=5',
  assignments: 'https://jsonplaceholder.typicode.com/todos?userId=1&_limit=5',
};

function updateDateAndGreeting() {
  const now = new Date();
  const hour = now.getHours();
  greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  currentDate.textContent = now.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Light theme' : 'Dark theme';
});

search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  const announcements = [...announcementList.querySelectorAll('.announcement')];
  const visible = announcements.filter((announcement) => {
    const matches = announcement.textContent.toLowerCase().includes(query);
    announcement.hidden = !matches;
    return matches;
  });
  emptyState.hidden = visible.length !== 0;
});

function showError(element, message) {
  element.textContent = message;
  element.hidden = false;
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
}

async function loadProfile() {
  try {
    const student = await getJson(API.profile);
    profileDetails.innerHTML = `
      <div><dt>Name</dt><dd>${student.name}</dd></div>
      <div><dt>Username</dt><dd>${student.username}</dd></div>
      <div><dt>Email</dt><dd>${student.email}</dd></div>
      <div><dt>Phone</dt><dd>${student.phone}</dd></div>`;
    profileError.hidden = true;
  } catch (error) {
    profileDetails.innerHTML = '';
    showError(profileError, 'Unable to load data. Please try again.');
    console.error(error);
  }
}

async function loadAnnouncements() {
  try {
    const announcements = await getJson(API.announcements);
    announcementList.innerHTML = announcements.map((announcement) => `
      <article class="announcement">
        <h3>${announcement.title}</h3>
        <p>${announcement.body}</p>
      </article>`).join('');
    announcementsError.hidden = true;
    emptyState.hidden = true;
  } catch (error) {
    announcementList.innerHTML = '';
    showError(announcementsError, 'Unable to load data. Please try again.');
    console.error(error);
  }
}

async function loadAssignments() {
  try {
    const assignments = await getJson(API.assignments);
    assignmentList.innerHTML = assignments.map((assignment) => `
      <li>
        <span>${assignment.title}</span>
        <span class="assignment-status">${assignment.completed ? 'Completed' : 'Pending'}</span>
      </li>`).join('');
    assignmentsError.hidden = true;
  } catch (error) {
    assignmentList.innerHTML = '';
    showError(assignmentsError, 'Unable to load data. Please try again.');
    console.error(error);
  }
}

updateDateAndGreeting();
setInterval(updateDateAndGreeting, 60_000);
loadProfile();
loadAnnouncements();
loadAssignments();
