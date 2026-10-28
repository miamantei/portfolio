console.log('IT’S ALIVE!');


function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$('nav a');

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
// );

// currentLink?.classList.add('current');

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'resume/index.html', title: 'Resume' },
    { url: 'https://github.com/miamantei', title: 'GitHub' }
];

const BASE_PATH =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1'
        ? '/' // local server
        : '/portfolio/'; // GitHub pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !url.startsWith('http') ? BASE_PATH + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
        a.target = '_blank';
    }

    nav.appendChild(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
        Theme:
        <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>`,
);

let select = document.querySelector('.color-scheme select');

if ('colorScheme' in localStorage) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
    console.log('Color scheme changed to:', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
});

let form = document.querySelector('form');

form?.addEventListener('submit', function (event) {
    event.preventDefault();

    let data = new FormData(form);
    let url = form.action + '?';
    
    for (let [name, value] of data) {
        url += name + '=' + encodeURIComponent(value) + '&';
}

    location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    // Stop if the request failed (e.g. file not found)
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    // Turn the response into usable JavaScript data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // 1. Clear whatever is in the container so we don't get duplicates
  containerElement.innerHTML = '';

  // 2. Loop over every project in the array
  for (const project of projects) {
    // 3. Make a new, empty <article>
    const article = document.createElement('article');

    // 4. Fill it with this project's data
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
    `;

    // 5. Put the finished article on the page
    containerElement.appendChild(article);
  }
}
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}