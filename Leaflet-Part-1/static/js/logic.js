fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
// Create the map
const map = L.map('map').setView([37.7749, -122.4194], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo(map);

// Load the earthquake data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
  .then(response => response.json())
  .then(data => {
    // Create a function to determine the marker size based on magnitude
    function getMarkerSize(magnitude) {
      return magnitude * 2;
    }

    // Create a function to determine the marker color based on depth
    function getMarkerColor(depth) {
      if (depth < 10) {
        return '#ADD8E6'; // light blue
      } else if (depth < 30) {
        return '#6495ED'; // blue
      } else if (depth < 50) {
        return '#0F52BA'; // royal blue
      } else if (depth < 70) {
        return '#000080'; // navy blue
      } else {
        return '#000000'; // black
      }
    }

    // Create a function to create a popup for each marker
    function createPopup(feature) {
      return `
        <h2>${feature.properties.place}</h2>
        <p>Magnitude: ${feature.properties.mag}</p>
        <p>Depth: ${feature.geometry.coordinates[2]} km</p>
        <p>Time: ${new Date(feature.properties.time)}</p>
      `;
    }

    // Create a layer group for the markers
    const markers = L.layerGroup().addTo(map);

    // Loop through the earthquake data and create markers
    data.features.forEach(feature => {
      const marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        radius: getMarkerSize(feature.properties.mag),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
      marker.bindPopup(createPopup(feature));
      markers.addLayer(marker);
    });

    // Create a legend
    const legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h2>Legend</h2>
    <p>Marker color indicates depth</p>
    <ul>
      <li><i style="background-color: #ADD8E6; width: 15px; height: 15px; display: inline-block;"></i> 0-10 km</li>
      <li><i style="background-color: #6495ED; width: 15px; height: 15px; display: inline-block;"></i> 10-30 km</li>
      <li><i style="background-color: #0F52BA; width: 15px; height: 15px; display: inline-block;"></i> 30-50 km</li>
      <li><i style="background-color: #000080; width: 15px; height: 15px; display: inline-block;"></i> 50-70 km</li>
      <li><i style="background-color: #000000; width: 15px; height: 15px; display: inline-block;"></i> > 70 km</li>
    </ul>
  `;
  return div;
};
legend.addTo(map);
  })
  .catch(error => console.error(error));