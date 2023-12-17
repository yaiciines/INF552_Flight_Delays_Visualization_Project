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

if(isset($_GET['cityName'])&& !empty($_GET['cityName'])){
    $city = htmlspecialchars($_GET['cityName']);
}

if(isset($_GET['stateName'])&& !empty($_GET['stateName'])){
    $state = htmlspecialchars($_GET['stateName']);
}

$result = $mysqli->query ("SELECT FlightDate, Month, Marketing_Airline_Network, ArrDelayMinutes, DepDelay, DepTime,CarrierDelay, LateAircraftDelay, WeatherDelay	,NASDelay,SecurityDelay, OriginCityName, OriginStateName, DestCityName, DestStateName FROM `Flights` WHERE ((OriginCityName = '".$city."' AND OriginStateName = '".$state."') OR (DestCityName = '".$city."' AND DestStateName = '".$state."')) AND Year = ".$year."");

$Flights_causes = [];
while ($row = $result->fetch_assoc()) {
    $Flights_causes[] = $row;
}

echo json_encode($Flights_causes);


$mysqli->close();
?>

