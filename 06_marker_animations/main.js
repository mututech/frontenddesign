document.addEventListener('DOMContentLoaded', () => {
    const defaultPoints = [
        [51.505, -0.09],
        [51.51, -0.1],
        [51.515, -0.11],
        [51.52, -0.12],
        [51.525, -0.13],
        [51.53, -0.14]
    ];

    let points = [...defaultPoints];
    let polyline;
    let marker;
    let currentIndex = 0;
    let moving = false;
    let interval;
    let speed = 60; // Default speed in km/h
    const speedData = [];
    const timeData = [];
    let startTime;

    const map = L.map('map').setView(points[0], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    function initializeMap() {
        if (polyline) map.removeLayer(polyline);
        if (marker) map.removeLayer(marker);

        polyline = L.polyline(points, {color: 'green'}).addTo(map);
        marker = L.marker(points[0]).addTo(map);

        map.setView(points[0], 13);
        currentIndex = 0;
        speedData.length = 0;
        timeData.length = 0;
        if (interval) clearInterval(interval);
        moving = false;
    }

    function moveMarker() {
        if (currentIndex < points.length - 1) {
            const nextPoint = points[currentIndex + 1];
            marker.setLatLng(nextPoint);
            map.panTo(nextPoint);

            // Change polyline color for the traveled path
            const traveledPath = points.slice(0, currentIndex + 2);
            L.polyline(traveledPath, {color: 'blue'}).addTo(map);

            currentIndex++;
            const elapsedTime = (Date.now() - startTime) / 1000 / 3600; // in hours
            speedData.push(speed);
            timeData.push(elapsedTime);
            updateChart();
        } else {
            clearInterval(interval);
        }
    }

    function updateChart() {
        speedChart.data.labels = timeData;
        speedChart.data.datasets[0].data = speedData;
        speedChart.update();
    }

    document.getElementById('play').addEventListener('click', () => {
        if (!moving) {
            startTime = Date.now();
            interval = setInterval(moveMarker, 1000 / (speed / 3.6));
            moving = true;
        }
    });

    document.getElementById('pause').addEventListener('click', () => {
        clearInterval(interval);
        moving = false;
    });

    document.getElementById('reset').addEventListener('click', () => {
        points = [...defaultPoints];
        initializeMap();
        speedChart.data.labels = [];
        speedChart.data.datasets[0].data = [];
        speedChart.update();
    });

    document.getElementById('file-input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: (results) => {
                    points = results.data.map(row => [parseFloat(row[0]), parseFloat(row[1])]);
                    initializeMap();
                }
            });
        }
    });

    document.getElementById('speed').addEventListener('input', (event) => {
        speed = event.target.value;
        if (moving) {
            clearInterval(interval);
            interval = setInterval(moveMarker, 1000 / (speed / 3.6));
        }
    });

    const ctx = document.getElementById('speedChart').getContext('2d');
    const speedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Speed (km/h)',
                data: [],
                borderColor: 'red',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (hours)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Speed (km/h)'
                    }
                }
            }
        }
    });

    initializeMap();
});
