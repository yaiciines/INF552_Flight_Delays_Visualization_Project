<?php
include '../config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}
$result = $mysqli->query("SELECT id, Marketing_Airline_Network, DepDelay, ArrDelay FROM `Flights` WHERE Year = 2018  LIMIT 10000 ");

$Flights_delays= [];
while ($row = $result->fetch_assoc()) {
    $Flights_delays[] = $row;
}

echo json_encode($Flights_delays);

$mysqli->close();
?>