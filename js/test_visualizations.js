const ctx = {
    w: 820,
    h: 720,
    JITTER_W:50
};
// Assuming you have D3 and D3-fetch libraries loaded
// Replace "your_data.csv" with the path to your data file
function processDelayData(data) {
    const airlines = data.map(d => d.AIRLINE);

    const delayColumns = ['AIR_SYSTEM_DELAY', 'AIRLINE_DELAY', 'LATE_AIRCRAFT_DELAY', 'SECURITY_DELAY', 'WEATHER_DELAY'];

    const countByAirline = {};
    const countWithDelays = {};

    airlines.forEach(airline => {
        countByAirline[airline] = {};
        countWithDelays[airline] = 0;
    });

    data.forEach(d => {
        delayColumns.forEach(delayColumn => {
            if (parseInt(d[delayColumn]) > 0) {
                countWithDelays[d.AIRLINE]++;
                countByAirline[d.AIRLINE][delayColumn] = (countByAirline[d.AIRLINE][delayColumn] || 0) + 1;
            }
        });
    });

    console.log(countByAirline);

    const percentages = airlines.map(airline => {
        const totalDelays = countWithDelays[airline];
        return {
            AIRLINE: airline,
            ...delayColumns.reduce((result, column) => {
                result[column] = (countByAirline[airline][column] || 0) / totalDelays * 100;
                return result;
            }, {})
        };
    });

    console.log(percentages);


    // Now, you can create a bar chart using D3.js or any other library of your choice.
    // For D3.js, you can do something like this:

    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };

    const svg = d3.select("#rootG")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleBand()
        .domain(airlines)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, 100]) // Assuming percentages range from 0 to 100
        .nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(delayColumns)
        .range(['#e45755', '#67a9cf', '#f46d43', '#d73027', '#74add1']);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("g")
        .selectAll("g")
        .data(delayColumns)
        .enter().append("g")
        .attr("fill", color)
        .selectAll("rect")
        .data(d => percentages.map(p => ({ AIRLINE: p.AIRLINE, delay: d, percentage: p[d] })))
        .enter().append("rect")
        .attr("x", d => x(d.AIRLINE) + x.bandwidth() / delayColumns.length * delayColumns.indexOf(d.delay))
        .attr("y", d => y(d.percentage))
        .attr("width", x.bandwidth() / delayColumns.length)
        .attr("height", d => y(0) - y(d.percentage));

    svg.append("g").call(xAxis);

    svg.append("g").call(yAxis);
};

/* ==================================================================================*/

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

        processDelayData(flightsData);
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