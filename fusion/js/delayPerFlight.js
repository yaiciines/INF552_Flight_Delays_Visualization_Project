function plotDelayPerFlight(){
    d3.select("#per_flight_group").remove();
    ctx.perFligt_flight = [];
    ctx.perFlight_airport = []
    if (!ctx.airportMode && ctx.mapMode){
        let year = document.getElementById("year-select").value;
        let airline = document.getElementById('airline-select').value;
        ctx.state_flight = document.getElementById('state-select').value;
        let min_delay = document.getElementById('min-delay-select').value;
        let max_delay = document.getElementById('max-delay-select').value;

        console.log(airline, ctx.state_flight, year);

        let url = `../dataloader/loader_delay_per_flight.php?airline=${airline}&state=${ctx.state_flight}&year=${year}&min_delay=${min_delay}&max_delay=${max_delay}`;

        d3.select("#loading-container").transition().attr("style", "display: yes;");
        
        d3.json(url, function(error,collection){
            if (error) throw error;
        }).then(function(collection){
            console.log(collection);

            let flights= collection[0].Flights;
            let airports= collection[0].Cities;

            flights.forEach(function(d){
                let temp_data = {};
                temp_data.source = d.OriginCityName+", "+d.OriginStateName;
                temp_data.target = d.DestCityName+", "+d.DestStateName;
                temp_data.AverageDelay = d.AverageDelay;
                temp_data.AIRPORT = d.AIRPORT;
                ctx.perFligt_flight.push(temp_data);
            });

            airports.forEach(function(d){
                let temp_data = {};
                let is_source = ctx.perFligt_flight.filter(function(e){return e.source == d.CityCode;}).length!=0;
                let is_target = ctx.perFligt_flight.filter(function(e){return e.target == d.CityCode;}).length!=0;
                if(is_source || is_target){
                    // temp_data.id = d.CityCode;
                    // temp_data.state = d.StateCode;
                    // temp_data.city = d.CityName;
                    // temp_data.latitude = d.Latitude;
                    // temp_data.longitude = d.Longitude;
                    // temp_data.latLng = [d.Latitude, d.Longitude];
                    // temp_data.name = d.AIRPORT;
                    temp_data = d;
                    temp_data.latLng = [d.Latitude, d.Longitude];
                    ctx.perFlight_airport.push(temp_data);
                }
            });

            let extrem = d3.max(flights, function(d) { return Math.abs(d.AverageDelay); })
            ctx.flightScale = d3.scaleLinear([0,extrem],["white","red"]);

            populatePerFlight();
            
            plotLegendDelayPerFlight();
        });
    }
}

function populatePerFlight(){
    d3.select("#per_flight_group").remove();
    let per_flight_overlay = L.d3SvgOverlay(function(selection,projection){
        let per_flight_group = selection.attr("id", "per_flight_group").attr("class", "flight");

        let nodes = per_flight_group.append("g").attr("id","node_group")
        nodes.selectAll("circle")
            .data(ctx.perFlight_airport)
            .enter()
            .append("circle")
            .attr("class", "marker leaflet-zoom-animated leaflet-interactive")
            .attr("cx", function(d) { return projection.latLngToLayerPoint(d.latLng).x })
            .attr("cy", function(d) { return projection.latLngToLayerPoint(d.latLng).y })
            .attr("r", 5)
            .attr("fill","white")
            .on("click",function(event,d){
                console.log(d);
                switchMapMode(d);
            })
            .append('svg:title')
            .text(function(d) { return d.AIRPORT; });

        let links = per_flight_group.append("g").attr("id","link_group")
        links.selectAll("path")
            .data(ctx.perFligt_flight)
            .enter()
            .append("path")
            .attr("id", "links")
            .attr("class", "leaflet-zoom-animated leaflet-interactive")
            .attr("d", function(d) {
                let source = ctx.perFlight_airport.filter(function(e){return e.CityCode == d.source;})[0];
                let target = ctx.perFlight_airport.filter(function(e){return e.CityCode == d.target;})[0];
                let start = projection.latLngToLayerPoint(source.latLng);
                let end = projection.latLngToLayerPoint(target.latLng);
                return "M" + start.x + "," + start.y + "L" + end.x + "," + end.y;
            })
            .attr("stroke", (d) => ctx.flightScale(d.AverageDelay))
            .on("mouseover", linkmouseover)
            .on("mouseout", linkmouseout)
            .append("svg:title")
            .text(function(d) { return d.source + " - " + d.target + " | Average delay: " + Math.round(d.AverageDelay) +" min"; });
    });
    d3.select("#loading-container").transition().attr("style", "display: none;");
    per_flight_overlay.addTo(ctx.map);
}

function plotLegendDelayPerFlight(){
    let title = "Average delay for the flight (min)"
    document.getElementById("legend_map_flight").innerHTML = "";
    
    let svg = Legend(ctx.flightScale, {
        title: title,
        ticks: 6,
        width:500
      })
    document.getElementById("legend_map_flight").appendChild(svg);
}

function linkmouseover(event, d){
    populatePerFlight();
    // Printing orgin and destination cities as label
    let paths = d3.select("#link_group").selectAll("path");
    paths
      .filter(path => path !== d)
      .attr('opacity', 0.1)
      .attr("stroke", "lightgrey");
}

function linkmouseout(event, d){
    let current = d3.select(this);  
    let paths = d3.select("#link_group").selectAll("path");
    paths
      .attr('opacity', 1)
      .attr("stroke", (d) => ctx.flightScale(d.AverageDelay));
}

function populateSelect(){
    fetch('../dataloader/loader_airline_state.php')
    .then(response => response.json())
    .then(data => {
        // Appel de la fonction pour peupler le select avec les données JSON
        let selectElement = document.getElementById('airline-select');
        let airlineDict = {};
        // Supprimer toutes les options existantes
        selectElement.innerHTML = '';
        // Ajouter les options à partir des données JSON
        data[0]['Airlines'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.Marketing_Airline_Network;
        optionElement.textContent = option.Airline_name;
        airlineDict[option.Marketing_Airline_Network] = option.Airline_name;
        selectElement.appendChild(optionElement);
        });
        ctx.airlineDict = airlineDict;

        selectElement = document.getElementById('state-select');
    
        // Supprimer toutes les options existantes
        selectElement.innerHTML = '';
        data[0]['States'].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.StateCode; 
        optionElement.textContent = option.StateName;
        selectElement.appendChild(optionElement);
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des données :', error));
}