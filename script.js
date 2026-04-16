let apiKey = "501c2572ea098470a71b64fffe3db9a0";

/* =========================
   SEARCH WEATHER
========================= */
function searchWeather() {
    let city = document.getElementById("inputCity").value.trim();

    if (city === "") {
        showPopup("Enter city name");
        return;
    }

    getWeather(city);
    saveCity(city);
}

/* =========================
   GET CURRENT WEATHER
========================= */
function getWeather(city) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("Weather:", data);

            if (data.cod == "404") {
                showPopup("City not found");
                return;
            }

            document.getElementById("city").innerText = data.name;
            document.getElementById("temp").innerText = data.main.temp + "°C";
            document.getElementById("desc").innerText = data.weather[0].description;

            // Load forecast
            getForecast(city);
        })
        .catch(() => showPopup("Error fetching weather"));
}

/* =========================
   5-DAY FORECAST (CITY)
========================= */
function getForecast(city) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("Forecast:", data);

            if (data.cod !== "200") {
                showPopup("Forecast not available");
                return;
            }

            let forecastDiv = document.getElementById("forecast");
            forecastDiv.innerHTML = "";

            // Every 8th item = 1 day
            for (let i = 0; i < data.list.length; i += 8) {
                let item = data.list[i];

                let date = item.dt_txt.split(" ")[0];
                let temp = item.main.temp;

                let div = document.createElement("div");
                div.innerHTML = `<p>${date}</p><p>${temp}°C</p>`;

                forecastDiv.appendChild(div);
            }
        })
        .catch(() => showPopup("Forecast error"));
}

/* =========================
   LOCATION WEATHER
========================= */
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                let lat = pos.coords.latitude;
                let lon = pos.coords.longitude;

                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        console.log("Location Weather:", data);

                        document.getElementById("city").innerText = data.name;
                        document.getElementById("temp").innerText = data.main.temp + "°C";
                        document.getElementById("desc").innerText = data.weather[0].description;

                        // Forecast using coordinates (IMPORTANT FIX)
                        getForecastByCoords(lat, lon);
                    });
            },
            () => showPopup("Location access denied")
        );
    } else {
        showPopup("Geolocation not supported");
    }
}

/* =========================
   FORECAST BY COORDS
========================= */
function getForecastByCoords(lat, lon) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("Forecast (coords):", data);

            let forecastDiv = document.getElementById("forecast");
            forecastDiv.innerHTML = "";

            for (let i = 0; i < data.list.length; i += 8) {
                let item = data.list[i];

                let date = item.dt_txt.split(" ")[0];
                let temp = item.main.temp;

                let div = document.createElement("div");
                div.innerHTML = `<p>${date}</p><p>${temp}°C</p>`;

                forecastDiv.appendChild(div);
            }
        })
        .catch(() => showPopup("Forecast error"));
}

/* =========================
   LOCAL STORAGE (DATABASE)
========================= */
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    if (!cities.includes(city)) {
        cities.unshift(city);
    }

    cities = cities.slice(0, 5);
    localStorage.setItem("cities", JSON.stringify(cities));

    loadCities();
}

function loadCities() {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    let dropdown = document.getElementById("recentCities");

    dropdown.innerHTML = `<option value="">Recent Searches</option>`;

    cities.forEach(city => {
        let opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        dropdown.appendChild(opt);
    });
}

function selectCity() {
    let city = document.getElementById("recentCities").value;

    if (city) {
        document.getElementById("inputCity").value = city;
        getWeather(city);
    }
}

/* =========================
   CUSTOM POPUP
========================= */
function showPopup(msg) {
    document.getElementById("popup-msg").innerText = msg;
    document.getElementById("popup").style.display = "flex";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

/* Close popup on outside click */
window.onclick = function(e) {
    let popup = document.getElementById("popup");
    if (e.target === popup) {
        popup.style.display = "none";
    }
};

/* =========================
   INIT
========================= */
window.onload = loadCities;