<?php
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
    <meta name="referrer" content="no-referrer">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="assets/css/index.css">
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
   
<!--<body class="home-page">-->
<body>

<!-- Side Navigation -->
<div id="mySidenav" class="sidenav">
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>

    <?php if ($isLoggedIn): ?>
        <p class="welcome-user">
            Hello, <?php echo htmlspecialchars($_SESSION['username'] ?? 'User'); ?> 👋
        </p>
        <!-- Go to SearchFavorites/search.php -->
        <a href="SearchFavorites/search.php"><i class="fas fa-search"></i> Search Location</a>
        <!-- Go to SearchFavorites/index.php (Favorites list UI) -->
        <a href="SearchFavorites/index.php"><i class="fas fa-star"></i> Favorites</a>
        <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
    <?php else: ?>
        <!-- Guests can still use search, but can't save favorites -->
        <a href="SearchFavorites/search.php"><i class="fas fa-search"></i> Search Location</a>
        <a href="login.php"><i class="fas fa-user"></i> Login</a>
    <?php endif; ?>
</div>


<!-- Menu -->
<div id="main" >
  <span class="menu-btn" onclick="openNav()">&#9776; </span>
</div>

<!--Weather Content Section: Displays current weather information for the user's location-->
<div class="weather-container">
    <div class="weather-panel">
    <h2><i class="fas fa-map-marker-alt"></i> My Location</h2>
    <h1 id="city">Fetching location...</h1>
    <div class="current-weather">
        <div id="weather" class="temperature-large" >Loading weather...</div>
        <div id="condition" class="weather-condition" >--</div>
       
    </div>
    </div>
</div>

<!-- Forecast & Radar Section: Container for extended weather features-->
<div class="forecast-radar-container">

    <!-- Left side: 10-Day Forecast -->
    <div class="forecast-panel">
        <div class="panel-header">
            <h3><i class="fas fa-calendar-alt"></i> 10-Day Forecast</h3>
        </div>
        <div class="forecast-list" id="forecastList">
        </div>
    </div>

    <!-- Right side: Weather Radar -->
     <div class="radar-panel">
        <div class="panel-header">
            <h3><i class="fas fa-satellite"></i> Weather Radar</h3>
            <button class="radar-refresh-btn" onclick="refreshRadar()">
                <i class="fas fa-sync-alt"></i> Refresh</button>
            </div>
            <div class="radar-container">
                <div class="radar-placeholder" id="radarPlaceholder">
                    <!-- The radar image -->
                    <div class="radar-image-container" id="radarImageContainer">
                        <img id="radarImage" src="" alt="Weather Radar" 
                        style="width:100%; height:100%; border-radius:15px; display:none;">
                        <div class="radar-fallback">
                            <div class="radar-animation">
                                <div class="radar-circle"></div>
                                <div class="radar-sweep"></div>
                            </div>
                            <p>Loading radar...</p>
                        </div>
                    </div>
                    <p id="radarStationText" style="display:none;"></p>
                    <p>Radar for <span id="radarLocation">your location</span></p>
                    <p class="radar-update">Last updated: <span id="radarTime">--:-- --</span></p>
                </div>
                <div class="radar-legend">
                    <div class="legend-item"><span class="color-box light"></span> Light</div>
                    <div class="legend-item"><span class="color-box moderate"></span> Moderate</div>
                    <div class="legend-item"><span class="color-box heavy"></span> Heavy</div>
                    <div class="legend-item"><span class="color-box snow"></span> Snow</div>
                </div>
            </div>
        </div>
    </div>
   <!-- Your JS -->
<!-- If your file is at /script.js in the project root, this is correct -->
<script src="assets/js/script.js"></script>
</body>
</html>

