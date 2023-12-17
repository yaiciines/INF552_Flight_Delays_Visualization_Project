const ctx = {
    mapMode: true,
    airportMode: true,
    ANIM_DURATION : 600,
    filter : []
}

function loadMap() {
    console.log("Loading map");
    map = L.map('mapid').setView([39.82, -98.58], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
    }).addTo(map);

    ctx.map = map;

    // Hiding flight view
    d3.select("#switchFlightAirport").text("Switch to delay per flight view");
    d3.selectAll(".map").attr("style", "display: yes;");
    d3.selectAll(".perAirport").attr("style", "display: none;");
    d3.selectAll(".flight").attr("style", "display: none;");
    d3.selectAll(".airport").attr("style", "display: yes;");

    populateSelect();

    d3.json("../dataloader/loader_map.php", function(error, collection){
        if (error) throw error;
    }).then(function(collection) {
        console.log(collection);
        plot_airpot(collection);
    });
};

function plot_airpot(collection) {
    if (ctx.airportMode){
        d3.select("svg").remove();
        let airport_overlay = L.d3SvgOverlay(function(sel,proj){
            let airportGroup = sel.attr("id", "airport_group").attr("class","airport")

            airportGroup.selectAll("circle")
            .data(collection)
            .enter()
            .append("circle")
            .attr("class", "marker leaflet-zoom-animated leaflet-interactive")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("transform", function(d) {
                let latLng = [d.Latitude, d.Longitude];
                let point = proj.latLngToLayerPoint(latLng);
                return "translate(" + point.x + "," + point.y+ ")";
            })
            .attr("fill", "white")
            .attr("r", 5000/Math.pow(Math.exp(2), ctx.map.getZoom()))
            .on("click",function(event,d){
                console.log(d);
                switchMapMode(d);

            })
            .append("svg:title")
            .text(function(d) {
                return d.AIRPORT;
            })

        });
        airport_overlay.addTo(ctx.map);
    }
};
function switchFlightAirport(){
    if(ctx.airportMode){
        d3.selectAll(".flight").attr("style", "display: yes;");
        d3.selectAll(".airport").attr("style", "display: none;");
        d3.select("#switchFlightAirport").text("Switch to delay per airport view");
        ctx.airportMode = false;
    }
    else{
        d3.selectAll(".flight").attr("style", "display: none;");
        d3.selectAll(".airport").attr("style", "display: yes;");
        d3.select("#switchFlightAirport").text("Switch to delay per flight view");
        ctx.airportMode = true;
    }
}

function switchMapMode(airport){
    ctx.mapMode = false;
    ctx.filter.push(airport);
    d3.selectAll(".map").attr("style", "display: none;");
    d3.selectAll(".perAirport").attr("style", "display: yes;");
    loadPerAirportView();

}

function returnToMap(){
    ctx.mapMode = true;
    d3.selectAll(".perAirport").attr("style", "display: none;");
    d3.selectAll(".map").attr("style", "display: yes;");
    ctx.filter = [];
    console.log(ctx.airportMode)
    if (ctx.airportMode){
        d3.selectAll(".flight").attr("style", "display: none;");
        d3.selectAll(".airport").attr("style", "display: yes;");
        d3.select("#switchFlightAirport").text("Switch to delay per flight view");
    }
    else {
        d3.selectAll(".flight").attr("style", "display: yes;");
        d3.selectAll(".airport").attr("style", "display: none;");
        d3.select("#switchFlightAirport").text("Switch to delay per airport view");
    }
}