S<?php
session_start();
include 'includes/db_connection.php';

/*
 |------------------------------------------------------------
 |  AUTO-LOGIN USING REMEMBER ME COOKIE
 |------------------------------------------------------------
*/
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_user_id'])) {
    $uid = (int) $_COOKIE['remember_user_id'];
    $_SESSION['user_id'] = $uid;

    // Load username so we can greet the user
    $stmt = $conn->prepare("SELECT username FROM users WHERE id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $uid);
        $stmt->execute();
        $stmt->bind_result($username_from_db);
        if ($stmt->fetch()) {
            $_SESSION['username'] = $username_from_db;
        }
        $stmt->close();
    }
}

$isLoggedIn = isset($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather by G3</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Your CSS: use whatever file you’re actually using -->
    <!-- If your main styles are in assets/css/index.css, use that: -->
    <link rel="stylesheet" href="assets/css/index.css">
    <!-- If you still use style.css for weather layout, keep this too: -->
    <!-- <link rel="stylesheet" href="style.css"> -->
</head>

<body class="home-page">

<div id="mySidenav" class="sidenav">
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>

    <?php if ($isLoggedIn): ?>
        <p class="welcome-user">
            Hello, <?php echo htmlspecialchars($_SESSION['username'] ?? 'User'); ?> 👋
        </p>

        <!-- Link to SearchFavorites/search.php -->
        <a href="SearchFavorites/search.php">Search Location</a>

        <!-- Link to SearchFavorites/index.php (favorites list) -->
        <a href="SearchFavorites/index.php">Favorites</a>

        <!-- Logout link in root directory -->
        <a href="logout.php">Logout</a>

    <?php else: ?>

        <a href="SearchFavorites/search.php">Search Location</a>
        <a href="login.php">Login</a>
        <a href="register.php">Register</a>

    <?php endif; ?>
</div>


<!-- Hamburger Menu -->
<div id="main" style="text-align: right;">
    <span style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776;</span>
</div>

<!-- Main weather content -->
<div class="body" style="text-align: center;">
    <h2>My Location</h2>
    <h1 id="city">Fetching location...</h1>
    <h3 id="weather">Loading weather...</h3>

    <!-- Logged-in / Guest Message -->
    <main>
        <?php if ($isLoggedIn): ?>
            <h2>Welcome back, <?php echo htmlspecialchars($_SESSION['username'] ?? 'User'); ?>!</h2>
            <p>You are logged in. You can now search for weather and manage your favorite locations.</p>
        <?php else: ?>
            <h2>Welcome!</h2>
            <p>Please log in to save favorite locations and access all features.</p>
        <?php endif; ?>

        <p>Today's date: <?php echo date("Y-m-d"); ?></p>
    </main>
</div>

<!-- Weather position in web -->
<div class="showPosition" style="text-align:center; margin-top: 20px;">
    <button onclick="openForecast()">Show Forecast</button>
    <div id="forecast"></div>
    <div id="radar"></div>
</div>

<!-- Your JS -->
<!-- If your file is at /script.js in the project root, this is correct -->
<script src="assets/js/script.js"></script>
<!-- If you moved it into assets/js, use: -->
<!-- <script src="assets/js/script.js"></script> -->

</body>
</html>
