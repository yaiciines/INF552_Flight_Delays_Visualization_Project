function initialize_symbols() {
  airplanePath = "M14 8.947L22 14v2l-8-2.526v5.36l3 1.666V22l-4.5-1L8 22v-1.5l3-1.667v-5.36L3 16v-2l8-5.053V3.5a1.5 1.5 0 0 1 3 0v5.447z";
};

function loadMap() {
  initialize_symbols();
  console.log("Loading map");
  let map = L.map('mapid').setView([39.82, -98.58], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.svg().addTo(map);

  d3.json("affichage.php", function(error, collection){
    if (error) throw error;
  }).then(function(collection) {
    console.log(collection);
    plot_airpot(collection,map);
  });
};

function plot_airpot(collection,map) {
  console.log("Loading airports");
  d3.select("#mapid").select("svg").append("g").attr("id", "airpoirt_group");
  let airportGroup = d3.select("#mapid").select("svg").append("g").attr("id", "airport_group");

  // Create a function to update marker positions
  function updateMarkers() {
    markers.attr("transform", function(d) {
      let latLng = [d.Latitude, d.Longitude];
      let point = map.latLngToLayerPoint(latLng);
      //Need to compensate the size of the ikon
      point.x = point.x - 10;
      point.y = point.y - 10;
      return "translate(" + point.x + "," + point.y+ ")";
    });
  }

  let markers = airportGroup.selectAll(".marker")
    .data(collection)
    .enter()
    .append("path")
    .attr("class", "marker")
    .attr("d", airplanePath)

  // Initial positioning of markers
  updateMarkers();

  // Add event listeners for map zoom and viewreset events
  map.on("zoom", updateMarkers);
  map.on("viewreset", updateMarkers);
};