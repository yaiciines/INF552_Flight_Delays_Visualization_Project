function plotDelayPerAirport(){
    if (ctx.airportMode && ctx.mapMode){
        let year = document.getElementById("year-select").value;
        let sens = document.getElementById("sens-select").value;
        ctx.sens = sens;

        console.log("Loading data with params : "+year+" "+sens);
        let url = `../dataloader/loader_delay_per_airport.php?year=${year}&DepArr=${sens}`;

        d3.select("#loading-container").transition().attr("style", "display: yes;");
        d3.json(url, function(error, collection){
            if (error) throw error;
        }).then(function(collection) {
            let Delay = collection[0].Delay;
            console.log(Delay);
            let extrem = d3.max(Delay, function(d) { return Math.abs(d.AverageDelay); })
            ctx.airportScale = d3.scaleDivergingSymlog([-extrem,0,extrem],["green", "white","red"]);
            
            d3.select("#airport_group").selectAll("circle")
            .transition()
            .attr("fill", function(d){
                //Recovers the associated delay
                let delay = Delay.find(function(element) {
                    if(ctx.sens == "DepDelay"){
                        return d.CityCode == element.OriginCityName + ", " +element.OriginStateName;
                    }
                    else{
                        return d.CityCode == element.DestCityName + ", " + element.DestStateName;
                    }            
                });
                d.delay = delay
                if (delay == undefined){
                    return "lightgrey";
                }
                return ctx.airportScale(delay.AverageDelay);
            })
            .select("title")
            .text(function(d) { 
                if (d.delay == undefined){
                    return d.AIRPORT + " | No delay data";
                }
                return d.AIRPORT + " | Average delay: " + parseFloat(d.delay.AverageDelay).toFixed(2).toString() + " minutes";
            });
            
        }).then(function(){
            //Stop loading animation
            d3.select("#loading-container").transition().attr("style", "display: none;");
            plotLegendDelayPerAirport();
        });
    }
};

function colorlegend(t){
    return d3.interpolateRdYlGn(-t)
}

function plotLegendDelayPerAirport(){
    let title;
    document.getElementById("legend_map_airport").innerHTML = "";
    if (ctx.sens == "DepDelay"){
            title = "Average departure delay (minutes)";
        }
        else{
            title = "Average arrival delay (minutes)";
        }

    let svg = Legend(ctx.airportScale, {
        title: title,
        ticks: 6,
        width:500
      })
    document.getElementById("legend_map_airport").appendChild(svg);
}