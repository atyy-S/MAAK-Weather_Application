// script.js – uses ONLY plain JavaScript (no TS, no React)

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL   = "https://api.open-meteo.com/v1/forecast";

let favorites = [];    // loaded from DB
let searchResults = []; // last search
const MAX_FAVORITES = 10;
let isLoggedIn = false;


// modal state (shared)
let modalOverlay, modalText, modalCancel, modalConfirm;
let modalConfirmHandler = null;

document.addEventListener("DOMContentLoaded", function () {
    const page       = document.body.getAttribute("data-page");
    const loggedAttr = document.body.getAttribute("data-logged-in");
    isLoggedIn = (loggedAttr === "1");

    // ---- Modal wiring (works on both favorites and search pages) ----
    modalOverlay = document.getElementById("modal-overlay");
    modalText    = document.getElementById("modal-text");
    modalCancel  = document.getElementById("modal-cancel");
    modalConfirm = document.getElementById("modal-confirm");

    if (modalOverlay) {
        // Ensure it's hidden by default
        modalOverlay.classList.add("hidden");

        if (modalCancel) {
            modalCancel.addEventListener("click", function () {
                hideModal();
            });
        }

        if (modalConfirm) {
            modalConfirm.addEventListener("click", function () {
                if (typeof modalConfirmHandler === "function") {
                    const handler = modalConfirmHandler;
                    modalConfirmHandler = null;
                    hideModal();
                    handler();              // run the callback (e.g., addFavoriteOnServer)
                } else {
                    hideModal();
                }
            });
        }
    }

    // ---- Page-specific init ----
    if (page === "favorites") {
        initFavoritesPage();
    } else if (page === "search") {
        initSearchPage();
    } else if (page === "forecast") {
        initForecastPage();
    }
});



// ---------- Modal helpers ----------

function showModal(message, onConfirm) {
    if (!modalOverlay) return;
    modalText.textContent = message;
    modalConfirmHandler   = onConfirm || null;
    modalOverlay.classList.remove("hidden");
}

function hideModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add("hidden");
}

// ---------- Shared DB helpers ----------

async function loadFavoritesFromServer() {
    const response = await fetch("get_favorites.php");
    if (!response.ok) {
        throw new Error("Failed to load favorites.");
    }
    const data = await response.json();
    if (!data.success) {
        throw new Error(data.error || "Error loading favorites.");
    }

    favorites = (data.favorites || []).map(function (f) {
        return {
            id: Number(f.external_id),
            name: f.name,
            latitude: Number(f.latitude),
            longitude: Number(f.longitude),
            country: f.country || "",
            admin1: f.admin1 || ""
        };
    });
}

async function addFavoriteOnServer(loc) {
    const payload = {
        id: loc.id,
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        country: loc.country || "",
        admin1: loc.admin1 || ""
    };

    const response = await fetch("add_favorite.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to add favorite.");
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Error adding favorite.");
}

async function removeFavoriteOnServer(id) {
    const response = await fetch("remove_favorite.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    });

    if (!response.ok) throw new Error("Failed to remove favorite.");
    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Error removing favorite.");
}

function formatLocationLabel(loc) {
    const parts = [loc.name];
    if (loc.admin1) parts.push(loc.admin1);
    if (loc.country) parts.push(loc.country);
    return parts.join(", ");
}

// =====================================================
//  FAVORITES PAGE
// =====================================================

async function initFavoritesPage() {
    const listEl   = document.getElementById("favorites-list");
    const msgEl    = document.getElementById("favorites-message");
    const addBtn   = document.getElementById("add-location-btn");

    if (!isLoggedIn) {
        // Guest: no option to add favorites from the UI
        if (addBtn) {
            addBtn.style.display = "none";
        }
    } else if (addBtn) {
        addBtn.addEventListener("click", function () {
            window.location.href = "search.php";
        });
}


    try {
        await loadFavoritesFromServer();
        renderFavoritesList(listEl, msgEl);
    } catch (err) {
        listEl.innerHTML = "";
        msgEl.textContent = "Could not load favorites: " + err.message;
    }
}

function renderFavoritesList(listEl, msgEl) {
    listEl.innerHTML = "";

    if (favorites.length === 0) {
        msgEl.textContent = "No favorite locations yet. Use Add Location to create one.";
    } else {
        msgEl.textContent = "";
    }

    favorites.forEach(function (loc) {
        const li    = document.createElement("li");
        li.className = "list-item";

        const label = document.createElement("span");
        label.className = "list-item-label";
        label.textContent = formatLocationLabel(loc);

        // Clicking label goes to forecast page
        label.addEventListener("click", function () {
            goToForecast(loc);
        });

        const actions = document.createElement("div");
        actions.className = "row-actions";

        const removeBtn = document.createElement("button");
        removeBtn.className = "icon-btn icon-remove";
        removeBtn.textContent = "×";
        removeBtn.title = "Remove from favorites";

        removeBtn.addEventListener("click", function (ev) {
            ev.stopPropagation();
            const message = "Remove " + loc.name + " from Favorites?";
            showModal(message, async function () {
                try {
                    await removeFavoriteOnServer(loc.id);
                    favorites = favorites.filter(function (f) {
                        return f.id !== loc.id;
                    });
                    renderFavoritesList(listEl, msgEl);
                } catch (err) {
                    alert("Error removing favorite: " + err.message);
                }
            });
        });

        actions.appendChild(removeBtn);
        li.appendChild(label);
        li.appendChild(actions);
        listEl.appendChild(li);
    });

    if (favorites.length >= MAX_FAVORITES) {
        msgEl.textContent = "You already have 10 favorites. Remove one to add another.";
    }
}

// =====================================================
//  SEARCH PAGE
// =====================================================

async function initSearchPage() {
    const inputEl   = document.getElementById("search-input");
    const clearBtn  = document.getElementById("clear-search");
    const resultsEl = document.getElementById("search-results");
    const msgEl     = document.getElementById("search-message");
    const backBtn   = document.getElementById("back-to-favorites");

    // Button is being removed from the UI; guard in case it still exists.
    if (backBtn) {
        backBtn.addEventListener("click", function () {
            window.location.href = "index.php";
        });
    }


    clearBtn.addEventListener("click", function () {
        inputEl.value = "";
        searchResults = [];
        resultsEl.innerHTML = "";
        msgEl.textContent = "";
    });

    // load favorites first (so we can hide add buttons for existing ones)
    try {
        await loadFavoritesFromServer();
    } catch (err) {
    // If not logged in, we don't care about favorites here – just stay silent.
        if (isLoggedIn) {
            msgEl.textContent = "Could not load favorites: " + err.message;
        } else {
            msgEl.textContent = ""; // no error message for guests
        }
    }

let searchTimeout = null;

    inputEl.addEventListener("input", function () {
        const q = inputEl.value.trim();

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (q.length < 2) {
            searchResults = [];
            resultsEl.innerHTML = "";
            msgEl.textContent = q.length === 0
                ? ""
                : "Enter at least 2 characters to search.";
            return;
        }

        msgEl.textContent = "Searching...";
        searchTimeout = setTimeout(function () {
            performSearch(q, resultsEl, msgEl);
        }, 350);
    });
}

async function performSearch(query, resultsEl, msgEl) {
    try {
        const url = GEOCODING_API_URL +
            "?name=" + encodeURIComponent(query) +
            "&count=10&language=en&format=json";

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Search failed.");
        }

        const data = await response.json();
        if (!data.results) {
            searchResults = [];
            resultsEl.innerHTML = "";
            msgEl.textContent = "No locations found.";
            return;
        }

        searchResults = data.results.map(function (item) {
            return {
                id: item.id,
                name: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
                country: item.country,
                admin1: item.admin1
            };
        });

        renderSearchResults(resultsEl, msgEl);
    } catch (err) {
        searchResults = [];
        resultsEl.innerHTML = "";
        msgEl.textContent = "Error searching locations: " + err.message;
    }
}

function renderSearchResults(resultsEl, msgEl) {
    resultsEl.innerHTML = "";

    const favoritesFull = favorites.length >= MAX_FAVORITES;

    searchResults.forEach(function (loc) {
        const li    = document.createElement("li");
        li.className = "list-item";

        const label = document.createElement("span");
        label.className = "list-item-label";
        label.textContent = formatLocationLabel(loc);

        // Clicking label goes to forecast
        label.addEventListener("click", function () {
            goToForecast(loc);
        });

        const actions = document.createElement("div");
        actions.className = "row-actions";

        const alreadyFavorite = favorites.some(function (f) {
            return f.id === loc.id;
        });

        if (isLoggedIn && !alreadyFavorite && !favoritesFull) {
            // show green + icon to add (search page ONLY adds)
            const addBtn = document.createElement("button");
            addBtn.className = "icon-btn icon-add";
            addBtn.textContent = "+";
            addBtn.title = "Add to favorites";

            addBtn.addEventListener("click", function (ev) {
                ev.stopPropagation();
                const message = "Add " + loc.name + " to Favorites?";
                showModal(message, async function () {
                    try {
                        if (favorites.length >= MAX_FAVORITES) {
                            alert("You already have 10 favorites. Remove one first.");
                            return;
                        }
                        await addFavoriteOnServer(loc);
                        favorites.push({
                            id: loc.id,
                            name: loc.name,
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                            country: loc.country || "",
                            admin1: loc.admin1 || ""
                        });
                        renderSearchResults(resultsEl, msgEl);
                    } catch (err) {
                        alert("Error adding favorite: " + err.message);
                    }
                });
            });

            actions.appendChild(addBtn);
        }
        // else:
        // - alreadyFavorite: NO add/remove icon at all
        // - favoritesFull: no add icon (user sees message below)

        li.appendChild(label);
        li.appendChild(actions);
        resultsEl.appendChild(li);
    });

    if (favoritesFull) {
        msgEl.textContent =
            "You already have 10 favorites. Remove one on the Favorites page before adding more.";
    } else if (searchResults.length === 0) {
        msgEl.textContent = "No locations found.";
    } else {
        msgEl.textContent = "";
    }
}

// =====================================================
//  FORECAST PAGE
// =====================================================

async function initForecastPage() {
    const titleEl   = document.getElementById("forecast-title");
    const contentEl = document.getElementById("forecast-content");
    const backBtn   = document.getElementById("back-from-forecast");

    backBtn.addEventListener("click", function () {
        window.location.href = "index.php";
    });

    const params = new URLSearchParams(window.location.search);

    const name = params.get("name") || "Location";
    const lat  = parseFloat(params.get("lat"));
    const lon  = parseFloat(params.get("lon"));
    const admin1 = params.get("admin1") || "";
    const country = params.get("country") || "";

    const label = formatLocationLabel({
        name: name,
        admin1: admin1,
        country: country
    });

    titleEl.textContent = "Forecast – " + label;

    if (isNaN(lat) || isNaN(lon)) {
        contentEl.innerHTML = "<p class='muted'>Missing or invalid coordinates.</p>";
        return;
    }

    contentEl.innerHTML = "<p class='muted'>Loading forecast...</p>";

    try {
        const query = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m",
            current_weather: "true",
            timezone: "auto"
        });

        const url = WEATHER_API_URL + "?" + query.toString();
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch forecast.");

        const data = await response.json();
        renderForecast(contentEl, label, data);
    } catch (err) {
        contentEl.innerHTML =
            "<p class='muted'>Error loading forecast: " +
            err.message +
            "</p>";
    }
}

function renderForecast(contentEl, label, data) {
    const current = data.current_weather;
    if (!current) {
        contentEl.innerHTML =
            "<p class='muted'>No current weather data for " +
            label +
            ".</p>";
        return;
    }

    const html =
        "<h3>" + label + "</h3>" +
        "<p><strong>Temperature:</strong> " + current.temperature + " °C</p>" +
        "<p><strong>Wind speed:</strong> " + current.windspeed + " km/h</p>" +
        "<p><strong>Time:</strong> " + current.time + "</p>" +
        "<p class='muted' style='margin-top:8px;'>Data from Open-Meteo.</p>";

    contentEl.innerHTML = html;
}

// ---------- Navigation helper ----------
function goToForecast(loc) {
    // Build query string with the selected location
    const params = new URLSearchParams({
        name: loc.name,
        lat: String(loc.latitude),
        lon: String(loc.longitude),
        admin1: loc.admin1 || "",
        country: loc.country || ""
    });

    // From /SearchFavorites/ to homepage in project root:
    window.location.href = "../index.php?" + params.toString();
}
