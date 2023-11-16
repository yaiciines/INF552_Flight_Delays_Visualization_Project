<?php
include 'config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}

if(isset($_GET['year'])&& !empty($_GET['year'])){
    $year = $_GET['year'];
}
else{
    $year = 2022;
}

if(isset($_GET['DepArr']) && !empty($_GET['DepArr'])){
    if ($_GET['DepArr'] == 'DepDelay'){
        $query = "SELECT OriginCityName, OriginStateName, AVG(Flights.DepDelay) as AverageDelay FROM Flights WHERE YEAR(Flights.FlightDate)=".$year." GROUP BY `OriginCityName`, `OriginStateName`";
    }
    else{
        $query = "SELECT DestCityName, DestStateName, AVG(Flights.ArrDelay) as AverageDelay FROM Flights WHERE YEAR(Flights.FlightDate)=".$year." GROUP BY `DestCityName`, `DestStateName`";
    }
}
else{
    $query = "SELECT OriginCityName, OriginStateName, AVG(Flights.DepDelay) as AverageDelay FROM Flights WHERE YEAR(Flights.FlightDate)=".$year." GROUP BY `OriginCityName`, `OriginStateName`";
}

$result = $mysqli->query($query);
if (!$result) {
    throw new Exception('Erreur : impossible d\'exécuter la requête');
}

$delay = [];
while ($row = $result->fetch_assoc()) {
    $delay[] = $row;
}

$result = $mysqli->query("SELECT * FROM Cities");
$Cities = [];
while ($row = $result->fetch_assoc()) {
    $Cities[] = $row;
}

$data[]= ['Delay'=>$delay, 'Cities'=>$Cities];
echo json_encode($data);
?>