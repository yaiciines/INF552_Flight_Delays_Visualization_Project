<?php
include '../config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}

$result = $mysqli->query ("SELECT FlightDate, Month, Marketing_Airline_Network, ArrDelayMinutes, DepTime,CarrierDelay ,WeatherDelay	,NASDelay,SecurityDelay		 FROM `Flights` WHERE FlightDate = '2023-01-01' ");

$Flights_causes = [];
while ($row = $result->fetch_assoc()) {
    $Flights_causes[] = $row;
}

echo json_encode($Flights_causes);


$mysqli->close();
?>

