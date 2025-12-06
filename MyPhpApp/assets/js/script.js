// JavaScript for menu, API calls, and geolocation

/** Navigation Menu Functions:
 * Opens the side navigation menu*/
const activeBlobUrls = new Set();

/**Opens the side navigation menu*/
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
            div class="forecast-day-info">
        <span class="day-name">${day.day}</span>
        <span class="forecast-icon">${iconClass}</span>
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

// NOAA radar color palette for reflectivity (dBZ)
const noaaRadarPalette = {
    colors: [
        { value: 5, color: '#04e9e7' },
        { value: 10, color: '#019ff4' },
        { value: 15, color: '#0300f4' },
        { value: 20, color: '#02fd02' },
        { value: 25, color: '#01c501' },
        { value: 30, color: '#008e00' },
        { value: 35, color: '#fdf802' },
        { value: 40, color: '#e5bc00' },
        { value: 45, color: '#fd9500' },
        { value: 50, color: '#fd0000' },
        { value: 55, color: '#d40000' },
        { value: 60, color: '#bc0000' },
        { value: 65, color: '#f800fd' },
        { value: 70, color: '#9854c6' }
    ],
    
    getColorForDbz(dbz) {
        for (const item of this.colors) {
            if (dbz <= item.value) return item.color;
        }
        return '#ffffff';
    }
};

// Station cache
let radarStationsCache = [];

async function fetchAndCacheRadarStations() {
    try {
        const response = await fetch('https://api.weather.gov/radar/stations');
        if (!response.ok) throw new Error('Failed to fetch stations');
        
        const data = await response.json();
        radarStationsCache = data.features || [];
        return radarStationsCache;
    } catch (error) {
        console.error('Error fetching radar stations:', error);
        return [];
    }
}

function findNearestStation(lat, lon, stations) {
    if (!stations || stations.length === 0) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    stations.forEach(station => {
        const stationLat = station.geometry?.coordinates?.[1];
        const stationLon = station.geometry?.coordinates?.[0];
        
        if (stationLat && stationLon) {
            const distance = calculateDistance(lat, lon, stationLat, stationLon);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = station;
            }
        }
    });
    
    return nearest;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Simplified getLatestRadarImage that returns direct URL
async function getLatestRadarImage(stationId) {
    // Common radar products in order of preference
    const radarProducts = [
        { code: 'N0R', name: 'Base Reflectivity' },
        { code: 'N0S', name: 'Short Range' },
        { code: 'N0C', name: 'Composite Reflectivity' }
    ];
    
    // Generate URLs for each product
    const radarUrls = [];
    radarProducts.forEach(product => {
        radarUrls.push(`https://radar.weather.gov/ridge/RadarImg/${product.code}/${stationId}_${product.code}_0.gif`);
    });
    
    // Always include standard and lite versions
    radarUrls.push(`https://radar.weather.gov/ridge/standard/${stationId}_0.gif`);
    radarUrls.push(`https://radar.weather.gov/ridge/lite/${stationId}_0.gif`);
    
    console.log(`Testing radar URLs for station: ${stationId}`);
    
    // Test which URL works by creating image elements
    for (let i = 0; i < radarUrls.length; i++) {
        const url = radarUrls[i];
        console.log(`Testing URL ${i + 1}: ${url}`);
        
        try {
            // Test if the image loads by creating a test image
            const testResult = await testImageUrl(url);
            if (testResult.works) {
                console.log(`✓ Found working radar URL: ${url}`);
                return {
                    url: url,
                    timestamp: new Date().toISOString(),
                    elevation: 0.5,
                    source: url,
                    productName: getProductNameFromUrl(url)
                };
            }
        } catch (error) {
            console.log(`✗ URL failed: ${url}`);
            continue;
        }
    }
    
    console.error(`No working radar URLs found for station ${stationId}`);
    return null;
}

// Helper function to test if an image URL loads
function testImageUrl(url) {
    return new Promise((resolve, reject) => {
        const testImg = new Image();
        testImg.onload = () => resolve({ works: true, url: url });
        testImg.onerror = () => reject(new Error(`Failed to load: ${url}`));
        
        // Set timeout to prevent hanging
        setTimeout(() => reject(new Error(`Timeout loading: ${url}`)), 5000);
        
        testImg.src = url;
    });
}

// Helper to get product name from URL
function getProductNameFromUrl(url) {
    if (url.includes('N0R')) return 'Base Reflectivity';
    if (url.includes('N0S')) return 'Short Range';
    if (url.includes('N0C')) return 'Composite Reflectivity';
    if (url.includes('/standard/')) return 'Standard Radar';
    if (url.includes('/lite/')) return 'Lite Radar';
    return 'Radar';
}

// Cleanup function
function cleanupOldBlobUrls(keepUrl = null) {
    const urlsToRevoke = [];
    
    activeBlobUrls.forEach(url => {
        if (url !== keepUrl) {
            urlsToRevoke.push(url);
        }
    });
    
    urlsToRevoke.forEach(url => {
        URL.revokeObjectURL(url);
        activeBlobUrls.delete(url);
    });
    
    console.log(`Cleaned up ${urlsToRevoke.length} old blob URLs`);
}

// Load local radar - using direct image URLs
async function loadLocalRadar(lat, lon) {
    const radarImg = document.getElementById('radarImage');
    const radarAnimation = document.querySelector('.radar-animation');
    const radarStationText = document.getElementById('radarStationText');
    
    if (!radarImg) return;
    
    // Show loading animation
    if (radarAnimation) {
        radarAnimation.style.display = 'flex';
        radarAnimation.innerHTML = `
            <div class="radar-circle"></div>
            <div class="radar-sweep"></div>
            <p>Loading local radar...</p>
        `;
        simulateRadarAnimation();
    }
    
    radarImg.style.display = 'none';
    
    try {
        let stations = radarStationsCache;
        if (stations.length === 0) {
            stations = await fetchAndCacheRadarStations();
        }
        
        const nearestStation = findNearestStation(lat, lon, stations);
        
        if (!nearestStation) {
            throw new Error('No radar stations found');
        }
        
        const stationId = nearestStation.properties?.id;
        const stationName = nearestStation.properties?.name || stationId;
        
        if (radarStationText) {
            radarStationText.style.display = 'block';
            const distance = calculateDistance(
                lat, lon,
                nearestStation.geometry.coordinates[1],
                nearestStation.geometry.coordinates[0]
            );
            radarStationText.textContent = `${stationName} (${Math.round(distance)} km away)`;
        }
        
        // Get radar data; returns direct URL
        const radarData = await getLatestRadarImage(stationId);
        
        if (radarData) {
            console.log(`Setting radar image src to: ${radarData.url}`);
            
            // Clear any previous handlers
            radarImg.onload = null;
            radarImg.onerror = null;
            
            // Set up new handlers
            radarImg.onload = function() {
                console.log('Radar image loaded successfully');
                radarImg.style.display = 'block';
                if (radarAnimation) radarAnimation.style.display = 'none';
                updateRadarTime();
                
                // Update radar info
                const radarTime = document.getElementById('radarTime');
                if (radarTime) {
                    const time = new Date(radarData.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    radarTime.textContent = `Updated: ${time}`;
                }
                
                // Update radar info text if available
                const radarInfo = document.getElementById('radarInfo');
                if (radarInfo) {
                    radarInfo.textContent = `${radarData.productName} - ${stationName}`;
                }
            };
            
            radarImg.onerror = function() {
                console.warn('Station radar failed to load, falling back to CONUS');
                loadCONUSRadarAsFallback();
            };
            
            // Set the image source; browser handles cross-origin for img tags then Add cache buster to prevent caching issues
            radarImg.src = radarData.url + '?t=' + Date.now();
            return;
        }
        
        throw new Error('Could not load radar image');
        
    } catch (error) {
        console.error('Error loading local radar:', error);
        loadCONUSRadarAsFallback();
    }
}

// CONUS fallback; uses direct image URL
async function loadCONUSRadarAsFallback() {
    const radarImg = document.getElementById('radarImage');
    const radarAnimation = document.querySelector('.radar-animation');
    const radarStationText = document.getElementById('radarStationText');
    
    if (radarStationText) {
        radarStationText.style.display = 'block';
        radarStationText.textContent = 'US Radar Overview (CONUS)';
    }
    
    if (radarAnimation) {
        radarAnimation.style.display = 'flex';
        radarAnimation.innerHTML = `
            <div class="radar-circle"></div>
            <div class="radar-sweep"></div>
            <p>Loading nationwide radar...</p>
        `;
        simulateRadarAnimation();
    }
    
    // Direct CONUS radar URL
    const conusUrl = 'https://radar.weather.gov/ridge/Conus/RadarImg/latest.gif';
    
    // Clear any previous handlers
    radarImg.onload = null;
    radarImg.onerror = null;
    
    radarImg.onload = function() {
        console.log('CONUS radar loaded successfully');
        radarImg.style.display = 'block';
        if (radarAnimation) radarAnimation.style.display = 'none';
        updateRadarTime();
        
        // Update radar info
        const radarTime = document.getElementById('radarTime');
        if (radarTime) {
            const time = new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            radarTime.textContent = `Updated: ${time}`;
        }
    };
    
    radarImg.onerror = function() {
        console.error('CONUS radar failed');
        if (radarAnimation) {
            radarAnimation.innerHTML = `
                <div class="radar-circle error"></div>
                <p>Radar temporarily unavailable</p>
                <p>Please check back later or try refreshing</p>
            `;
        }
        updateRadarTime();
    };
    
    // Set the image source with cache buster
    radarImg.src = conusUrl + '?t=' + Date.now();
}

// NOAA legend creation
function createNOAALegend() {
    const legendContainer = document.createElement('div');
    legendContainer.className = 'noaa-radar-legend';
    
    let legendHTML = `
        <div class="legend-title">NOAA Radar Intensity (dBZ)</div>
        <div class="legend-scale">
    `;
    
    const palette = noaaRadarPalette.colors;
    for (let i = 0; i < palette.length; i++) {
        const current = palette[i];
        const next = palette[i + 1];
        const rangeText = next 
            ? `${current.value}-${next.value}`
            : `${current.value}+`;
        
        legendHTML += `
            <div class="legend-item">
                <span class="color-bar" style="background-color: ${current.color}"></span>
                <span class="dbz-value">${rangeText}</span>
            </div>
        `;
    }
    
    legendHTML += `
        </div>
        <div class="legend-description">
            dBZ = decibels of reflectivity<br>
            Higher values indicate heavier precipitation
        </div>
        <div class="legend-source">Source: NOAA/NWS</div>
    `;
    
    legendContainer.innerHTML = legendHTML;
    
    const radarContainer = document.querySelector('.radar-container');
    if (radarContainer) {
        const oldLegend = radarContainer.querySelector('.noaa-radar-legend');
        if (oldLegend) oldLegend.remove();
        
        radarContainer.appendChild(legendContainer);
    }
}

function updateRadarTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const radarTime = document.getElementById('radarTime');
    if (radarTime) {
        radarTime.textContent = `Last updated: ${timeString}`;
    }
}

function simulateRadarAnimation() {
    const radarSweep = document.querySelector('.radar-sweep');
    if (radarSweep) {
        radarSweep.style.animation = 'radarSweep 3s linear infinite';
    }
}

async function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    
    fetch(geoUrl)
        .then(response => response.json())
        .then(locationData => {
            const city = locationData.city || locationData.locality || "Unknown Location";
            document.getElementById("city").innerText = city;
            
            const radarLocation = document.getElementById('radarLocation');
            if (radarLocation) {
                const state = locationData.principalSubdivision || '';
                radarLocation.textContent = `${city}${state ? ', ' + state : ''}`;
            }
        })
        .catch(error => {
            console.error('Error fetching location:', error);
            document.getElementById("city").innerText = "Your Location";
        });
    
    await loadLocalRadar(lat, lon);
    createNOAALegend();
    
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=14`;
    
    fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
            document.getElementById("weather").innerText = `${weatherData.current_weather.temperature}°F`;
            
            const condition = getConditionFromCode(weatherData.current_weather.weathercode);
            document.getElementById("condition").innerText = condition;
            
            if (weatherData.daily) {
                updateForecastFromAPI(weatherData.daily);
            } else {
                populateForecast();
            }
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            document.getElementById("weather").innerText = "Error";
            populateForecast();
        });
}

async function refreshRadar() {
    const radarImg = document.getElementById('radarImage');
    const radarAnimation = document.querySelector('.radar-animation');
    
    cleanupOldBlobUrls(); // Clean up old blob URLs if any exist
    
    if (radarImg) {
        radarImg.style.display = 'none';
    }
    
    if (radarAnimation) {
        radarAnimation.style.display = 'flex';
        radarAnimation.innerHTML = `
            <div class="radar-circle"></div>
            <div class="radar-sweep"></div>
            <p>Refreshing radar...</p>
        `;
        simulateRadarAnimation();
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await loadLocalRadar(lat, lon);
            },
            () => {
                loadCONUSRadarAsFallback();
            }
        );
    } else {
        loadCONUSRadarAsFallback();
    }
}

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
    populateForecast();
    simulateRadarAnimation();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateForecast();
    simulateRadarAnimation();
    updateRadarTime();
    
    // Pre-fetch radar stations
    fetchAndCacheRadarStations();

    // --- New: use coordinates from query string if present ---
    const params   = new URLSearchParams(window.location.search);
    const latParam = parseFloat(params.get('lat'));
    const lonParam = parseFloat(params.get('lon'));
    const hasCoords = !isNaN(latParam) && !isNaN(lonParam);

    if (hasCoords) {
        const name    = params.get('name')   || '';
        const admin1  = params.get('admin1') || '';
        const country = params.get('country') || '';

        const parts = [];
        if (name)    parts.push(name);
        if (admin1)  parts.push(admin1);
        if (country) parts.push(country);

        const label = parts.join(', ');

        const cityEl = document.getElementById('city');
        if (cityEl && label) {
            cityEl.innerText = label;
        }

        const positionLike = {
            coords: {
                latitude:  latParam,
                longitude: lonParam
            }
        };

        // This will fetch current weather + daily data and update the 10-day forecast
        showPosition(positionLike);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            showPosition,
            (error) => {
                showError(error);
                loadCONUSRadarAsFallback();
                createNOAALegend();
            }
        );
    } else {
        loadCONUSRadarAsFallback();
        createNOAALegend();
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        cleanupOldBlobUrls();
    });
    
    // Auto-refresh radar every 5 minutes
    setInterval(refreshRadar, 5 * 60 * 1000);
});


// NOAA radar legend CSS
const noaaLegendCSS = `
    .noaa-radar-legend {
        background: rgba(0, 0, 0, 0.85);
        color: white;
        border-radius: 8px;
        padding: 12px;
        margin-top: 15px;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 1px solid #333;
    }
    
    .legend-title {
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        color: #4fc3f7;
        font-size: 13px;
    }
    
    .legend-scale {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: center;
        margin-bottom: 10px;
    }
    
    .legend-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 40px;
    }
    
    .color-bar {
        width: 100%;
        height: 12px;
        border-radius: 2px;
        border: 1px solid rgba(255,255,255,0.3);
        margin-bottom: 4px;
    }
    
    .dbz-value {
        font-size: 10px;
        color: #ccc;
    }
    
    .legend-description {
        font-size: 10px;
        text-align: center;
        color: #aaa;
        margin-bottom: 8px;
        line-height: 1.3;
    }
    
    .legend-source {
        font-size: 9px;
        text-align: center;
        color: #888;
        font-style: italic;
    }
    
    @media (max-width: 768px) {
        .noaa-radar-legend {
            padding: 8px;
        }
        
        .legend-scale {
            gap: 4px;
        }
        
        .legend-item {
            min-width: 35px;
        }
        
        .dbz-value {
            font-size: 9px;
        }
    }
    
    @media (max-width: 480px) {
        .legend-scale {
            flex-direction: row;
            flex-wrap: wrap;
        }
        
        .legend-item {
            flex: 1 0 calc(25% - 8px);
            min-width: auto;
        }
    }
`;

// Add the NOAA legend CSS to the page
const noaaLegendStyle = document.createElement('style');
noaaLegendStyle.textContent = noaaLegendCSS;
document.head.appendChild(noaaLegendStyle);