const ctx = {
    w: 820,
    h: 720,
    JITTER_W:50,
    selectedVar: 'WeatherDelay'
};
var data = [];
let x, y;

const delayColumns = ['CarrierDelay', 'WeatherDelay', 'NASDelay', 'SecurityDelay', 'LateAircraftDelay'];

const airlines = [];
const uniqueAirlines = new Set();
const countByAirline = {};
const countWithDelays = {};
let glo_percentages;
const margin = { top: 30, right: 30, bottom: 70, left: 60 };

//==============================================================================================
function processDelayData(data, varDelay) {
    console.log(`Processing data for variable ${varDelay}`);

    const airlines = data.map(d => d.Marketing_Airline_Network);
    console.log("airlines");
    console.log(airlines);

    const uniqueAirlines = new Set(data.map(d => d.Marketing_Airline_Network));

    uniqueAirlines.forEach(airline => {
        countByAirline[airline] = {};
        countWithDelays[airline] = 0;
    });

    data.forEach(d => {
        delayColumns.forEach(delayColumn => {
            if (parseInt(d[delayColumn]) > 0) {
                countWithDelays[d.Marketing_Airline_Network]++;
                countByAirline[d.Marketing_Airline_Network][delayColumn] = (countByAirline[d.Marketing_Airline_Network][delayColumn] || 0) + 1;
            }
        });
    });

    // Calcul des pourcentages pour chaque compagnie aérienne unique
    const percentages = Array.from(uniqueAirlines).map(airline => {
        const totalDelays = countWithDelays[airline];
        return {
            AIRLINE: airline,
            ...delayColumns.reduce((result, column) => {
                result[column] = (countByAirline[airline][column] || 0) / totalDelays * 100;
                return result;
            }, {})
        };
    });

    console.log("countWithDelays");
    console.log(countWithDelays);

    console.log("countByAirline");
    console.log(countByAirline);

    console.log("percentages");
    console.log(percentages);

    const svg = d3.select("#rootG")
        .append("svg")
            .attr("width", ctx.w )
            .attr("height", ctx.h )
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);


    svg.append("text")
            .attr("x", ctx.w / 2)
            .attr("y", 0 - (margin.top / 2)) // Position au-dessus des barres
            .attr("text-anchor", "middle") // Centrer le texte
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text(" Causes des retards des vols en fonction des compagnies aériennes");
    // Ajouter le label pour l'axe X
    svg.append("text")
       .attr("text-anchor", "end")
       .attr("x", ctx.w / 2 + margin.left)
       .attr("y", ctx.h - margin.bottom)
       .style("font-weight", "bold")
       .text("Companie aériennes"); 

    // Ajouter le label pour l'axe Y
    svg.append("text")
       .attr("text-anchor", "end")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - ((ctx.h - margin.bottom) / 2 ))
       .style("font-weight", "bold")
       .attr("dy", "1em")
       .text("Pourcentage d'occurrence de Delays" ); // Remplacez par votre texte

    x = d3.scaleBand()
            .domain(uniqueAirlines)
            .range([0, ctx.w - margin.left - margin.right])
            .padding(0.2);
    
    y = d3.scaleLinear()
            .domain([0, 100])
            .range([ctx.h - margin.top - margin.bottom, 0]);
    
    
    svg.append("g")
        .attr("transform", `translate(0,${ctx.h - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .classed("bar-group", true)
        .selectAll("rect")
        .data(percentages.map(p => ({ AIRLINE: p.AIRLINE, percentage: p[varDelay] })))
        .enter().append("rect")
        .attr("x", d => x(d.AIRLINE))
        .attr("y", d => y(d.percentage))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.percentage))
        .attr("fill", "#69b3a2"); // Utiliser la couleur correspondante
    
    console.log("percentages after bars creation");
    console.log(percentages);

    return percentages;
    

};
function update(varDelay) {
    ctx.selectedVar = varDelay;

    console.log(`Updating with variable ${varDelay}`);

    console.log("percentages");
    console.log(glo_percentages);

    let svg = d3.select("#rootG").select("svg").select("g");
    let bars = svg.selectAll("rect")
        .data(glo_percentages.map(p => ({ AIRLINE: p.AIRLINE, percentage: p[varDelay] })))

    // Mise à jour des barres
    bars.enter().append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", d => x(d.AIRLINE))
        .attr("y", d => y(d.percentage))
        .attr("width", x.bandwidth())
        .attr("height", d => ctx.h - margin.top - margin.bottom - y(d.percentage))
        .attr("fill", "#69b3a2");

    bars.exit().remove();
};


//==============================================================================================

function loadData() {
    d3.json("./causes_query.php")
        .then(function (Data) {
            console.log(`Nombre de lignes: ${Data.length}`);
            data = Data;
            glo_percentages = processDelayData(Data, ctx.selectedVar);

        })
        .catch(function (error) {
            console.log(error);
        });
}

function createViz(){
    console.log("Using D3 v"+d3.version);
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    var rootG = svgEl.append("g").attr("id", "rootG");
    rootG.append("g").attr("id", "bkgG");
    loadData();    
};




