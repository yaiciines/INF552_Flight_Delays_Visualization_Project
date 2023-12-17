<?php
include '../config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}

$result = $mysqli->query("SELECT FlightDate, Year, Month,  Marketing_Airline_Network, CarrierDelay, WeatherDelay, NASDelay, SecurityDelay, LateAircraftDelay FROM `Flights` WHERE FlightDate = '2023-01-01' ");

$Flights_causes = [];
while ($row = $result->fetch_assoc()) {
    $Flights_causes[] = $row;
}

echo json_encode($Flights_causes);

/*$limit = 1000; // Nombre de lignes par batch
$offset = 0; // Début de la pagination
$Flights_causes = [];

do {
    error_log("Début du batch à l'offset $offset");

    $query = "SELECT FlightDate, Year, Month, Marketing_Airline_Network, CarrierDelay, WeatherDelay, NASDelay, SecurityDelay, LateAircraftDelay FROM `Flights` ORDER BY FlightDate ASC LIMIT $limit OFFSET $offset";
    $result = $mysqli->query($query);

    $batch = [];
    while ($row = $result->fetch_assoc()) {
        $batch[] = $row;
    }

    $Flights_causes = array_merge($Flights_causes, $batch);
    $offset += $limit;
    error_log("Fin du batch à l'offset $offset");

} while (count($batch) < 2000);

echo json_encode($Flights_causes);*/

$mysqli->close();
?>

