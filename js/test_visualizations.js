const ctx = {
    w: 820,
    h: 720,
    JITTER_W:50
};

function loadData() {
    Promise.all([
        d3.csv("data/flights_bis.csv"),
        d3.csv("data/airports.csv"),
        d3.csv("data/airlines.csv")
    ]).then(function (data) {
        const [flightsData, airportData, thirdData] = data;
        console.log(`Number of flights: ${flightsData.length}`);
        console.log(`Number of airports: ${airportData.length}`);
        console.log(`Number of third data: ${thirdData.length}`);

        // Now you can work with each dataset separately.
        let flightjanuary = flightsData.filter((d) => d.MONTH == 1);
        console.log(`Number of flights in January: ${flightjanuary.length}`);
        
        // You can also access airport and third data in a similar way.
    }).catch(function (error) {
        console.log(error);
    });
}


/*function loadData() {
    d3.csv("data/flights_bis.csv").then(function (data) {
        console.log(`number of flights: ${data.length}`);
        var slicedData = data.slice(0, 5000);
        console.log(`Number of flights (first 5000 lines): ${slicedData.length}`);
        let flightjanuary = data.filter((d) => (d.MONTH == 1 ));
        //starsWithTeff.forEach(
        //    (d) => { d.Teff = parseFloat(d.Teff); }
        //);
        console.log(`Numer of flights in january: ${flightjanuary.length}`);


    }).catch(function(error){console.log(error)});
};*/

function createViz(){
    console.log("Using D3 v"+d3.version);
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    var rootG = svgEl.append("g").attr("id", "rootG");
    // group for background elements (axes, labels)
    rootG.append("g").attr("id", "bkgG");
    loadData();
    
};