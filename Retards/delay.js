var map = 0;

function initialize_symbols() {
  airplanePath = "M14 8.947L22 14v2l-8-2.526v5.36l3 1.666V22l-4.5-1L8 22v-1.5l3-1.667v-5.36L3 16v-2l8-5.053V3.5a1.5 1.5 0 0 1 3 0v5.447z";
};

function loadMap() {
  initialize_symbols();
  console.log("Loading map");
  map = L.map('mapid').setView([39.82, -98.58], 4);


  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.svg().addTo(map);
};

function sendSelection() {
  d3.select("#mapid").select("svg").selectAll("g").remove();

  let airline = document.getElementById('airline-select').value;
  const state = document.getElementById('state-select').value;
  let year = document.getElementById('year-select').value;
  let min_delay = document.getElementById('min-delay-select').value;
  let max_delay = document.getElementById('max-delay-select').value;
  console.log(airline, state, year);
  let url = `delay.php`;
  let params = `?airline=${airline}&state=${state}&year=${year}&min_delay=${min_delay}&max_delay=${max_delay}`; 
  d3.json(url+params, function(error, collection){
    if (error) throw error;
  }).then(function(collection) {
    console.log(collection);
    populate(collection[0].Flights,collection[0].Cities,map);
  })
  .catch(error => console.error('Erreur lors de la récupération des données :', error));
}


function populate(Flights,cities,map) {
  console.log("Loading airports");
  d3.select("#mapid").select("svg").append("g").attr("id", "flights");
  let airportGroup = d3.select("#mapid").select("svg").append("g").attr("id", "airport_group");
  let scale = d3.scaleLinear().domain([0, d3.max(Flights, function(d) { return d.AverageDelay; })]).range(["green", "red"]);

  // Create a function to update marker positions
  function updateMarkers() {
    let lineGenerator = d3.line()
    .curve(d3.curveBasis)
    .x(d => d.x)
    .y(d => d.y);

    markers.selectAll('#Origin').attr("transform", function(d) {
      //Collecting the lat and long of the origin
      let airport_origine = cities.find(function(element) {
        return element.CityCode == d.OriginCityName + ", " +d.OriginStateName;
      });
      let latLng = [airport_origine.Latitude, airport_origine.Longitude];
      let point = map.latLngToLayerPoint(latLng);
      //Need to compensate the size of the ikon
      point.x = point.x - 10;
      point.y = point.y - 10;
      return "translate(" + point.x + "," + point.y+ ")";
    });

    markers.selectAll('#Destination').attr("transform", function(d) {
      //Collecting the lat and long of the origin
      let airport_dest = cities.find(function(element) {
        return element.CityCode == d.DestCityName + ", " +d.DestStateName;
      });
      let latLng = [airport_dest.Latitude, airport_dest.Longitude];
      let point = map.latLngToLayerPoint(latLng);
      //Need to compensate the size of the ikon
      point.x = point.x - 10;
      point.y = point.y - 10;
      return "translate(" + point.x + "," + point.y+ ")";
    });

    markers.selectAll("#Flight").attr("d", function(d) {
      //Collecting the lat and long of the origin
      let airport_origine = cities.find(function(element) {
        return element.CityCode == d.OriginCityName + ", " +d.OriginStateName;
      });
      let airport_dest = cities.find(function(element) {
        return element.CityCode == d.DestCityName + ", " +d.DestStateName;
      });
      let latLng_origine = [airport_origine.Latitude, airport_origine.Longitude];
      let latLng_dest = [airport_dest.Latitude, airport_dest.Longitude];
      let point_origine = map.latLngToLayerPoint(latLng_origine);
      let point_dest = map.latLngToLayerPoint(latLng_dest);
      
      return lineGenerator([point_origine, { x: (point_origine.x + point_dest.x) / 2, y: (point_origine.y + point_dest.y) / 3}, point_dest]);
    })
    .attr("stroke", function(d) {
      return scale(d.AverageDelay);
    })
    .attr("stroke-width", 1)
    .attr("fill", "none");
  }

  let markers = airportGroup.selectAll(".marker")
    .data(Flights)
    .enter()
    .append("g")
    
    markers.append("path")
    .attr("class", "marker")
    .attr("id", "Origin")
    .attr("d", airplanePath)
    markers.append("path")
    .attr("class", "marker")
    .attr("id", "Destination")
    .attr("d", airplanePath)
    markers.append("path")
    .attr("class", "curve")
    .attr("id",'Flight');

  // Initial positioning of markers
  updateMarkers();

  // Add event listeners for map zoom and viewreset events
  map.on("zoom", updateMarkers);
  map.on("viewreset", updateMarkers);
};