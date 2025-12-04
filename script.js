// JavaScript for menu, API calls, and geolocation

/** Navigation Menu Functions:
 * Opens the side navigation menu*/
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/**  Closes the side navigation menu */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Weather icon mapping
const weatherIcons = {
    'sunny': '☀️',
    'clear': '☀️',
    'cloudy': '☁️',
    'partly-cloudy': '⛅',
    'rain': '🌧️',
    'snow': '❄️',
    'thunderstorm': '⛈️',
    'fog': '🌫️',
    'wind': '💨'
};


// Sample forecast data (will be replaced with API data)

const sampleForecast = [
    { day: 'Today', high: 45, low: 40, condition: 'Cloudy' },
    { day: 'Monday', high: 50, low: 45, condition: 'Partly Cloudy' },
    { day: 'Tuesday', high: 65, low: 60, condition: 'Sunny' },
    { day: 'Wednesday', high: 45, low: 41, condition: 'Rain' },
    { day: 'Thursday', high: 55, low: 50, condition: 'Partly Cloudy' },
    { day: 'Friday', high: 47, low: 40, condition: 'Cloudy' },
    { day: 'Saturday', high: 49, low: 44, condition: 'Partly Cloudy' },
    { day: 'Sunday', high: 44, low: 40, condition: 'Rain' },
    { day: 'Monday', high: 45, low: 40, condition: 'Cloudy' },
    { day: 'Tuesday', high: 45, low: 40, condition: 'Cloudy' }
];

/** Returns appropriate weather icon class based on condition string */
function getWeatherIcon(condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return weatherIcons.sunny;
    if (conditionLower.includes('partly')) return weatherIcons['partly-cloudy'];
    if (conditionLower.includes('cloudy')) return weatherIcons.cloudy;
    if (conditionLower.includes('rain')) return weatherIcons.rain;
    if (conditionLower.includes('snow')) return weatherIcons.snow;
    if (conditionLower.includes('thunder')) return weatherIcons.thunderstorm;
    return weatherIcons.cloudy;
}

function populateForecast() {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';
    
    sampleForecast.forEach((day, index) => {
        const isToday = index === 0;
        const iconClass = getWeatherIcon(day.condition);
        
        const forecastItem = document.createElement('div');
        forecastItem.className = `forecast-item ${isToday ? 'today' : ''}`;
        forecastItem.innerHTML = `
            <div class="forecast-day-info">
                <span class="day-name">${day.day}</span>
                <i class="${iconClass} forecast-icon"></i>
            </div>
            <div class="forecast-temps">
                <span class="temp-high">${day.high}°</span>
                <span>/</span>
                <span class="temp-low">${day.low}°</span>
            </div>
            <div class="forecast-condition">${day.condition}</div>
        `;
        
        forecastList.appendChild(forecastItem);
    });
}

// ================================
// Radar Functions
// ================================

/** Updates radar location text in UI */
function updateRadarLocation(city) {
    const radarLocation = document.getElementById('radarLocation');
    if (radarLocation) {
        radarLocation.textContent = city;
    }
}

/** Updates radar timestamp with current time */
function updateRadarTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const radarTime = document.getElementById('radarTime');
    if (radarTime) {
        radarTime.textContent = timeString;
    }
}

/** Determines nearest radar station based on latitude/longitude */
function getNearestRadarStationFromCoords(lat, lon) {
    // Simple region detection based on coordinates to select radar station
    let station = 'KSEA'; // Default Seattle station
    
    if (lat > 40 && lon < -100) station = 'KMPX'; // Midwest
    if (lat > 40 && lon > -100) station = 'KBOS'; // Northeast
    if (lat < 40 && lon < -100) station = 'KHGX'; // South
    if (lat > 45 && lon < -120) station = 'KATX'; // Northwest (Washington)
    
    return station;
}

function simulateRadarAnimation() {
    // Create radar sweep animation
    const radarSweep = document.querySelector('.radar-sweep');
    if (radarSweep) {
        radarSweep.style.animation = 'radarSweep 3s linear infinite';
    }
}

// LOAD RADAR IMAGE FUNCTION
function loadRadarImage(station) {
    const radarImg = document.getElementById('radarImage');
    const radarAnimation = document.querySelector('.radar-animation');
    const radarStationText = document.getElementById('radarStationText');
    
    if (!radarImg) return;
    
    // Update station text
    if (radarStationText) {
        radarStationText.textContent = `Radar Station: ${station}`;
    }
    
    // Hide animation initially (will show if image fails)
    if (radarAnimation) {
        radarAnimation.style.display = 'none';
    }
    
    // Set up image event handlers
    radarImg.onload = function() {
        // Image loaded successfully - show it and hide animation
        radarImg.style.display = 'block';
        if (radarAnimation) {
            radarAnimation.style.display = 'none';
        }
        updateRadarTime();
    };
    
    radarImg.onerror = function() {
        // Image failed to load - show animation instead
        radarImg.style.display = 'none';
        if (radarAnimation) {
            radarAnimation.style.display = 'flex';
            simulateRadarAnimation();
        }
        updateRadarTime();
    };
    
    // Load the radar image with cache busting
   const radarUrl = `https://radar.weather.gov/ridge/RadarImg/N0R/${station}_N0R_0.gif?${Date.now()}`;

    radarImg.src = radarUrl;
}

// REFRESH RADAR FUNCTION
function refreshRadar() {
    // Get current station
    const radarStationText = document.getElementById('radarStationText');
    let station = 'KATX'; // Default
    
    if (radarStationText && radarStationText.textContent.includes('Radar Station:')) {
        station = radarStationText.textContent.split(':')[1].trim();
    }
    
    // Show loading state
    const radarImg = document.getElementById('radarImage');
    const radarAnimation = document.querySelector('.radar-animation');
    
    if (radarImg) radarImg.style.display = 'none';
    if (radarAnimation) {
        radarAnimation.style.display = 'flex';
        radarAnimation.innerHTML = `
            <div class="radar-circle"></div>
            <div class="radar-sweep"></div>
            <p>Refreshing radar...</p>
        `;
        simulateRadarAnimation();
    }
    
    // Load new image after a short delay
    setTimeout(() => {
        loadRadarImage(station);
    }, 500);
}

/** Geolocation & Weather API Functions:
 * Checks if browser supports geolocation and requests user's location*/
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
    document.getElementById("city").innerText = "Geolocation not supported.";
}

// Handles successful geolocation
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Get radar station based on coordinates
    const radarStation = getNearestRadarStationFromCoords(lat, lon);
    
    // Load radar image immediately
    loadRadarImage(radarStation);

    // Reverse geocoding to get city name
    const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(locationData => {
            const city = locationData.city || locationData.locality || "Unknown Location";
            document.getElementById("city").innerText = city;
            updateRadarLocation(city);

            // Fetch weather from Open-Meteo
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

            fetch(weatherUrl)
                .then(response => response.json())
                .then(weatherData => {
                    document.getElementById("weather").innerText = `${weatherData.current_weather.temperature}°F`;
                    
                    // Update condition based on weathercode
                    const condition = getConditionFromCode(weatherData.current_weather.weathercode);
                    document.getElementById("condition").innerText = condition;
                    
                    // Populate forecast with real data if available
                    if (weatherData.daily) {
                        updateForecastFromAPI(weatherData.daily);
                    } else {
                        populateForecast(); // Use sample data
                    }
                })
                .catch(error => {
                    console.error('Error fetching weather:', error);
                    document.getElementById("weather").innerText = "Error fetching weather.";
                    populateForecast(); // Use sample data on error
                });
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            document.getElementById("city").innerText = "Error fetching city name.";
            populateForecast(); // Use sample data on error
        });
}

// Convert WMO weather code to condition human-readable conditions 
function getConditionFromCode(code) {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
}

/**
 * updateForecastFromAPI(dailyData):
 * Populates the forecast list in the DOM using real API data.
 * - Clears any existing forecast items.
 * - Loops through the next 10 days starting from today.
 * - Builds forecast items with day name, high/low temps, condition, and icon.
 * - Appends each forecast item to the forecast list container.
 
 * @param {Object} dailyData - API response containing arrays of max/min temperatures and weather codes.
 */
function updateForecastFromAPI(dailyData) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        const dayName = i === 0 ? 'Today' : days[forecastDate.getDay()];
        
        const high = Math.round(dailyData.temperature_2m_max[i] || 0);
        const low = Math.round(dailyData.temperature_2m_min[i] || 0);
        const condition = getConditionFromCode(dailyData.weathercode[i] || 0);
        const iconClass = getWeatherIcon(condition);
        
        const forecastItem = document.createElement('div');
        forecastItem.className = `forecast-item ${i === 0 ? 'today' : ''}`;
        forecastItem.innerHTML = `
            <div class="forecast-day-info">
                <span class="day-name">${dayName}</span>
                                
            </div>
            <div class="forecast-temps">
                <span class="temp-low">${low}°</span>
                <span>/</span>
                <span class="temp-high">${high}°</span>
            </div>
            <div class="forecast-condition">${condition}</div>
            <span class="forecast-icon">${iconClass}</span>
               `;
        
        forecastList.appendChild(forecastItem);
    }
}

// Error handling when user denied geolocation request
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("city").innerText = "Enable location access to get current weather.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("city").innerText = "Location unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById("city").innerText = "Location request timed out.";
            break;
        default:
            document.getElementById("city").innerText = "Location error occurred.";
            break;
    }
    populateForecast(); // Show sample forecast even if location fails
    simulateRadarAnimation();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    populateForecast(); // Show sample data immediately
    simulateRadarAnimation();
    updateRadarTime();
    
    // Load a default radar image if no location is available yet
    setTimeout(() => {
        const radarImg = document.getElementById('radarImage');
        if (radarImg && !radarImg.src) {
            loadRadarImage('KATX'); // Load default radar
        }
    }, 1000);
});
