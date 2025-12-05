// JavaScript for menu, API calls, and geolocation

// Toggle Menu (right-side sidenav)
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginRight = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginRight = "0";
}

// Forecast button: scroll to the forecast section
function openForecast() {
  const section = document.querySelector(".showPosition");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// (Optional, if you ever add a close button inside showPosition)
function closeForecast() {
  // Right now .showPosition is always visible in the layout,
  // so you can leave this empty or hide it:
  // document.querySelector(".showPosition").style.display = "none";
}

/* Geolocation + Weather API */

document.addEventListener("DOMContentLoaded", function () {
  const params  = new URLSearchParams(window.location.search);

  const latParam  = parseFloat(params.get("lat"));
  const lonParam  = parseFloat(params.get("lon"));
  const nameParam = params.get("name");
  const admin1    = params.get("admin1") || "";
  const country   = params.get("country") || "";

  // If both lat and lon are valid, we came from Favorites/Search
  if (!isNaN(latParam) && !isNaN(lonParam)) {
    const cityEl = document.getElementById("city");
    if (cityEl) {
      let label = nameParam || "";
      if (admin1)  label += (label ? ", " : "") + admin1;
      if (country) label += (label ? ", " : "") + country;
      cityEl.innerText = label || "Selected location";
    }

    showPosition({
      coords: {
        latitude:  latParam,
        longitude: lonParam
      }
    });
  } else {
    // No query → original behavior
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      document.getElementById("city").innerText = "Geolocation not supported.";
    }
  }
});


function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Reverse geocoding to get city name
  const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

  fetch(geoUrl)
    .then(response => response.json())
    .then(locationData => {
      const city = locationData.city || locationData.locality || "Unknown Location";

      // Fetch weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;

      fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
          document.getElementById("city").innerText = city;
          document.getElementById("weather").innerText =
            `${weatherData.current_weather.temperature}°F`;
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
  switch (error.code) {
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
