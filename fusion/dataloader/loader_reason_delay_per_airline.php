<?php
include '../config/config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}

if(isset($_GET['year'])&& !empty($_GET['year'])){
    $year = htmlspecialchars($_GET['year']);
}
else{
    $year = 2023;
}
$result = $mysqli->query("SELECT Marketing_Airline_Network, SUM(CarrierDelay) as CarrierDelay, SUM(WeatherDelay) as WeatherDelay, SUM(NASDelay) as NASDelay, SUM(SecurityDelay) as SecurityDelay, SUM(LateAircraftDelay) as LateAircraftDelay FROM Flights WHERE Year = ".$year." GROUP BY Marketing_Airline_Network");


$Flights_causes = [];
while ($row = $result->fetch_assoc()) {
    $Flights_causes[] = $row;
}

echo json_encode($Flights_causes);