<?php
include 'config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}
$result = $mysqli->query("SELECT FlightDate, Year, Month,  Marketing_Airline_Network, CarrierDelay, WeatherDelay, NASDelay, SecurityDelay, LateAircraftDelay FROM `Flights` WHERE Year = 2018 AND Month=1 LIMIT 10000 ");

$Flights_causes = [];
while ($row = $result->fetch_assoc()) {
    $Flights_causes[] = $row;
}

echo json_encode($Flights_causes);

$mysqli->close();
?>