const ctx = {
    mapMode: true,
    MIN_COUNT: 3000,
    ANIM_DURATION: 600, // ms
    NODE_SIZE_NL: 5,
    NODE_SIZE_MAP: 3,
    LINK_ALPHA: 0.2,
    nodes: [],
    links: [],
  };

function createViz(){
    console.log("Loading map");
    map = L.map('mapid').setView([39.82, -98.58], 4);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    ctx.map = map;
}

function loadData(){
    d3.select("svg").selectAll("g").remove();
    ctx.nodes = [];
    ctx.links = [];

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
    
        flights=collection[0].Flights;
        airports=collection[0].Cities;;
    
        flights.forEach(function(d){
          let temp_data = {};
          temp_data.source = d.OriginCityName+", "+d.OriginStateName;
          temp_data.target = d.DestCityName+", "+d.DestStateName;
          temp_data.AverageDelay = d.AverageDelay;
          ctx.links.push(temp_data);
        });
    
        airports.forEach(function(d){
            let temp_data = {};
            let is_source = ctx.links.filter(function(e){return e.source == d.CityCode;}).length!=0;
            let is_target = ctx.links.filter(function(e){return e.target == d.CityCode;}).length!=0;
            if(is_source || is_target){
                temp_data.id = d.CityCode;
                temp_data.state = d.StateCode;
                temp_data.city = d.CityName;
                temp_data.latitude = d.Latitude;
                temp_data.longitude = d.Longitude;
                temp_data.latLng = [d.Latitude, d.Longitude];
                temp_data.name = d.AIRPORT;
                ctx.nodes.push(temp_data);
            }
          });
          console.log("Number of links : " + ctx.links.length)
          console.log(ctx.links)
          console.log("Number of nodes : " + ctx.nodes.length)
          console.log(ctx.nodes)

          let scale = d3.scaleLinear().domain([0, d3.max(flights, function(d) { return d.AverageDelay; })]).range(["green", "red"]);
          ctx.scale = scale;

          populate();
    });
}

function populate(){
    let nodes_overlay = L.d3SvgOverlay(function(selection, projection){
        console.log("Loading airports");
        let updateSelection = selection.attr('id', 'nodes').selectAll('circle').data(ctx.nodes)
            .enter()
            .append('circle')
            .attr("cx", function(d) { return projection.latLngToLayerPoint(d.latLng).x })
            .attr("cy", function(d) { return projection.latLngToLayerPoint(d.latLng).y })
            .attr("r",function(d) {
                return(1/projection.getZoom()*10);
            })
            .attr('stroke','black')
            .attr('stroke-width',1)
            .append('svg:title')
            .text(function(d) { return d.name; });
        
    });

    let links_overlay = L.d3SvgOverlay(function(selection, projection){
        console.log("Loading flights");
        let updateSelection = selection.attr('id','links').selectAll('path').data(ctx.links).enter();
        updateSelection.append("path")
        .attr("d", function(d) {
            let source = ctx.nodes.filter(function(e){return e.id == d.source;})[0];
            let target = ctx.nodes.filter(function(e){return e.id == d.target;})[0];
            let start = projection.latLngToLayerPoint(source.latLng);
            let end = projection.latLngToLayerPoint(target.latLng);
            return "M" + start.x + "," + start.y + "L" + end.x + "," + end.y;
        })
        .attr("stroke", (d) => ctx.scale(d.AverageDelay))
        .on("mouseover", linkmouseover)
        .on("mouseout", linkmouseout)
    });

    nodes_overlay.addTo(ctx.map);
    links_overlay.addTo(ctx.map);
}

function linkmouseover(event, d){
    let current = d3.select(this);
    // Printing orgin and destination cities as label
    
    current.append("svg:title").text(function(d) { return d.source + " - " + d.target + " | Average delay: " + Math.round(d.AverageDelay) +" min"; });

    let paths = d3.select("#links").selectAll("path");
    paths
      .filter(path => path !== d)
      .attr('opacity', 0.1)
      .attr("stroke", "lightgrey");
}

function linkmouseout(event, d){
    let current = d3.select(this);

    let paths = d3.select("#links").selectAll("path");
    paths
      .attr('opacity', 1)
      .attr("stroke", (d) => ctx.scale(d.AverageDelay));
}

function createGraphLayout(svg){
    // var lines = ...;
    let paths = svg.select("#links").selectAll("path");
    // var circles = ...;
    let circles = svg.select("#nodes").selectAll("circle");

    circles.call(d3.drag().on("start", (event, d) => startDragging(event, d))
                          .on("drag", (event, d) => dragging(event, d))
                          .on("end", (event, d) => endDragging(event, d)));
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