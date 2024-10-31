'use strict';

// Global configuration object
let config;
let services = [];

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
}

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
});

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Handle category selection
function handleCategorySelection(selectedValue, element) {
  // Update select value display with capitalized text
  const selectValueElement = element.closest('.filter-select-box').querySelector("[data-selecct-value]");
  selectValueElement.innerText = selectedValue === 'all' ? 'Select category' : capitalizeFirstLetter(selectedValue);

  // Apply filter to items
  const filterItems = document.querySelectorAll(`[data-service-filter-item]`);
  filterItems.forEach(item => {
    if (selectedValue === "all" || item.dataset.category === selectedValue.toLowerCase()) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });

  // Update active state of filter buttons
  const filterButtons = document.querySelectorAll(`[data-service-filter-btn]`);
  filterButtons.forEach(btn => {
    btn.classList.toggle("active", btn.textContent.toLowerCase() === selectedValue.toLowerCase());
  });

  // Close dropdown if it's open
  const selectElement = element.closest('.filter-select-box').querySelector("[data-select]");
  if (selectElement.classList.contains("active")) {
    elementToggleFunc(selectElement);
  }
}

// Toggle dropdown when clicking the select button
document.querySelectorAll("[data-select]").forEach(select => {
  select.addEventListener("click", function (e) {
    elementToggleFunc(this);
  });
});

function setupCategoryFilter(items) {
  // Get unique categories and capitalize them
  const categories = ['All', ...new Set(items.map(item => capitalizeFirstLetter(item.category)))];
  const categoryFilter = document.getElementById(`service-category-filter`);
  const categorySelect = document.getElementById(`service-category-select`);

  // Clear existing items (except "All")
  while (categoryFilter.children.length > 1) {
    categoryFilter.removeChild(categoryFilter.lastChild);
  }
  while (categorySelect.children.length > 1) {
    categorySelect.removeChild(categorySelect.lastChild);
  }

  // Add category items
  categories.forEach((category, index) => {
    if (index > 0) { // Skip 'All' as it's already added
      // Add filter button
      const filterItem = document.createElement('li');
      filterItem.className = 'filter-item';
      const filterBtn = document.createElement('button');
      filterBtn.setAttribute(`data-service-filter-btn`, '');
      filterBtn.textContent = category;
      filterBtn.addEventListener('click', function() {
        handleCategorySelection(this.textContent.toLowerCase(), this);
      });
      filterItem.appendChild(filterBtn);
      categoryFilter.appendChild(filterItem);

      // Add select item
      const selectItem = document.createElement('li');
      selectItem.className = 'select-item';
      const selectBtn = document.createElement('button');
      selectBtn.setAttribute('data-select-item', '');
      selectBtn.textContent = category;
      selectBtn.addEventListener('click', function() {
        handleCategorySelection(this.textContent.toLowerCase(), this);
      });
      selectItem.appendChild(selectBtn);
      categorySelect.appendChild(selectItem);
    }
  });

  // Add click handler to "All" button
  const allFilterBtn = categoryFilter.querySelector(`[data-service-filter-btn]`);
  allFilterBtn.addEventListener('click', function() {
    handleCategorySelection('all', this);
  });

  // Add click handler to "All" select item
  const allSelectItem = categorySelect.querySelector("[data-select-item]");
  allSelectItem.addEventListener('click', function() {
    handleCategorySelection('all', this);
  });
}

// Display Services with capitalized categories
function displayServices(services) {
  const serviceList = document.getElementById('service-list');
  serviceList.innerHTML = '';

  services.forEach(service => {
    const listItem = document.createElement('li');
    listItem.className = 'project-item active';
    listItem.setAttribute('data-service-filter-item', '');
    listItem.setAttribute('data-category', service.category.toLowerCase());

    listItem.innerHTML = `
      <h3 class="project-title">${service.name}</h3>
      <p class="project-category">${service.description}</p>
      <button class="try-button" onclick="useService('${service.link}')">Use Service</button>
    `;

    serviceList.appendChild(listItem);
  });
}

// page navigation
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navigationLinks.forEach((link, index) => {
  link.addEventListener("click", function () {
    pages.forEach((page, pageIndex) => {
      if (index === pageIndex) {
        page.classList.add("active");
        link.classList.add("active");
        window.scrollTo(0, 0);
      } else {
        page.classList.remove("active");
        navigationLinks[pageIndex].classList.remove("active");
      }
    });
  });
});

// Function to use Service
function useService(serviceLink) {
  // Navigate to the service without showing the loader
  window.location.href = `/service${serviceLink}`;
}

// Functions for loading and displaying content
function showLoader() {
  document.getElementById('loader').style.display = 'flex';
  document.getElementById('content').classList.remove('visible');
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('content').classList.add('visible');
}

async function fetchConfig() {
  try {
    showLoader();
    const response = await fetch('/config');
    config = await response.json();
    updateUIWithConfig();
    await fetchServiceList();
  } catch (error) {
    console.error('Error fetching config:', error);
  } finally {
    hideLoader();
  }
}

function updateUIWithConfig() {
  document.getElementById('page-title').textContent = config.name;
  
  document.getElementById('service-name').textContent = config.name;
  document.getElementById('service-description').textContent = config.description;
  document.getElementById('email-link').textContent = config.email;
  document.getElementById('email-link').href = `mailto:${config.email}`;
  document.getElementById('phone-link').textContent = config.number;
  document.getElementById('phone-link').href = `tel:${config.number}`;
  document.getElementById('birthday').textContent = config.birthday2;
  document.getElementById('birthday').setAttribute('datetime', config.birthday);
  document.getElementById('location').textContent = config.location;
  document.getElementById('facebook-link').href = config.facebook;
  document.getElementById('github-link').href = config.github;
  document.getElementById('twitter-link').href = config.twitter;
  document.getElementById('linkedin-link').href = config.linkedin;
  document.getElementById('about-title').textContent = `About ${config.name}`;
  document.getElementById('about-text-1').textContent = `I am ${config.name2}, a Gamer and Tech Enthusiast`;
  document.getElementById('about-text-2').textContent = `You can check some of my Service here in my website by clicking the services`;
}

async function updateServiceStatistics() {
  try {
    // Get total number of services
    const totalServices = services.length;

    // Get unique categories
    const uniqueCategories = [...new Set(services.map(service => service.category))];
    const totalCategories = uniqueCategories.length;

    // Update the statistics in the UI
    document.getElementById('total-services').textContent = `${totalServices} Available Services`;
    document.getElementById('total-categories').textContent = `${totalCategories} Different Categories`;
  } catch (error) {
    console.error('Error updating Service statistics:', error);
    document.getElementById('total-services').textContent = 'Error loading data';
    document.getElementById('total-categories').textContent = 'Error loading data';
  }
}

async function fetchServiceList() {
  try {
    const response = await fetch('/service-list');
    services = await response.json();
    displayServices(services);
    setupCategoryFilter(services);
    updateServiceStatistics();
  } catch (error) {
    console.error('Error fetching Service list:', error);
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  fetchConfig();
  // Check if this is the main page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    // Show loader on initial page load
    showLoader();
  } else {
    // Hide loader and show content immediately on other pages
    hideLoader();
  }
});
