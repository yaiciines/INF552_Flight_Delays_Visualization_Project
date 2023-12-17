ctx.width_graph = 820;
ctx.height_graph = 720;
ctx.JITTER_W = 50;

function plotReasonDelayPerAirline(){
    let delayColumns = ['CarrierDelay', 'WeatherDelay', 'NASDelay', 'SecurityDelay', 'LateAircraftDelay'];

    //==============================================================================================
    function processDelayData(data) {
        let finalData = [];
        console.log(`Processing data`);
        data.forEach(airline => {
            let Marketing_Airline_Network_name = ctx.airlineDict[airline.Marketing_Airline_Network];
            for (let column of delayColumns) {
                finalData.push({"Marketing_Airline_Network_name": Marketing_Airline_Network_name, "delayType": column, "value": airline[column]});
            }
        });
        return finalData;
    };

    function plot_histo(data){
        let histo = {
            "schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "data": { "values": data },
            "mark": "bar",
            "encoding": {
              "x": {"field": "Marketing_Airline_Network_name", "type": "nominal", "title": "Airline"},
              "y": {"aggregate": "sum", "field": "value", "title": "Percentage of reason of delay","stack":  "normalize"},
              "color": {"field": "delayType", "type": "nominal"}
            }
        }

        vegaEmbed("#graphReasonsDelayPerAriline", histo, {actions: false});

    };

    //==============================================================================================

    function loadData() {
        let year = document.getElementById("year-select").value;
        d3.json("../dataloader/loader_reason_delay_per_airline.php?year="+year)
            .then(function (Data) {
                console.log(`Nombre de lignes: ${Data.length}`);
                let data = Data;
                data = processDelayData(Data);
                console.log(data)
                plot_histo(data)
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    d3.select("#general_graph").selectAll("*").remove();
    d3.select("#general_graph").append("div").attr("id", "graphReasonsDelayPerAriline");
    loadData();  
}