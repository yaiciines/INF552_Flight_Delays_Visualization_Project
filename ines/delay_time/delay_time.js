const ctx = {
    w: 820,
    h: 720,
    JITTER_W:50,
    selectedVar: 'WeatherDelay'
};
//==============================================================================================
function createHistogram(filteredFlights){
    if (filteredFlights.length === 0) {
        console.log("No flight data available for histogram");
        return;
    }
    const vlHist = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Histogram of Plane Altitudes",
        "data": { "values": filteredFlights },
        "transform": [
            {}
        ],
        "params": [
            {
              "name": "highlight",
              "select": {"type": "point", "on": "pointerover"}
            },
            {"name": "select", "select": "point"}
        ],
        "vconcat": [
                {
                    "mark": "bar",
                    "encoding": {
                        "y": {
                        "field": "Marketing_Airline_Network",
                        "type": "ordinal",
                        "sort": "-x",
                        
                        },

                        "x": {
                        "aggregate": "average",
                        "field": "ArrDelayMinutes",
                        "title": "Delay (minutes)",

                        },
                        "color": {
                            "field": "ArrDelayMinutes",
                            "type": "quantitative",
                            "scale": {"scheme": "blues"},
                            "legend": {"title": "Number of flights having that delay"}
                        }
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

                        "x": {"field": "Marketing_Airline_Network", "type": "ordinal"},

                        "y": {  
                            "aggregate": "count",
                            "type": "quantitative",
                            "title": "Number of flights"
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
                }
                        
        ],
                            
        "config": {
            "scale": {
            "bandPaddingInner": 0.2
            }
        }
    };
    const vlOpts = { "width": 100, "height": 600, "actions": false };
    vegaEmbed("#hist", vlHist, vlOpts);

};


function createGraphics(filteredFlights) {

    // filter flghts with no delay and delay < 600 minutes
    filteredFlights = filteredFlights.filter(function (d) {
        return d.ArrDelayMinutes > 15 && d.ArrDelayMinutes < 400;
    });

    if (filteredFlights.length === 0) {
        console.log("No flight data available for histogram");
        return;
    }
    const vlHist = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Plot showing a 30 day rolling average with raw values in the background.",
        "width": 400,
        "height": 300,
        "data": { "values": filteredFlights },
        "transform": [{
          "window": [
            {
              "field": "ArrDelayMinutes",
              "op": "mean",
              "as": "rolling_mean"
            }
          ],
          "frame": [-2000, 2000],

        }],
        "encoding": {
          "x": {"field": "DepTime", "type": "temporal", "title": "Hours"},

          "y": {"type": "quantitative", "axis": {"title": "DepDelay and Rolling Mean"}}
        },
        "layer": [
          {
            "mark": {"type": "point", "opacity": 0.3},
            "encoding": {
              "y": {"field": "ArrDelayMinutes", "title": "Delay"}
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
    const vlOpts = { "width": 1000, "height": 300, "actions": false };
    vegaEmbed("#graphs", vlHist, vlOpts);

}

function createLast(filteredFlights){
    if (filteredFlights.length === 0) {
        console.log("No flight data available for histogram");
        return;
    }
    const vlHist ={
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": { "values": filteredFlights },
        "width": 600,
        "height": 400,

        "mark": {
          "type": "circle",
          "opacity": 0.8,
          "stroke": "black",
          "strokeWidth": 1
        },
        "encoding": {
          "x": {
            "field": "Month",
            "type": "temporal",
            "axis": {"grid": false}
          },
          "y": {"field": "delay_cause", "type": "nominal", "axis": {"title": ""}},
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
      const vlOpts = { "width": 100, "height": 600, "actions": false };
      vegaEmbed("#last", vlHist, vlOpts);
      
}
//==============================================================================================

function loadData() {
    d3.json("./time_query.php")
        .then(function (Data) {
            console.log(`Nombre de lignes: ${Data.length}`);

            console.log( Data);
            createHistogram(Data);
            createGraphics(Data);

            // Add delay_cause attribute
            Data.forEach(function(d) {
                let delays = {
                    'Airline delay': parseInt(d.CarrierDelay),
                    'Late Aircraft': parseInt(d.LateAircraftDelay),
                    'National Air System': parseInt(d.NASDelay),
                    'Security': parseInt(d.SecurityDelay),
                    'Weather': parseInt(d.WeatherDelay)

                };
                d.airline_network_name = ctx.a

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
                d.delay_cause = maxDelay > 0 ? maxDelayCause : '';
            });

            console.log(Data);

            createLast(Data);

        })
        .catch(function (error) {
            console.log(error);
        });
}

function createViz(){
    loadData();    
};




