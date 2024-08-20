// Ensure the Mapbox access token is correct
console.log(mapToken);
mapboxgl.accessToken = mapToken;

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom level
});

// Initialize and add the marker
const marker1 = new mapboxgl.Marker()
    .setLngLat(listing.geometry.coordinates) // Set marker at coordinates
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // Add a popup
            .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking.</p>`)
    )
    .addTo(map);
