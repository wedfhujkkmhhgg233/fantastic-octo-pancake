function showTime() {
    const date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : s < 10 ? "0" + s : s;
    document.getElementById("MyClockDisplay").innerText = `Current Time: ${h}:${m}:${s}`;
    setTimeout(showTime, 1000);
}
showTime();

function toggleBurgerMenu() {
    document.getElementById('burgerMenu').classList.toggle('open');
    document.querySelector('.burger-overlay').classList.toggle('active');
}

document.getElementById('year').innerText = new Date().getFullYear();

async function fetchApiEndpoints() {
    const response = await fetch('https://jerome-web.gleeze.com/service-list');
    return response.json();
}

function populateApiContent(endpoints) {
    const categoryList = document.getElementById('categoryList');
    const categories = {};
    let totalEndpoints = 0;

    endpoints.forEach(endpoint => {
        if (!categories[endpoint.category]) {
            categories[endpoint.category] = [];
        }
        categories[endpoint.category].push(endpoint);
        totalEndpoints++;
    });

    for (const [category, apiList] of Object.entries(categories)) {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `<i class="fas fa-folder-open"></i> ${category}`;
        categoryItem.onclick = () => toggleEndpoints(apiList, categoryItem);
        categoryList.appendChild(categoryItem);
        
        const endpointList = document.createElement('div');
        endpointList.className = 'endpoint-list';

        apiList.forEach(api => {
            const endpointItem = document.createElement('div');
            endpointItem.className = 'endpoint-item';
            endpointItem.innerHTML = `<i class="fas fa-plug"></i> ${api.name}`;
            endpointItem.onclick = () => window.location.href = api.link[0].replace('/api/', '/service/api/');
            endpointList.appendChild(endpointItem);
        });

        categoryList.appendChild(endpointList);
    }

    document.getElementById('category-count').innerText = `Total Categories: ${Object.keys(categories).length}`;
    document.getElementById('endpoint-count').innerText = `Total Endpoints: ${totalEndpoints}`;
}

function toggleEndpoints(apiList, categoryElement) {
    const endpointList = categoryElement.nextElementSibling;
    endpointList.style.display = endpointList.style.display === 'block' ? 'none' : 'block';
}

fetchApiEndpoints()
    .then(endpoints => populateApiContent(endpoints))
    .catch(error => console.error('Error fetching API endpoints:', error));
