<?php
session_start();

// Destroy all session data
$_SESSION = [];
session_unset();
session_destroy();

// Redirect back to homepage (forecast page)
header("Location: index.php");
exit();
