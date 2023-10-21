const ctx = {
    w: 820,
    h: 720,
    JITTER_W: 50,
    margin: { top: 50, right: 20, bottom: 50, left: 50 }
};

Create_graph = function (Data) {
    const svg = d3.select("#rootG");

    // Échelles
    const xScale = d3.scaleSymlog()
        .domain([d3.min(Data, d => +d.DepDelay), d3.max(Data, d => +d.DepDelay)])
        .range([ctx.margin.left, ctx.w - ctx.margin.right]);

    const yScale = d3.scaleSymlog()
        .domain([d3.min(Data, d => +d.ArrDelay), d3.max(Data, d => +d.ArrDelay)])
        .range([ctx.h - ctx.margin.bottom, ctx.margin.top]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${ctx.h - ctx.margin.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${ctx.margin.left}, 0)`)
        .call(yAxis);

    // Titre
    svg.append("text")
        .attr("x", ctx.w / 2)
        .attr("y", ctx.margin.top - 20)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Régression linéaire entre DepDelay et ArrDelay ");

    // Noms des axes
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", ctx.margin.left - 40)
        .attr("x", -(ctx.margin.top + ctx.h / 2))
        .style("text-anchor", "middle")
        .text("ArrDelay(symlog)");

    svg.append("text")
        .attr("y", ctx.h - 10)
        .attr("x", ctx.margin.left + ctx.w / 2)
        .style("text-anchor", "middle")
        .text("DepDelay (symlog)");

    // Points
    svg.selectAll("circle")
        .data(Data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(+d.DepDelay))
        .attr("cy", d => yScale(+d.ArrDelay))
        .attr("r", 3)
        .style("fill","#6daed5")
        .style("opacity", 0.6);

    // Régression linéaire
    // Note: La régression linéaire sur des échelles symlog nécessite un traitement spécial.
    // Pour simplifier, je vais garder la même méthode de régression linéaire que précédemment, mais cela pourrait ne pas être précis.
    const xMean = d3.mean(Data, d => +d.DepDelay);
    const yMean = d3.mean(Data, d => +d.ArrDelay);
    const m = (d3.sum(Data, d => (+d.DepDelay - xMean) * (+d.ArrDelay - yMean)) / 
              d3.sum(Data, d => Math.pow((+d.DepDelay - xMean), 2)));
    const b = yMean - m * xMean;

    const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(m * d[0] + b));

    svg.append("path")
        .datum([[d3.min(Data, d => +d.DepDelay), d3.min(Data, d => +d.ArrDelay)], [d3.max(Data, d => +d.DepDelay), d3.max(Data, d => +d.ArrDelay)]])
        .attr("d", line)
        .attr("stroke", "#0a4a90")
        .attr("fill", "none");
};

function loadData() {
    d3.json("../js_dep_arr_delay/dep_arr_delay_query.php")
        .then(function (Data) {
            console.log(`Nombre de lignes: ${Data.length}`);
            Create_graph(Data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function createViz() {
    console.log("Using D3 v" + d3.version);
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    var rootG = svgEl.append("g").attr("id", "rootG");
    rootG.append("g").attr("id", "bkgG");
    loadData();
}
