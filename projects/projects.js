import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// ----- The two filters -----
let query = '';           // what's typed in the search box
let selectedYear = null;  // the year of the clicked slice (null = none)

// Projects that match the search box
function getSearchResults() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// Apply BOTH filters, then show the projects
function updateProjectList() {
  let visible = getSearchResults();
  if (selectedYear !== null) {
    visible = visible.filter((p) => p.year === selectedYear);
  }
  renderProjects(visible, projectsContainer, 'h2');
}

function renderPieChart(projectsGiven) {
  // 1. Count projects per year
  let rolledData = d3.rollups(projectsGiven, (v) => v.length, (d) => d.year);
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // 2. Work out slice shapes
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  // 3. Erase the old pie and legend
  let svg = d3.select('#projects-pie-plot');
  let legend = d3.select('.legend');
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // 4. Draw the slices (clickable)
  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', data[idx].label === selectedYear ? 'selected' : '')
      .on('click', () => {
        // Click the same year again = deselect, otherwise select this year
        let year = data[idx].label;
        selectedYear = selectedYear === year ? null : year;

        // Highlight the selected slice and legend item
        svg.selectAll('path')
          .attr('class', (_, i) => (data[i].label === selectedYear ? 'selected' : ''));
        legend.selectAll('li')
          .attr('class', (_, i) => (data[i].label === selectedYear ? 'legend-item selected' : 'legend-item'));

        // Show projects using BOTH filters
        updateProjectList();
      });
  });

  // 5. Draw the legend
  data.forEach((d) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(data.indexOf(d))}`)
      .attr('class', d.label === selectedYear ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Draw the pie once when the page loads
renderPieChart(projects);

// ----- Search -----
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let searchResults = getSearchResults();

  // If the selected year disappeared from the search results, clear it
  if (selectedYear !== null && !searchResults.some((p) => p.year === selectedYear)) {
    selectedYear = null;
  }

  updateProjectList();
  renderPieChart(searchResults);
});