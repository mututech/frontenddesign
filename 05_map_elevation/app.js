// Initialize the Leaflet map with multiple layers
const map = L.map('map').setView([51.505, -0.09], 13);

// Base layers
const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors & CartoDB'
});

const baseLayers = {
    "Street View": streetLayer,
    "Dark View": darkLayer
};

L.control.layers(baseLayers).addTo(map);

// Sample route coordinates
const routeCoordinates = [
    [51.505, -0.09],
    [51.51, -0.1],
    [51.52, -0.12],
    [51.53, -0.11]
];

// Add route to the map
const route = L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
map.fitBounds(route.getBounds());

// Sample elevation data
const elevationData = [
    { distance: 0, elevation: 50 },
    { distance: 3.3, elevation: 80 },
    { distance: 6.7, elevation: 30 },
    { distance: 10, elevation: 70 }
];

// Create the D3 chart
const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

const x = d3.scaleLinear()
    .domain(d3.extent(elevationData, d => d.distance))
    .range([0, width]);

const y = d3.scaleLinear()
    .domain([0, d3.max(elevationData, d => d.elevation)])
    .range([height, 0]);

const line = d3.line()
    .x(d => x(d.distance))
    .y(d => y(d.elevation));

const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

svg.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(y));

svg.append("path")
    .datum(elevationData)
    .attr("class", "line")
    .attr("d", line);

const focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

focus.append("circle")
    .attr("r", 5)
    .attr("fill", "red");

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", () => focus.style("display", null))
    .on("mouseout", () => focus.style("display", "none"))
    .on("mousemove", mousemove);

function mousemove(event) {
    const bisect = d3.bisector(d => d.distance).left;
    const x0 = x.invert(d3.pointer(event, this)[0]);
    const i = bisect(elevationData, x0, 1);
    const d0 = elevationData[i - 1];
    const d1 = elevationData[i];
    const d = x0 - d0.distance > d1.distance - x0 ? d1 : d0;
    focus.attr("transform", `translate(${x(d.distance)},${y(d.elevation)})`);
    highlightPointOnMap(d.distance);
}

function highlightPointOnMap(distance) {
    const index = elevationData.findIndex(d => d.distance === distance);
    if (index !== -1) {
        const latlng = routeCoordinates[index];
        const marker = L.circleMarker(latlng, {
            radius: 8,
            fillColor: 'red',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        setTimeout(() => {
            map.removeLayer(marker);
        }, 1000);
    }
}

// Add interactivity: highlight point on map when hovering on chart and vice versa
routeCoordinates.forEach((coords, i) => {
    L.circleMarker(coords, {
        radius: 5,
        fillColor: 'blue',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).on('mouseover', () => {
        highlightPointOnChart(i);
    }).addTo(map);
});

function highlightPointOnChart(index) {
    const d = elevationData[index];
    focus.attr("transform", `translate(${x(d.distance)},${y(d.elevation)})`);
}
