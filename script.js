// JavaScript for menu, API calls, and geolocation

// Toggle Menu
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}

/*forecaset*/
function openForecast() {
  document.querySelector(".showPosition").style.width = "300px";
}
function closeForecast() {
  document.querySelector(".showPosition").style.width = "0";
}


/* Geolocation + Weather API */
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
  document.getElementById("city").innerText = "Geolocation not supported.";
}
function openForecast() {
  document.querySelector(".showPosition").style.width = "300px";
}
function closeForecast() {
  document.querySelector(".showPosition").style.width = "0";
}

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Reverse geocoding to get city name
  const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

  fetch(geoUrl)
    .then(response => response.json())
    .then(locationData => {
      const city = locationData.city || locationData.locality || "Unknown Location";

      // Now fetch weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;

      fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
          document.getElementById("city").innerText = city;
          document.getElementById("weather").innerText =
            ` ${weatherData.current_weather.temperature}°F`;
        })
        .catch(error => {
          document.getElementById("weather").innerText = "Error fetching weather.";
        });
    })
    .catch(error => {
      document.getElementById("city").innerText = "Error fetching city name.";
    });
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      document.getElementById("city").innerText = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      document.getElementById("city").innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      document.getElementById("city").innerText = "The request to get user location timed out.";
      break;
    default:
      document.getElementById("city").innerText = "An unknown error occurred.";
      break;
  }
}
