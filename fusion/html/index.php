

<!DOCTYPE html>
<html>
	<head>
    <meta charset="utf-8">
    <title>Carte des Aéroports</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script type="text/javascript" src="../libs/d3.v7.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="../libs/d3-geo-projection.V2.min.js"></script>
    <link href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet.css' rel='stylesheet' type='text/css'/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.5/leaflet-src.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega@5.25.0"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5.16.3"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6.22.2"></script>  
    <script src="../libs/L.D3SvgOverlay.min.js"></script>  <link rel="stylesheet" href="../src/main.css" type='text/css' />
    <link href="../src/main.css" type='text/css' />
    <meta charset="utf-8">
    
    <!-- Import of custom scripts -->
    <script src="../libs/legend_plot.js"></script>
    <script src="../js/map.js"></script> 
    <script src="../js/delayPerAirport.js"></script>
    <script src="../js/delayPerFlight.js"></script>
    <script src="../js/reasonsOfDelayPerCompagnie.js"></script>
    <script src="../js/airportDetails.js"></script>


    <!-- Main page -->
      
  </head>
	<body class="is-preload" onload="loadMap()">


		<!-- Header -->
    <header id="header">
      <a class="logo" href="index.php">XaÉro</a>
    </header>
    

		<!-- Highlights -->
		<section class="wrapper">
			<div class="inner">
        <div align="center">
          <button id="switchFlightAirport" onclick="switchFlightAirport()" class="small primary map"></button>
          <button id="switchMap" onclick="returnToMap()" class="small primary perAirport">Return to map view</button>
            <!-- Filter section --> 
          <form>
            <div class="perAirport">
                <br />
                <select name="year" id="year-select-perairport" class="perAirport">
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                </select>
            </div>
            <div class="column-break" class="map">
              <div class="column">
                <select name="year" id="year-select" class="map">
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                  <option value="2019">2019</option>
                  <option value="2018">2018</option>
                </select>
                <select class="map flight" name="airline" id="airline-select"></select>
                <select class="map flight" name="state" id="state-select"></select>
              </div>
              <div class="column">
                <select class="map airport" name="DepArr" id="sens-select">
                  <option value="DepDelay">On departure</option>
                  <option value="ArrDelay">On arrival</option>
                </select>
                <label class="map flight" for="min-delay">Min Delay:</label>
                <input class="map flight" type="text" id="min-delay-select" name="min-delay" value="5">
                <label class="map flight" for="max-delay">Max Delay:</label>
                <input class="map flight" type="text" id="max-delay-select" name="max-delay" value="100">
              </div>
            </div>
            <input class="map flight small" type="button" value="Submit" onclick="plotDelayPerFlight(); plotReasonDelayPerAirline()">
            <input class="map airport small" type="button" value="Submit" onclick="plotDelayPerAirport(); plotReasonDelayPerAirline()">
            <input class="perAirport small" type="button" value="Submit" onclick="loadPerAirportView()">
          </form>
        </div>
      <div id="mapview" class="map">
        <div class="column-break" style="display:flex;flex-wrap:unset;">
            <div class="column" style="flex:1;">
                <div id="mapid" style="width: 800px; height: 600px;"></div>
                <div id="legend_map_airport" class = "map airport" style="width:800px;"></div>
                <div id="legend_map_flight" class="map flight" style="width: 800px;"></div>
            </div>
            <div class="column" style="flex:1;">
                <div id="general_graph" class="map"></div>
            </div>
        </div>
      </div>
        <div id="graph" style="width: 800px; height: 600px; display: None" class="perAirport">
          
      </div>

          <!-- Loading gif -->
          <div id="loading-container" style="display:none;">
              <img id="loading-gif" src="../src/loading.gif" alt="Loading...">
          </div>
      </div>
    </section>
    <footer id="footer">
			<div class="inner">
				<div class="content">
					<section>
						<p>Made by Inès Yaici and Rémi Grzeczkowicz</p>
					</section>
        </div>
			</div>
		</footer>
  </body>
</html>