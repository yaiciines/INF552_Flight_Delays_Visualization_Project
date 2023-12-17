const ctx = {
    w: 820,
    h: 720,
    JITTER_W:50
};

const delayColumns = ['CarrierDelay', 'WeatherDelay', 'NASDelay', 'SecurityDelay', 'LateAircraftDelay'];

const color = d3.scaleOrdinal()
.domain(delayColumns)
.range(['#FF5733', '#33FF57', '#5733FF', '#FF33A6', '#A633FF']);


//==============================================================================================
function processDelayData(data) {
    const airlines = data.map(d => d.Marketing_Airline_Network);

    const countByAirline = {};
    const countWithDelays = {};

    airlines.forEach(airline => {
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

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Création de l'histogramme
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
        .attr("height", d => y(0) - y(d.percentage))

        .on("click", function(d) {
            if (d3.select(this).classed("highlighted")) {  // Vérifiez si l'élément est déjà en surbrillance
                unhighlight();
                d3.select(this).classed("highlighted", false);
            } else {
                d3.selectAll(".highlighted").classed("highlighted", false); // Retirez la surbrillance des autres éléments
                highlight(color(d.delay));
                d3.select(this).classed("highlighted", true);
            }
        })

    // Ajout des lignes d'incertitude
    const uncertaintyLines = svg.append("g")
        .selectAll("g")
        .data(delayColumns)
        .enter().append("g")
        .attr("stroke", "gray")
        .attr("stroke-width", 0.5)
        .selectAll("line")
        .data(d => percentages.map(p => ({ AIRLINE: p.AIRLINE, delay: d, percentage: p[d] })))
        .enter().append("line")
        .attr("x1", d => x(d.AIRLINE) + x.bandwidth() / delayColumns.length * delayColumns.indexOf(d.delay) + (x.bandwidth() / delayColumns.length) / 2)
        .attr("x2", d => x(d.AIRLINE) + x.bandwidth() / delayColumns.length * delayColumns.indexOf(d.delay) + (x.bandwidth() / delayColumns.length) / 2)
        .attr("y1", d => y(d.percentage + 2))  // +5% pour l'exemple
        .attr("y2", d => y(d.percentage - 2)); // -5% pour l'exemple

        const tickLength = 5; // définir la longueur des petites lignes horizontales

        uncertaintyLines.each(function(d) {
            const barWidth = d3.select(this).attr("width");
            const xCoord = parseFloat(d3.select(this).attr("x1")) + barWidth / 2;
            const y1Coord = d3.select(this).attr("y1");
            const y2Coord = d3.select(this).attr("y2");
            
            // Ajout de la ligne horizontale en haut
            d3.select(this.parentNode).append("line")
                .attr("x1", xCoord- tickLength / 2)
                .attr("x2", xCoord+ tickLength / 2)
                .attr("y1", y1Coord)
                .attr("y2", y1Coord)
                .attr("stroke", "gray")
                .attr("stroke-width", 0.5);
        
            // Ajout de la ligne horizontale en bas
            d3.select(this.parentNode).append("line")
                .attr("x1", xCoord- tickLength / 2)
                .attr("x2", xCoord+ tickLength / 2)
                .attr("y1", y2Coord)
                .attr("y2", y2Coord)
                .attr("stroke", "gray")
                .attr("stroke-width", 0.5);
        });
        
    // Ajout de la légende
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(delayColumns.slice().reverse())
        .enter().append("g")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", ctx.w - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", ctx.w - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

        // Ajout de la légende en haut à droite
        const legendSpacing = 10;
        const legendX = width - margin.right - 150; // Position ajustée pour la légende
        const legendY = margin.top;
    
        const legendData = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start") // Changement pour l'ancre du texte
            .selectAll("g")
            .data(delayColumns)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * legendSpacing})`);
    
        legendData.append("rect")
            .attr("x", legendX)
            .attr("y", (d, i) => legendY + i * legendSpacing)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color);
    
        legendData.append("text")
            .attr("x", legendX + 24)
            .attr("y", (d, i) => legendY + i * legendSpacing + 9.5)
            .attr("dy", "0.32em")
            .text(d => d);
    
        svg.append("g").call(xAxis);
        svg.append("g").call(yAxis);
    
        // Ajout du titre
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text("Distribution des retards par compagnie aérienne")

};

//==============================================================================================
function createPieChart(data) {

    // Calculer le total pour chaque type de retard
    const delayTotals = delayColumns.map(column => {
        return {
            type: column,
            value: data.reduce((acc, curr) => acc + (parseInt(curr[column]) || 0), 0)
        };
    });

    const totalDelays = delayTotals.reduce((acc, curr) => acc + curr.value, 0);

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;


    const pie = d3.pie()
        .value(d => d.value);

    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const svg = d3.select("#main").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const g = svg.selectAll(".arc")
        .data(pie(delayTotals))
        .enter().append("g")
        .attr("class", "arc");
    
    g.append("path")
        .attr("d", arc)
        .style("fill", d => d.data ? color(d.data.type) : "black")
        .on("click", function(d) {
            if (d3.select(this).classed("highlighted")) {  // Vérifiez si l'élément est déjà en surbrillance
                unhighlight();
                d3.select(this).classed("highlighted", false);
            } else {
                d3.selectAll(".highlighted").classed("highlighted", false); // Retirez la surbrillance des autres éléments
                highlight(color(d.data.type));
                d3.select(this).classed("highlighted", true);
            }
        })


    g.append("text")
        .attr("transform", d => "translate(" + arc.centroid(d) + ")")
        .attr("dy", ".35em")
        .text(d => `${((d.data.value / totalDelays) * 100).toFixed(2)}%`);


    const legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
}
//==============================================================================================

// Fonction pour mettre en évidence un élément
function highlight(selectedColor) {
    // Réduire l'opacité de tous les éléments sauf ceux qui ont la couleur sélectionnée

    d3.selectAll("rect")
        .style("opacity", d => color(d.delay) === selectedColor ? 1 : 0.3);

    d3.selectAll(".arc path")
        .style("opacity", d => color(d.data.type) === selectedColor ? 1 : 0.3);
}

// Fonction pour retirer l'effet de surbrillance
function unhighlight() {
    d3.selectAll("rect").style("opacity", 1);
    d3.selectAll(".arc path").style("opacity", 1);
}

//==============================================================================================
console.log("Using D3 v"+d3.version);
function loadData() {
    d3.json("causes_query.php")
        .then(function (Data) {
            console.log(`Nombre de lignes: ${Data.length}`);
            processDelayData(Data);
            createPieChart(Data);
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




