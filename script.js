document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const apiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
    let earthquakeLayer;

    // Function to fetch and display data
    const fetchData = (minMagnitude, days) => {
        const now = Date.now();
        const startDate = new Date(now - days * 24 * 60 * 60 * 1000);

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Clear previous markers
                if (earthquakeLayer) map.removeLayer(earthquakeLayer);

                // Filter and add markers
                const filteredData = data.features.filter(earthquake => {
                    const magnitude = earthquake.properties.mag;
                    const time = earthquake.properties.time;
                    return (
                        magnitude >= minMagnitude &&
                        new Date(time) >= startDate
                    );
                });

                earthquakeLayer = L.layerGroup();

                filteredData.forEach(earthquake => {
                    const coords = earthquake.geometry.coordinates;
                    const magnitude = earthquake.properties.mag;
                    const time = earthquake.properties.time;
                    const location = earthquake.properties.place;

                    if (coords && magnitude && time) {
                        const quakeTime = new Date(time).toLocaleString();

                        L.circleMarker([coords[1], coords[0]], {
                            radius: magnitude * 2, // Size based on magnitude
                            color: "red", // Fixed color
                            fillOpacity: 0.6,
                            weight: 1,
                            fillColor: "red" // Fixed color
                        })
                        .bindPopup(
                            `<strong>Magnitude:</strong> ${magnitude}<br>
                             <strong>Location:</strong> ${location}<br>
                             <strong>Time:</strong> ${quakeTime}`
                        )
                        .addTo(earthquakeLayer);
                    }
                });

                earthquakeLayer.addTo(map);
            })
            .catch(error => console.error("Error fetching earthquake data:", error));
    };

    // Initialize with default filters
    fetchData(0, 30);

    // Slider elements and update values
    const minMagSlider = document.getElementById("minMagnitude");
    const daysSlider = document.getElementById("daysFilter");
    const minMagValue = document.getElementById("minMagValue");
    const daysValue = document.getElementById("daysValue");

    // Update values live when sliders change
    const updateSliderValues = () => {
        minMagValue.textContent = minMagSlider.value;
        daysValue.textContent = daysSlider.value;
    };

    minMagSlider.addEventListener("input", updateSliderValues);
    daysSlider.addEventListener("input", updateSliderValues);

    // Apply filters
    document.getElementById("applyFilters").addEventListener("click", () => {
        const minMagnitude = parseFloat(minMagSlider.value);
        const days = parseInt(daysSlider.value, 10);

        fetchData(minMagnitude, days);
    });
});
