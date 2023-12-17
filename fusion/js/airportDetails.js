function loadPerAirportView(){
    console.log(ctx)
    let airport = ctx.filter[0];
    console.log("Print view for airport "+airport.AIRPORT);
    d3.select("#graph").selectAll("*").remove();
    let div = d3.select("#graph")
    div.attr("align", "center");
    div.append("p").attr("id","airportName").attr("class", "perAirport").attr("style","text-align: center; font-size: 30px; font-weight: bold;").text(airport.AIRPORT +", "+ airport.CityCode);
    div.append("div").attr("id","main").attr("class", "perAirport");
    div.append("div").attr("id","hist").attr("class", "perAirport");
    div.append("div").attr("id","matrix").attr("class", "perAirport").attr("style","max-width: 1000px; overflow: scroll;");
    div.append("div").attr("id","graphs").attr("class", "perAirport");
    div.append("div").attr("id","last").attr("class", "perAirport");
    div.append('div').attr('id', "hist_delay").attr("class", "perAirport");
    
    loadData(airport);
    
}

function createHistogram(filteredFlights){
    if (filteredFlights.length === 0) {
        console.log("No flight data available for histogram");
        return;
    }
    let vlHist = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Histogram of Plane Altitudes",
        "data": { "values": filteredFlights },
        "params": [
            {
              "name": "highlight",
              "select": {"type": "point", "on": "pointerover"}
            },
            {"name": "select", "select": "point"},
        ],
        "hconcat": [
            // {
            // "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
            // "data": {"values": filteredFlights},
            // "transform": [{"groupby": ["airline_network_name"]}],
            // "layer": [
            //     {
            //     "mark": "area",
            //     "encoding": {
            //         "x": {"field": "airline_network_name", "type": "ordinal"},
            //         "y": {"field": "ArrDelayMinutes", "type": "quantitative"},
            //         "y2": {"field": "bin_mid"}
            //     }
            //     },
            //     {
            //     "mark": "point",
            //     "encoding": {
            //         "x": {"field": "airline_network_name", "type": "ordinal"},
            //         "y": {"field": "ArrDelayMinutes", "type": "quantitative"}
            //     }
            //     }
            // ]
            // },
              ///ancien histogramme
                {
                    "mark": "bar",
                    "encoding": {
                        "x": {
                        "field": "ArrDelayMinutes",
                        "type": "quantitative",
                        "sort": "x",
                        "title": "Delay (minutes)",
                        },
                        "y": {
                            "field": "airline_network_name",
                            "title": "Airline",
                            "type": "ordinal",                        
                        },
                        "color": {
                            "field": "ArrDelayMinutes",
                            "type": "quantitative",
                            "scale": {"scheme": "viridis"},
                            "legend": {"title": "Number of flights having that delay"}
                        },
                        "tooltip": [
                            {"field": "ArrDelayMinutes", "type": "quantitative", "title": "Delay (minutes)"},
                            {"field": "airline_network_name", "type": "ordinal", "title": "Airline"},
                            {"field": "__count", "type": "quantitative", "title": "Number of flights"},
                        ],
                    }
                },
                {
                    "mark": {
                        "type": "bar",
                        "fill": "#4C78A8",
                        "stroke": "black",
                        "cursor": "pointer"
                      },
                    "encoding": {

                        "x": {  
                            "aggregate": "count",
                            "type": "quantitative",
                            "title": "Number of flights"
                        },
                        "tooltip": {"field": "__count", "type": "ordinal"},
                        "y": {
                            "field": "airline_network_name",
                            "title": "",
                            "type": "ordinal",                        
                        },
                        "fillOpacity": {
                        "condition": {"param": "select", "value": 1},
                        "value": 0.3
                        },

                        "strokeWidth": {
                        "condition": [
                            {
                            "param": "select",
                            "empty": false,
                            "value": 2
                            },
                            {
                            "param": "highlight",
                            "empty": false,
                            "value": 1
                            }
                        ],
                        "value": 0
                        }
                    },
                },      
        ],
        "config": {
            "scale": {
            "y":"shared",
            "bandPaddingInner": 0.2
            }
        }
    };
    let vlOpts = { "actions": false };
    vegaEmbed("#hist", vlHist,{ "actions": false });

};

function createDestinationMatrix(filteredFlights){
  let matrix = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Plot the average arrival delay per airline and destination",
    "data": { "values": filteredFlights },
    "transform": [
      {
        "filter": {
          "field": "OriginCityName",
          "equal": ctx.filter[0].CityName
        },
        "filter": {
          "field": "OriginStateName",
          "equal": ctx.filter[0].StateCode
        }
      },
      {
        "calculate": "datum.DestCityName + ', ' + datum.DestStateName",
        "as": "Destination"
      }
    ],
    "mark": {
      "type": "rect"
    },
    "encoding": {
      "x": {
        "field": "Destination",
        "type": "nominal",
        "sort": "x"
      },
      "y": {
        "field": "airline_network_name",
        "title": "",
        "type": "nominal"
      },
      "tooltip": [
        {
          "field": "mean_ArrDelayMinutes",
          "type": "quantitative",
          "title": "Average arrival delay (minutes)"
        },
        {
          "field": "airline_network_name",
          "type": "nominal",
          "title": "Airline",
        }
      ],
      "color": {
        "aggregate": "mean",
        "field": "ArrDelayMinutes",
        "type": "quantitative",
        "title": "Average arrival delay (minutes)"
      }
    },
    "config": {
      "view": {
        "stroke": "transparent",
        "pan": {"x": true} // Enable panning on the x-axis
      }
    }
  }
  

  let vlOpts = {"width": 1000,"actions": false };
  vegaEmbed("#matrix", matrix, vlOpts);
}

function createGraphics(filteredFlights) {

    // filter flghts with no delay and delay < 600 minutes
    filteredFlights = filteredFlights.filter(function (d) {
        return d.ArrDelayMinutes > 15 && d.ArrDelayMinutes < 400;
    });

    if (filteredFlights.length === 0) {
        console.log("No flight data available for histogram");
        return;
    }
    let vlHist = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Plot showing a 30 day rolling average with raw values in the background.",
        "width": 400,
        "height": 300,
        "data": { "values": filteredFlights },
        "transform": [{
          "window": [
            {
              "field": "DepDelay",
              "op": "mean",
              "as": "rolling_mean"
            }
          ],
          "frame": [-2000, 2000],

        }],
        "encoding": {
          "x": {"field": "DepTime", "type": "temporal", "title": "Hours"},

          "y": {"type": "quantitative", "axis": {"title": "On departure delay (min) and Rolling Mean (red)"}}
        },
        "layer": [
          {
            "mark": {"type": "point", "opacity": 0.3},
            "encoding": {
              "y": {"field": "DepDelay", "title": "Delay"}
            }
          },
          {
            "mark": {"type": "line", "color": "red", "size": 3},
            "encoding": {
              "y": {"field": "rolling_mean", "title": "Rolling Mean of Delay"}
            }
          }
        ]
      }
    let vlOpts = { "width": 1000, "height": 300, "actions": false };
    vegaEmbed("#graphs", vlHist, vlOpts);

}

function createLast(filteredFlights){
    console.log("create last")
    console.log(filteredFlights)
    if (filteredFlights.length === 0) {
        console.log("No flight data available for histogram");
        return;
    }
    let vlHist ={
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": { "values": filteredFlights },
        "width": 600,
        "height": 400,
        "mark": {
          "type": "circle",
          "opacity": 0.8,
          "stroke": "black",
          "strokeWidth": 1,
          //"tooltip": {"content": "data"}
        },
        "encoding": {
          "x": {
            "field": "month",
            "type": "temporal",
            "timeUnit": "month",
            "scale": {"padding": 10},
            "axis": {"grid": false}
          },
          "y": {"field": "delay_cause", "type": "nominal", "axis": {"title": ""}},
          "tooltip": {"field": "__count", "type": "quantitative"},
          /*"size": {
            "field": "Deaths",
            "type": "quantitative",
            "title": "Annual Global Deaths",
            "legend": {"clipHeight": 30},
            "scale": {"rangeMax": 5000}
          },*/
          "size": {
            "aggregate": "count", // Count the number of records for each delay cause per month
            "type": "quantitative",
            "title": "Number of Delays"
          },
          "color": {"field": "delay_cause", "type": "nominal", "legend": null}
        }
      }
      let vlOpts = { "width": 300, "height": 500, "actions": false};
      vegaEmbed("#last", vlHist, vlOpts);
      
}
//==============================================================================================

function loadData(airport) {
    let year = document.getElementById("year-select-perairport").value;
    let month_list = [null, "January", "February", "March", "April", "May", "June", "July", "August", "September","October","November","December"]
    d3.select("#loading-container").transition().attr("style", "display: yes;");
    url = "../dataloader/loader_per_airport_view.php?year="+year+"&cityName="+airport.CityName+"&stateName="+airport.StateCode;
    d3.json(url)
        .then(function (Data) {
            console.log(`Nombre de lignes: ${Data.length}`);

            console.log( Data);
            createHistogram(Data);
            createGraphics(Data);
            createDestinationMatrix(Data);

            // Add delay_cause attribute
            Data.forEach(function(d) {
                let delays = {
                    'Carrier delay': parseInt(d.CarrierDelay),
                    'Late Aircraft': parseInt(d.LateAircraftDelay),
                    'National Air System': parseInt(d.NASDelay),
                    'Security': parseInt(d.SecurityDelay),
                    'Weather': parseInt(d.WeatherDelay)

                };
                d.airline_network_name = ctx.airlineDict[d.Marketing_Airline_Network];
                d.month = new Date(0, parseInt(d.Month)-1);
                // Find the maximum delay cause
                let maxDelay = 0;
                let maxDelayCause = '';
                for (let cause in delays) {
                    if (delays[cause] > maxDelay) {
                        maxDelay = delays[cause];
                        maxDelayCause = cause;
                    }
                }

                // Assign delay cause or empty string if no delay
                d.delay_cause = maxDelay > 0 ? maxDelayCause : 'No delay';
            });

            console.log(Data);

            createLast(Data);
            plot_histo_delay(Data);
            d3.select("#loading-container").transition().attr("style", "display: none;");

        })
        .catch(function (error) {
            console.log(error);
        });
}


function plot_histo_delay(Data){
    console.log("plot histo delay")

    let finalData = [];
    let delayColumns = ['CarrierDelay', 'WeatherDelay', 'NASDelay', 'SecurityDelay', 'LateAircraftDelay'];
    let sum_delay = {};

    Data.forEach(flight => {
        for(let column of delayColumns){
            if (sum_delay[flight.airline_network_name] === undefined){
                sum_delay[flight.airline_network_name] = parseFloat(flight[column]);
            }
            else{
                sum_delay[flight.airline_network_name] += parseFloat(flight[column]);
            }
        }
    });

    Data.forEach(flight => {
        for (let column of delayColumns) {
           flight[column] = parseFloat(flight[column])/sum_delay[flight.airline_network_name];
        }   
    });

    

    let histo = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "params": [
          {
            "name": "delaySelection",
            "value": "CarrierDelay",
            "title": "Delay Type",
            "bind": {"input": "select", "options": delayColumns}
          }
        ],
        "data": {
          "values": Data
        },
        "transform": [
            {
                "calculate": "datum[delaySelection]",
                "as": "y"
              }
        ],
        "mark": "bar",
        "encoding": {
          "x": {"field": "airline_network_name", "type": "nominal", "title": "Airline"},
          "y": {
            "field": "y",
            "type": "quantitative",
            "aggregate": "sum", 
            "title": "Percentage of reason of delay in term of time",
          }
        }
    }  
    let vlOpts = { "width": 300, "height": 350, "actions": false };
    vegaEmbed("#hist_delay", histo, vlOpts, {actions: false});
}