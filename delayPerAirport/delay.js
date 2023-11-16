var map = 0;
let ctx={};
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
  let year = document.getElementById('year-select').value;
  let sens = document.getElementById('sens-select').value;

  console.log("Loading data with params : "+year+" "+sens);
  let url = `delay.php?year=${year}&DepArr=${sens}`;
  d3.json(url, function(error, collection){
    if (error) throw error;
  }).then(function(collection) {
    console.log(collection);
    populate(collection[0].Delay,collection[0].Cities,map);
  })
  .catch(error => console.error('Erreur lors de la récupération des données :', error));
}


function populate(Delay,cities,map) {
  console.log("Loading airports");
  d3.select("#mapid").select("svg").append("g").attr("id", "flights");
  let airportGroup = d3.select("#mapid").select("svg").append("g").attr("id", "airport_group");
  ctx.scale = d3.scaleLinear().domain([d3.min(Delay, function(d) { return d.AverageDelay; }),0, d3.max(Delay, function(d) { return d.AverageDelay; })]).range(["green","black", "red"]);

  // Create a function to update marker positions
  function updateMarkers() {

    markers.selectAll('#Airport').attr("transform", function(d) {
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
    })
    .attr("fill", function(d) {return ctx.scale(d.AverageDelay);});
  }

  let markers = airportGroup.selectAll(".marker")
    .data(Delay)
    .enter()
    .append("g")
    
    markers.append("path")
    .attr("class", "marker")
    .attr("id", "Airport")
    .attr("d", airplanePath)

  // Initial positioning of markers
  updateMarkers();

  let legendHeight =100;


  // Définir l'échelle pour la légende de couleur
          var legendScale = d3.scaleLinear()
          .domain([d3.min(Delay, function(d) { return d.AverageDelay; }), 0, d3.max(Delay, function(d) { return d.AverageDelay; })])
          .range([0, legendHeight]);

          // Ajouter un groupe pour la légende de couleur
          let svgEl = d3.select("svg");
          var colorLegendG = svgEl.append("g")
          .attr("id", "colorLegend")
          .attr("opacity", 1)
          .attr("transform", "translate(500), 50)");

          // Créer une gamme de valeurs pour la légende de couleur
          var colorRangeLegend = d3.range(d3.min(Delay, function(d) { return d.AverageDelay; }), d3.max(Delay, function(d) { return d.AverageDelay; }), 0.2).reverse();

          // Ajouter des rectangles colorés à la légende de couleur
          colorLegendG.selectAll("rect")
          .data(colorRangeLegend)
          .enter()
          .append("rect")
          .attr("x", 0)
          .attr("y", function(d, j) { return j; })
          .attr("width", 100)
          .attr("height", 1)  // Hauteur d'une ligne, ajustez selon vos préférences
          .style("fill", function(d) { return ctx.scale(d); });

          // Ajouter une échelle et des étiquettes à la légende de couleur
          colorLegendG.append("g")
          .attr("transform", `translate(10,0)`)
          .call(d3.axisRight(legendScale).ticks(5));

          // Ajouter un texte à la légende de couleur
          colorLegendG.append("text")
          .attr("x", 0)
          .attr("y", colorRangeLegend.length + 12)
          .text("Titre de la légende");  // Ajoutez le titre de la légende selon vos besoins


  
  // Add event listeners for map zoom and viewreset events
  map.on("zoom", updateMarkers);
  map.on("viewreset", updateMarkers);
};

function print_legend(scale) {

    
  
};

