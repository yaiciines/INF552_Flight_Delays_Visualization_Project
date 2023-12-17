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
  let url = `delay.php?airline=${airline}&state=${state}&year=${year}&min_delay=${min_delay}&max_delay=${max_delay}`;
  d3.json(url, function(error, collection){
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
    })
    .on("mouseover", handleAirportHover)
    .append("svg:title")
    .text(function(d) { return airport_origine.AIRPORT +", "+ d.OriginCityName + ", "+ d.OriginStateName; });

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
    }).on("mouseover", handleAirportHover)
    .append("svg:title")
    .text(function(d) { return airport_dest.AIRPORT +", "+ d.DestCityName + ", "+ d.DestStateName; });

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

      let x1 = point_origine.x
      let y1 = point_origine.y
      let x2 = point_dest.x
      let y2 = point_dest.y

      let alpha = Math.atan2((y2-y1),(x2-x1));
      let rho = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))/(2*Math.cos(Math.PI/6));
      

      let xcp = x1 + rho*Math.cos(alpha+Math.PI/6);
      let ycp = y1 + rho*Math.sin(alpha+Math.PI/6);
      return "M" + x1 + "," + y1 + "Q" + xcp + "," + ycp + " " + x2 + "," + y2;
    })
    .attr("stroke", function(d) {
      return scale(d.AverageDelay);
    })
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .on("mouseover", handleFlightHover);
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

function handleAirportHover(d) {
  // Mettez en surbrillance les aéroports et vols non connectés
  d3.selectAll(".marker").classed("inactive", true);
  d3.selectAll(".curve").classed("inactive", true);

  d3.select("#Origin").classed("active", true);
  d3.select("#Destination").classed("active", true);
  d3.select("#Flight").classed("active", true);
}

function handleFlightHover(d) {
  // Mettez en surbrillance les aéroports et vols non connectés
  d3.selectAll(".marker").classed("inactive", true);
  d3.selectAll(".curve").classed("inactive", true);

  d3.select("#Origin").classed("active", true);
  d3.select("#Destination").classed("active", true);
  d3.select("#Flight").classed("active", true);
}



//
//
//
//
//

const ctx = {
  w: 800,
  h: 800,
  mapMode: false,
  MIN_COUNT: 3000,
  ANIM_DURATION: 600, // ms
  NODE_SIZE_NL: 5,
  NODE_SIZE_MAP: 3,
  LINK_ALPHA: 0.2,
  nodes: [],
  links: [],
};


// https://github.com/d3/d3-force
const simulation = d3.forceSimulation()
                 .force("link", d3.forceLink()
                                  .id(function(d) { return d.id; })
                                  .distance(5).strength(0.08))
                 .force("charge", d3.forceManyBody())
                 .force("center", d3.forceCenter(ctx.w / 2, ctx.h / 2));

// https://github.com/d3/d3-scale-chromatic
const color = d3.scaleOrdinal(d3.schemeAccent);

function createGraphLayout(svg){
  // var lines = ...;
  let paths = svg.select("#links").selectAll("path");
  // var circles = ...;
  let circles = svg.select("#nodes").selectAll("circle");

  circles.call(d3.drag().on("start", (event, d) => startDragging(event, d))
                        .on("drag", (event, d) => dragging(event, d))
                        .on("end", (event, d) => endDragging(event, d)));
};

function switchVis(showMap){
  if (showMap){
      simulation.stop();
      let links = d3.selectAll('g#links');
      links.transition()
          .attr("opacity", 0)
          .selectAll('path')
          .attr("d", (d)=>{
              console.log("editing line")

              let node1 = ctx.nodes.filter(function(e){return e.id == d.source.id;})[0];
              let node2 = ctx.nodes.filter(function(e){return e.id == d.target.id;})[0];

              if((node1.xplot !=0 || node1.yplot !=0)&&(node2.xplot!=0 || node2.yplot!=0)){
                  // d3.select(this).attr("x1", node1.xplot)
                  // d3.select(this).attr("y1", node1.yplot)
                  // d3.select(this).attr("x2", node2.xplot)
                  // d3.select(this).attr("y2", node2.yplot)

                  let x1 = node1.xplot;
                  let y1 = node1.yplot;
                  let x2 = node2.xplot;
                  let y2 = node2.yplot;

                  let alpha = Math.atan2((y2-y1),(x2-x1));
                  let rho = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))/(2*Math.cos(Math.PI/6));
                  

                  let xcp = x1 + rho*Math.cos(alpha+Math.PI/6);
                  let ycp = y1 + rho*Math.sin(alpha+Math.PI/6);
                 return "M" + x1 + "," + y1 + "Q" + xcp + "," + ycp + " " + x2 + "," + y2;
              }
          })

      let map = d3.select('g#map');
      map.transition().attr("opacity", 1);

      let nodes = d3.selectAll('g#nodes circle');
      nodes.transition()
          .attr('cx', function(d){
              return d.xplot;
          })
          .attr('cy', function(d){
              return d.yplot;
          })
          .attr('r', ctx.NODE_SIZE_MAP)
          .on("end", function(){
              links.transition().attr("opacity", ctx.LINK_ALPHA)
          });
  }
  else {
      let links = d3.selectAll('g#links');
      links.transition().duration(ctx.ANIM_DURATION).attr("opacity", 0).on("end", function(){
          links.selectAll("path")
          .transition()
          .attr("d",  (d) => {
              let x1 = d.source.x;
              let y1 = d.source.y;
              let x2 = d.target.x;
              let y2 = d.target.y;

              let alpha = Math.atan2((y2-y1),(x2-x1));
              let rho = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))/(2*Math.cos(Math.PI/6));
              

              let xcp = x1 + rho*Math.cos(alpha+Math.PI/6);
              let ycp = y1 + rho*Math.sin(alpha+Math.PI/6);
              return "M" + x1 + "," + y1 + "Q" + xcp + "," + ycp + " " + x2 + "," + y2;
          })
          .on("end",function(){
              d3.select("g#links").attr('opacity', ctx.LINK_ALPHA);
              //Endeling the 0,0 point
              links.selectAll("path")
              .each(function(d){
                  if (d.source.xplot == 0 || d.source.yplot == 0 || d.target.xplot == 0 || d.target.yplot == 0){
                      d3.select(this).attr('opacity', ctx.LINK_ALPHA);
                  }
              });
          });
          
      });
      let map = d3.select('g#map');
      map.transition().duration(ctx.ANIM_DURATION).attr("opacity", 0);

      let nodes = d3.selectAll('g#nodes circle');
      nodes.transition().duration(ctx.ANIM_DURATION)
          .attr('cx', function(d){
              let link = ctx.links.filter(function(e){return e.source.id == d.id;});
              if (link.length !=0){
                  return link[0].source.x
              }
              else{
                  link = ctx.links.filter(function(e){return e.target.id == d.id;});
                  return link[0].target.x
              }
          })
          .attr('cy', function(d){
              let link = ctx.links.filter(function(e){return e.source.id == d.id;});
              if (link.length !=0){
                  return link[0].source.y
              }
              else{
                  link = ctx.links.filter(function(e){return e.target.id == d.id;});
                  return link[0].target.y
              }
          })
          .attr('r', ctx.NODE_SIZE_MAP)
          .on("end",function(){
              simulation.restart();
          });
      
  }
};

function createViz(){
  console.log("Using D3 v"+d3.version);
  d3.select("body")
    .on("keydown", function(event, d){handleKeyEvent(event);});
  let svgEl = d3.select("#mapid").select("svg").selectAll("g").remove();
  loadData(svgEl);
};

function loadData(svgEl,map){
  let airport = d3.json("data/airports.json");
  let flights = d3.json("data/flights.json");
  let states_tz = d3.csv("data/states_tz.csv");
  let us_states = d3.json("data/us-states.geojson");

  let airline = document.getElementById('airline-select').value;
  const state = document.getElementById('state-select').value;
  let year = document.getElementById('year-select').value;
  let min_delay = document.getElementById('min-delay-select').value;
  let max_delay = document.getElementById('max-delay-select').value;
  console.log(airline, state, year);
  let url = `delay.php?airline=${airline}&state=${state}&year=${year}&min_delay=${min_delay}&max_delay=${max_delay}`;
  d3.json(url, function(error, collection){
    if (error) throw error;
  }).then(function(collection) {
    console.log(collection);
    populate(collection[0].Flights,collection[0].Cities,map);
    
    flights=collection[0].Flights;
    airports=collection[0].Cities;

    flights.forEach(function(d){
      let temp_data = {};
      if (d.count > ctx.MIN_COUNT){
          temp_data.source = d.OriginCityName+", "+d.OriginStateName;
          temp_data.target = d.DestCityName+", "+d.DestStateName;
          ctx.links.push(temp_data);
      }
    });

    airports.forEach(function(d){
        let temp_data = {};
        let is_source = ctx.links.filter(function(e){return e.source == d.CityCode;}).length!=0;
        let is_target = ctx.links.filter(function(e){return e.target == d.CityCode;}).length!=0;
        if(!startsWithNumber(d.iata) && (is_source || is_target)){
            temp_data.id = d.iata;
            temp_data.state = d.state;
            temp_data.city = d.city;
            temp_data.latitude = d.latitude;
            temp_data.longitude = d.longitude;
            temp_data.name = d.AIRPORT;
            ctx.nodes.push(temp_data);
        }
      });
      console.log("Number of links : " + ctx.links.length)
      console.log("Number of nodes : " + ctx.nodes.length)

      populateMap(map);
      })
  .catch(error => console.error('Erreur lors de la récupération des données :', error));

  Promise.all([airport, flights, states_tz, us_states]).then(function(values){
      let airports = values[0];
      let flights = values[1];
      let states_tz = values[2];
      let us_states = values[3];

      flights.forEach(function(d){
          let temp_data = {};
          if (d.count > ctx.MIN_COUNT){
              temp_data.source = d.origin;
              temp_data.target = d.destination;
              temp_data.value = d.count;
              ctx.links.push(temp_data);
          }
      });

      airports.forEach(function(d){
          let temp_data = {};
          let is_source = ctx.links.filter(function(e){return e.source == d.iata;}).length!=0;
          let is_target = ctx.links.filter(function(e){return e.target == d.iata;}).length!=0;
          if(!startsWithNumber(d.iata) && (is_source || is_target)){
              temp_data.id = d.iata;
              if (states_tz.filter(function(e){return e.State == d.state;}).length!=0){
                  temp_data.group = states_tz.filter(function(e){return e.State == d.state;})[0].TimeZone;
              }
              else{
                  temp_data.group = "Unknown";
              }
              temp_data.state = d.state;
              temp_data.city = d.city;
              temp_data.latitude = d.latitude;
              temp_data.longitude = d.longitude;
              ctx.nodes.push(temp_data);
          }
      });
      console.log("Number of links : " + ctx.links.length)
      console.log("Number of nodes : " + ctx.nodes.length)

      populateMap(us_states);

  }).catch(function(err){
      console.log(err);
  });
};

function startDragging(event, node){
  if (ctx.mapMode){return;}
  if (!event.active){
      simulation.alphaTarget(0.3).restart();
  }
  node.fx = node.x;
  node.fy = node.y;
}

function dragging(event, node){
  if (ctx.mapMode){return;}
  node.fx = event.x;
  node.fy = event.y;
}

function endDragging(event, node){
  if (ctx.mapMode){return;}
  if (!event.active){
      simulation.alphaTarget(0);
  }
  // commenting the following lines out will keep the
  // dragged node at its current location, permanently
  // unless moved again manually
  node.fx = null;
  node.fy = null;
}

function handleKeyEvent(e){
  if (e.keyCode === 84){
      // hit T
      toggleMap();
  }
};

function toggleMap(){
  ctx.mapMode = !ctx.mapMode;
  switchVis(ctx.mapMode);
};

function startsWithNumber(str) {
  const regex = /^[0-9]/;
  return regex.test(str);
};

function populateMap(geojson){
  let svg = d3.select("svg");

   // create a projection for the map
   svg.append("g").attr("id", "map");
   geoPathGen = d3.geoPath().projection(ALBERS_PROJ);
   // The map is created but not displayed
   let map = svg.select("#map").attr("opacity", "0");
   map.selectAll("path")
       .data(geojson.features)
       .enter()
       .append("path")
       .attr("d", geoPathGen)
       .attr("fill", "rgb(236,236,236)")
       .attr("stroke", "black")
       .attr("stroke-width", 0.5);

  svg.append("g").attr("id", "links");
  svg.append("g").attr("id", "nodes");

  let links = svg.select("#links");
  links.selectAll("path")
      .data(ctx.links)
      .enter()
      .append("path")
  
  links.attr("opacity", ctx.LINK_ALPHA);

  let nodes = svg.select("#nodes");
  nodes.selectAll("circle")
      .data(ctx.nodes)
      .enter()
      .append("circle")
      .attr("r", ctx.NODE_SIZE_NL)
      .attr("fill", function(d){return color(d.group);})
      .each(function(d){
          let xy = ALBERS_PROJ([d.longitude, d.latitude])
          if(xy==null){
              d.xplot = 0;
              d.yplot = 0;
          }
          else{
              d.xplot = xy[0];
              d.yplot = xy[1];
          }
      })
      .append("svg:title")
        .text(function(d) { return d.city + " " + d.id; });


  simulation.nodes(ctx.nodes)
      .on("tick", simStep);
      simulation.force("link")
      .links(ctx.links);
      function simStep(){
      // code run at each iteration of the simulation
      // updating the position of nodes and links
      d3.selectAll("#links path")
      .attr("d", (d) => {
          let x1 = d.source.x;
          let y1 = d.source.y;
          let x2 = d.target.x;
          let y2 = d.target.y;

          let alpha = Math.atan2((y2-y1),(x2-x1));
          let rho = Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))/(2*Math.cos(Math.PI/6));
          

          let xcp = x1 + rho*Math.cos(alpha+Math.PI/6);
          let ycp = y1 + rho*Math.sin(alpha+Math.PI/6);
          return "M" + x1 + "," + y1 + "Q" + xcp + "," + ycp + " " + x2 + "," + y2;
      });
      // attr("x1", (d) => (d.source.x))
      // .attr("y1", (d) => (d.source.y))
      // .attr("x2", (d) => (d.target.x))
      // .attr("y2", (d) => (d.target.y));
      d3.selectAll("#nodes circle").attr("cx", (d) => (d.x))
      .attr("cy", (d) => (d.y));
      }

  createGraphLayout(svg);   
};
