<?php
session_start();
$isLoggedIn = isset($_SESSION['user_id']);
// search.php – Search locations and add to favorites
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather App – Search Location</title>
    <link rel="stylesheet" href="style.css">
</head>
<body data-page="search" data-logged-in="<?php echo $isLoggedIn ? '1' : '0'; ?>">
<div class="app-page">

    <button class="btn-primary" style="margin-bottom: 10px;" onclick="window.location.href='../index.php';">Home</button>

    <section class="panel">
        <h2>Search Location</h2>

        <div class="search-box">
            <input type="text" id="search-input"
                   placeholder="Search for location" autocomplete="off">
            <button id="clear-search" class="icon-btn" title="Clear search">&times;</button>
        </div>

        <ul id="search-results" class="list">
            <!-- search results rendered by JS -->
        </ul>

        <div id="search-message" class="panel-message"></div>
    </section>

</div>

<!-- add-favorite modal -->
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
</body>
</html>
