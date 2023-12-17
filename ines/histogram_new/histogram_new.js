const ctx = {
    w: 820,
    h: 720,
    JITTER_W:50,
    selectedVar: 'WeatherDelay'
};
var data = [];
let x, y;

const delayColumns = ['CarrierDelay', 'WeatherDelay', 'NASDelay', 'SecurityDelay', 'LateAircraftDelay'];
const colorScale = d3.scaleOrdinal(d3.schemeAccent)
    .domain(delayColumns);
 


const airlines = [];
const uniqueAirlines = new Set();
const countByAirline = {};
const countWithDelays = {};
let glo_percentages;
const margin = { top: 30, right: 200, bottom: 70, left: 60};


function createLegend(svg) {
    const legendSpacing = 20; // Espace entre les éléments de la légende
    const legendSize = 10; // Taille du carré de couleur dans la légende
    const legendPosX = ctx.w - margin.right; // Position X de la légende
    const legendPosY = margin.top; // Position Y de départ de la légende

    // Créer un groupe pour chaque élément de la légende
    const legend = svg.selectAll(".legend")
        .data(delayColumns)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * legendSpacing + ")");

    // Ajouter un carré coloré à chaque élément de la légende
    legend.append("rect")
        .attr("x", legendPosX)
        .attr("y", legendPosY)
        .attr("width", legendSize)
        .attr("height", legendSize)
        .style("fill", colorScale);

    // Ajouter le texte à côté de chaque carré
    legend.append("text")
        .attr("x", legendPosX + legendSize + 5)
        .attr("y", legendPosY + legendSize)
        .text(d => d)
        .attr("text-anchor", "start")
        .style("alignment-baseline", "middle");
}

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

    const stackedData = [];
    uniqueAirlines.forEach(airline => {
        let cumulativePercentage = 0;
        const airlineData = { AIRLINE: airline };
        delayColumns.forEach(column => {
            airlineData[column] = cumulativePercentage;
            const delayCount = countByAirline[airline][column] || 0;
            const totalDelays = countWithDelays[airline] || 1; // Éviter la division par zéro
            cumulativePercentage += (delayCount / totalDelays) * 100;
            airlineData[column + '_end'] = cumulativePercentage;
        });
        stackedData.push(airlineData);
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

    delayColumns.forEach((column, index) => {
            svg.selectAll(".bar-group-" + index)
                .data(stackedData)
                .enter().append("rect")
                .attr("x", d => x(d.AIRLINE))
                .attr("y", d => y(d[column + '_end']))
                .attr("height", d => y(d[column]) - y(d[column + '_end']))
                .attr("width", x.bandwidth())
                .attr("fill", colorScale(column)); // Utiliser une échelle de couleurs pour différencier les causes
        });
    createLegend(svg);


    return percentages;
    

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




