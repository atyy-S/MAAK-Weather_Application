<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    // Not logged in → send them to login page
    header('Location: login.php');
    exit;
}
?>
<h1>Your Favorite Locations</h1>
<p>Only logged-in users can see this page.</p>