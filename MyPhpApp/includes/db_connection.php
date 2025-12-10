<?php
$servername = "localhost";
$username = "root";
$password = ""; // or your MySQL password
$dbname = "db_connection";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
