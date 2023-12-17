<?php
include 'config.php';

$mysqli = new mysqli($host, $user, $password, $database);
$mysqli->set_charset("utf8");

if ($mysqli->connect_error) {
    die('Erreur de connexion à la base de données : ' . $mysqli->connect_error);
}

$result = $mysqli->query("SELECT * FROM Airlines");
$Airlines = [];
while ($row = $result->fetch_assoc()) {
    $Airlines[] = $row;
}

$result = $mysqli->query("SELECT * FROM States");
$States = [];
while ($row = $result->fetch_assoc()) {
    $States[] = $row;
}

$data[] = ['Airlines'=>$Airlines, "States"=>$States]; // [Airlines, States]
echo json_encode($data);

$mysqli->close();
?>