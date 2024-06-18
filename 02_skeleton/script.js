document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([12.789465331764882, 80.22070692696718], 13);
    //https://leaflet-extras.github.io/leaflet-providers/preview/
    //Dark Mode
    var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    });
    // light mode
    const tiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map);

    const marker = L.marker([12.789465331764882, 80.22070692696718]).addTo(map)
        .bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();

    // const circle = L.circle([51.508, -0.11], {
    //     color: 'red',
    //     fillColor: '#f03',
    //     fillOpacity: 0.5,
    //     radius: 500
    // }).addTo(map).bindPopup('I am a circle.');

    // const polygon = L.polygon([
    //     [51.509, -0.08],
    //     [51.503, -0.06],
    //     [51.51, -0.047]
    // ]).addTo(map).bindPopup('I am a polygon.');


    // const popup = L.popup()
    //     .setLatLng([51.513, -0.09])
    //     .setContent('I am a standalone popup.')
    //     .openOn(map);

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent(`You clicked the map at ${e.latlng.toString()}`)
            .openOn(map);
    }

    map.on('click', onMapClick);
    // Theme toggle button functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            map.removeLayer(tiles); // Remove light mode layer
            map.addLayer(Stadia_AlidadeSmoothDark); // Add dark mode layer
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            map.removeLayer(Stadia_AlidadeSmoothDark); // Remove dark mode layer
            map.addLayer(tiles); // Add light mode layer
        }
    });
});

function toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);
    sidebar.classList.toggle('collapsed');
    const button = sidebar.querySelector('.toggle-button');
    if (sidebar.classList.contains('collapsed')) {
        button.innerText = 'Expand';
    } else {
        button.innerText = 'Collapse';
    }
}

function generateQRCode() {
    var qr = qrcode(4, 'L');
    qr.addData(window.location.href);
    qr.make();
    document.getElementById('qrcode').innerHTML = qr.createImgTag();
}
