const themeToggle = document.querySelector('#theme-toggle');
const greeting = document.querySelector('#greeting');
const currentDate = document.querySelector('#current-date');
const search = document.querySelector('#announcement-search');
const announcements = [...document.querySelectorAll('.announcement')];
const emptyState = document.querySelector('#no-announcements');

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
  const visible = announcements.filter((announcement) => {
    const matches = announcement.textContent.toLowerCase().includes(query);
    announcement.hidden = !matches;
    return matches;
  });
  emptyState.hidden = visible.length !== 0;
});

updateDateAndGreeting();
setInterval(updateDateAndGreeting, 60_000);
