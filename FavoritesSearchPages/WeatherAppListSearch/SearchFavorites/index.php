<?php
// index.php – Favorites list
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather App – Favorites</title>
    <link rel="stylesheet" href="style.css">
</head>
<body data-page="favorites">
<div class="app-page">

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
</body>
</html>
