const apiKey = "8ec31ed231542fe0157d96cd44a1d91e";

const toggle = document.getElementById("themeToggle");

toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
});

document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) getWeather(city);
});

document.getElementById("cityInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = e.target.value.trim();
        if (city) getWeather(city);
    }
});

async function getWeather(city) {

    try {

        
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );

        if (!weatherRes.ok) {
            document.getElementById("errorMessage").textContent =
                "There is no city in the world with this name.";
            return;
        }

        const weatherData = await weatherRes.json();
        document.getElementById("errorMessage").textContent = "";

        displayCurrent(weatherData);
        updateMap(weatherData.coord.lat, weatherData.coord.lon);

        
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );

        const forecastData = await forecastRes.json();
        display7DayForecast(forecastData);

    } catch (error) {
        document.getElementById("errorMessage").textContent =
            "Error fetching data. Check API key or internet.";
    }
}

function displayCurrent(data) {

    // Get UTC time
    const utcTime = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);

    // Add city timezone offset
    const cityTime = new Date(utcTime + (data.timezone * 1000));

    const hours = cityTime.getHours();
    const minutes = cityTime.getMinutes().toString().padStart(2, "0");

    // Day or Night logic
    let dayIcon = "☀️";
    let timeLabel = "Day";

    if (hours >= 6 && hours < 18) {
        dayIcon = "☀️";
        timeLabel = "Day";
    } else {
        dayIcon = "🌙";
        timeLabel = "Night";
    }

    document.getElementById("currentWeather").innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <h3>${data.main.temp}°C</h3>
        <p>${data.weather[0].description}</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <h3>${dayIcon} ${timeLabel}</h3>
        <p>Local Time: ${hours}:${minutes}</p>
    `;
}

function display7DayForecast(data) {

    const container = document.getElementById("forecastContainer");
    container.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) {

        const item = data.list[i];
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });

        const weatherMain = item.weather[0].main.toLowerCase();

        let icon = "☀️";

        if (weatherMain.includes("cloud")) icon = "☁️";
        else if (weatherMain.includes("rain")) icon = "🌧️";
        else if (weatherMain.includes("snow")) icon = "❄️";
        else if (
            weatherMain.includes("fog") ||
            weatherMain.includes("mist") ||
            weatherMain.includes("haze")
        ) icon = "🌫️";
        else if (weatherMain.includes("clear")) icon = "☀️";

        container.innerHTML += `
            <div class="forecast-card">
                <h4>${day}</h4>
                <div class="weather-icon">${icon}</div>
                <p>${item.main.temp}°C</p>
                <p>Wind: ${item.wind.speed} m/s</p>
            </div>
        `;
    }
}

function updateMap(lat, lon) {
    document.getElementById("mapFrame").src =
        `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.5}%2C${lat - 0.5}%2C${lon + 0.5}%2C${lat + 0.5}&layer=mapnik&marker=${lat}%2C${lon}`;
}

window.onload = () => {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const weatherRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );

            const weatherData = await weatherRes.json();

            displayCurrent(weatherData);
            updateMap(lat, lon);

            const forecastRes = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
            );

            const forecastData = await forecastRes.json();
            display7DayForecast(forecastData);

        });

    }
};