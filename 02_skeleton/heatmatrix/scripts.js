document.addEventListener("DOMContentLoaded", () => {
    const dataTypeSelect = document.getElementById('dataType');
    const heatMatrix = document.getElementById('heatMatrix').getElementsByTagName('tbody')[0];
    const timeHeaders = document.getElementById('timeHeaders');
    const themeSwitch = document.getElementById('themeSwitch');
    const timeRangeSlider = document.getElementById('timeRangeSlider');
    const timeStepButtons = document.getElementById('timeStepButtons');

    let startTime = 8 * 60; // 8:00 in minutes
    let endTime = 20 * 60; // 20:00 in minutes
    let timeStep = 60; // default 1 hour

    const data = {
        traffic: [
            [12, 15, 8, 6, 10, 12, 15, 20, 25, 30, 28, 26, 20],
            [10, 12, 6, 4, 8, 10, 12, 18, 22, 26, 24, 22, 18],
            [14, 16, 10, 8, 12, 14, 18, 24, 28, 32, 30, 28, 24]
        ],
        fuel: [
            [1.2, 1.5, 0.8, 0.6, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 2.8, 2.6, 2.0],
            [1.0, 1.2, 0.6, 0.4, 0.8, 1.0, 1.2, 1.8, 2.2, 2.6, 2.4, 2.2, 1.8],
            [1.4, 1.6, 1.0, 0.8, 1.2, 1.4, 1.8, 2.4, 2.8, 3.2, 3.0, 2.8, 2.4]
        ],
        distance: [
            [5, 6, 3, 2, 4, 5, 6, 8, 10, 12, 11, 10, 8],
            [4, 5, 2, 1, 3, 4, 5, 7, 9, 11, 10, 9, 7],
            [6, 7, 4, 3, 5, 6, 7, 9, 11, 13, 12, 11, 9]
        ]
    };

    function getHeatClass(value, max) {
        const ratio = value / max;
        if (ratio < 0.33) return 'low';
        if (ratio < 0.66) return 'medium';
        return 'high';
    }

    function updateHeaders() {
        timeHeaders.innerHTML = '<th></th>';
        for (let time = startTime; time <= endTime; time += timeStep) {
            const hours = Math.floor(time / 60).toString().padStart(2, '0');
            const minutes = (time % 60).toString().padStart(2, '0');
            timeHeaders.innerHTML += `<th>${hours}:${minutes}</th>`;
        }
    }

    function updateMatrix() {
        updateHeaders();
        const selectedData = data[dataTypeSelect.value];
        const max = Math.max(...selectedData.flat());
        heatMatrix.innerHTML = '';

        selectedData.forEach((routeData, routeIndex) => {
            const row = document.createElement('tr');
            const routeCell = document.createElement('td');
            routeCell.textContent = `Route ${routeIndex + 1}`;
            row.appendChild(routeCell);

            let index = 0;
            for (let time = startTime; time <= endTime && index < routeData.length; time += timeStep) {
                const cell = document.createElement('td');
                const value = routeData[index];
                cell.textContent = value;
                cell.classList.add('heat', getHeatClass(value, max));
                row.appendChild(cell);
                index++;
            }

            heatMatrix.appendChild(row);
        });
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme', themeSwitch.checked);
        document.body.classList.toggle('light-theme', !themeSwitch.checked);
    }

    function initializeSlider() {
        noUiSlider.create(timeRangeSlider, {
            start: [0, 24], // 00:00 to 24:00
            connect: true,
            tooltips: [
                {
                    to: function (value) {
                        const date = new Date();
                        date.setHours(Math.floor(value % 24));
                        date.setMinutes(Math.floor(value % 1) * 60);
                        return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', hour12: false })}`;
                    }
                },
                {
                    to: function (value) {
                        const date = new Date();
                        date.setHours(Math.floor(value % 24));
                        date.setMinutes(Math.floor(value % 1) * 60);
                        return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', hour12: false })}`;
                    }
                }
            ],
            range: {
                'min': [0],
                'max': [48] // 48 hours (2 days)
            },
            format: {
                to: function (value) {
                    return `${Math.floor(value % 24)}:00`;
                },
                from: function (value) {
                    return Math.floor(value);
                }
            },
            pips: {
                mode: 'steps',
                density: 3,
                format: {
                    to: function (value) {
                        return moment().startOf('day').add(value, 'minutes').format('hh:mm A');
                    }
                }
            }
        });

        timeRangeSlider.noUiSlider.on('update', (values, handle) => {
            startTime = Number(values[0].split(':')[0]) * 60 + Number(values[0].split(':')[1]);
            endTime = Number(values[1].split(':')[0]) * 60 + Number(values[1].split(':')[1]);
            updateMatrix();
        });
    }

    function initializeStepButtons() {
        timeStepButtons.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                timeStep = parseInt(event.target.getAttribute('data-step'));
                document.querySelectorAll('#timeStepButtons .btn-small').forEach(btn => btn.classList.remove('selected'));
                event.target.classList.add('selected');
                updateMatrix();
            }
        });
    }

    dataTypeSelect.addEventListener('change', updateMatrix);
    themeSwitch.addEventListener('change', toggleTheme);

    // Initialize the table with default data and theme
    initializeSlider();
    initializeStepButtons();
    updateMatrix();
    toggleTheme();
});
