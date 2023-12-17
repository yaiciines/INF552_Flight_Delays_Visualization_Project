
<?php
// Database configuration
$host="gr3z.eu";
$user="x9p31ij2_ines";
$password="LNd&HobOGQN_";
$database="x9p31ij2_inf552";

// Attempt to connect to MySQL database
$mysqli = new mysqli($host, $user, $password, $database);

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
} else {
    echo "Connected successfully";
}
//<?php
//echo "PHP is working!";
//?>

$mysqli->close();
?>
