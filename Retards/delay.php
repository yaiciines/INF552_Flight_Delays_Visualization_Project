<?php
include 'config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}

if(isset($_GET['airline'])&& !empty($_GET['airline'])){
    $airline = $_GET['airline'];
}
else{
    $airline = 'AA';
}

if(isset($_GET['year'])&& !empty($_GET['year'])){
    $year = $_GET['year'];
}
else{
    $year = 2022;
}

if(isset($_GET['state']) && !empty($_GET['state'])){
    $state = $_GET['state'];
}
else{
    $state = 'CA';
}

if(isset($_GET['min_delay']) && !empty($_GET['min_delay'])){
    $min_delay = $_GET['min_delay'];
}
else{
    $min_delay = 0;
}

if(isset($_GET['max_delay']) && !empty($_GET['max_delay'])){
    $max_delay = $_GET['max_delay'];
}
else{
    $max_delay = 1000;
}

$result = $mysqli->query("SELECT Marketing_Airline_Network ,OriginCityName, OriginStateName, DestCityName, DestStateName, AVG(DepDelayMinutes) as AverageDelay FROM Flights WHERE Marketing_Airline_Network = '$airline' AND YEAR(FlightDate) = $year AND (OriginStateName = '$state' OR DestStateName = '$state') GROUP BY OriginCityName, OriginStateName, DestCityName, DestStateName HAVING  $min_delay <= AverageDelay  AND  AverageDelay<= $max_delay ");

if (!$result) {
    throw new Exception('Erreur : impossible d\'exécuter la requête');
}

$flights = [];
while ($row = $result->fetch_assoc()) {
    $flights[] = $row;
}

$result = $mysqli->query("SELECT * FROM Cities");
$Cities = [];
while ($row = $result->fetch_assoc()) {
    $Cities[] = $row;
}

$data[]= ['Flights'=>$flights, 'Cities'=>$Cities];
echo json_encode($data);
?>