<?php
// forecast.php – display forecast for a selected location
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather App – Forecast</title>
    <link rel="stylesheet" href="style.css">
</head>
<body data-page="forecast">
<div class="app-page">

    <section class="panel">
        <h2 id="forecast-title">Forecast</h2>

        <div id="forecast-content" class="forecast-content">
            <!-- forecast rendered by JS -->
        </div>

        <button id="back-from-forecast" class="back-btn">
            ← Back to Favorites
        </button>
    </section>

</div>

<script src="script.js"></script>
</body>
</html>
