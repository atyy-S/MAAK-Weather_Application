// JavaScriot for menu, api calls and geolocations)
// Toggle Menu
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
}


/* Geolocation + Weather API
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
  document.getElementById("city").innerText = "Geolocation not supported.";
}

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Call OpenWeatherMap API
  const apiKey = "customer-"; // Replace with your API key
  const url = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      document.getElementById("city").innerText = data.name;
      document.getElementById("weather").innerText = 
        `Temperature: ${data.main.temp}°C, ${data.weather[0].description}`;
    })
    .catch(error => {
      document.getElementById("weather").innerText = "Error fetching weather.";
    });
}

function showError() {
  document.getElementById("city").innerText = "Unable to retrieve location.";
}*/


