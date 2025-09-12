  mapboxgl.accessToken = mapToken;


    const map = new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/mapbox/standard', 
        center: listing.geometry.coordinates,
        zoom: 9
    });
    console.log(listing.geometry.coordinates);
    const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset:25 })
            .setHTML(`<h4>${listing.title}<p> You'll be living here </p>`))
        .addTo(map);    
