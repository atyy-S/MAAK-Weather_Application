<?php
session_start();
$isLoggedIn = isset($_SESSION['user_id']);
// index.php – Favorites list
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather App – Favorites</title>
    <link rel="stylesheet" href="../assets/css/index.css">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body data-page="favorites" data-logged-in="<?php echo $isLoggedIn ? '1' : '0'; ?>">
<div class="app-page">

    <!-- Side Navigation -->
<div id="mySidenav" class="sidenav">
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>

    <?php if ($isLoggedIn): ?>
        <p class="welcome-user">
            Hello, <?php echo htmlspecialchars($_SESSION['username'] ?? 'User'); ?> 👋
        </p>
        <a href="../index.php"><i class="fa-solid fa-house"></i>Home</a>
        <!-- Go to SearchFavorites/search.php -->
        <a href="search.php"><i class="fas fa-search"></i> Search Location</a>
        <!-- Go to SearchFavorites/index.php (Favorites list UI) -->
      
        <a href="../logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a>
    <?php else: ?>
        <a href="../index.php">Home</a>
        <!-- Guests can still use search, but can't save favorites -->
        <a href="search.php"><i class="fas fa-search"></i> Search Location</a>
        <a href="../login.php"><i class="fas fa-user"></i> Login</a>
    <?php endif; ?>
</div>

<!-- Hamburger Menu -->
<div id="main" class="body" style="text-align: right; margin-bottom: 15px;">
    <span style="font-size:30px;cursor:pointer;color:white;" onclick="openNav()">&#9776;</span>
</div>

    <section class="panel">
        <h2>Favorites</h2>

        <ul id="favorites-list" class="list">
            <!-- favorites rendered by JS -->
        </ul>

        <button id="add-location-btn" class="add-location-btn">
            + Add Location
        </button>

        <div id="favorites-message" class="panel-message"></div>
    </section>

</div>

<!-- remove-favorite modal -->
<div id="modal-overlay" class="modal-overlay hidden">
    <div class="modal">
        <p id="modal-text"></p>
        <div class="modal-actions">
            <button id="modal-cancel" class="btn-secondary">Cancel</button>
            <button id="modal-confirm" class="btn-primary">Confirm</button>
        </div>
    </div>
</div>

<script src="script.js"></script>
<script>
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
</script>
<footer class="site-footer">
    <p>&copy; <?php echo date('Y'); ?> Weather by G3 — All Rights Reserved</p>
    <p>Today's Date: <?php echo date('F j, Y'); ?></p>
</footer>
</body>
</html>
