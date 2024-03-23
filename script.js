const apiKey = 'API_KEY';

const today = new Date()

let weekList = document.querySelectorAll(".week-list .day-select")
let formatLan = document.documentElement.lang || 'fr'
let currentLocation = "Kinshasa"


function getDayName(date) {
    let result = date.toLocaleDateString(formatLan, { weekday: 'long' })
    result = result[0].toUpperCase() + result.substring(1)
    return result
}
function getMonthName(date) {
    let result = date.toLocaleDateString(formatLan, { month: 'long' })
    result = result[0].toUpperCase() + result.substring(1)
    return result
}

async function getWeather(date, location) {

    document.querySelector(".date-dayname").innerHTML = `${getDayName(date)}`
    document.querySelector(".date-day").innerHTML = `${date.getDate()} ${getMonthName(date)} ${date.getFullYear()}`

    if (date.getDate() == today.getDate()) {
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&lang=${formatLan}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const precip_mm = data.current.precip_mm;

            document.querySelector(".location").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                            viewBox="0 0 24 24" fill="currentColor" stroke="#f00" stroke-width="0.5"
                                                            stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                            <circle cx="12" cy="10" r="3" />
        </svg> ${data.location.name}, ${data.location.country}`
            document.querySelector(".weather-temp").innerHTML = ` ${data.current.temp_c} °C`
            document.querySelector(".weather-desc").innerHTML = `${data.current.condition.text}`
            document.querySelector(".precipitation .value").innerHTML = `${precip_mm} mm`
            document.querySelector(".humidity .value").innerHTML = `${data.current.humidity} %`
            document.querySelector(".wind .value").innerHTML = `${data.current.wind_kph} km/h`
            document.querySelector(".image-conditions-meteo").setAttribute("src", `${data.current.condition.icon}`)

        } catch (error) {
            console.error('Erreur lors de la récupération des données météorologiques:', error);
        }
    }
    else {

        // Formatez la date de demain pour qu'elle corresponde au format utilisé par l'API WeatherAPI (YYYY-MM-DD)
        const formattedDate = date.toISOString().split('T')[0];
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&lang=${formatLan}&dt=${formattedDate}`;
        let xhr = new XMLHttpRequest()
        xhr.open('get', apiUrl, true)
        xhr.send()
        xhr.onload = function () {
            if (xhr.status == 200) {
                try {



                    let response = JSON.parse(xhr.response)

                    const precip_mm = response.forecast.forecastday[0].day.totalprecip_mm;


                    document.querySelector(".weather-temp").innerHTML = ` ${response.forecast.forecastday[0].day.avgtemp_c} °C`
                    document.querySelector(".weather-desc").innerHTML = `${response.forecast.forecastday[0].day.condition.text}`
                    document.querySelector(".precipitation .value").innerHTML = `${precip_mm} mm`
                    document.querySelector(".humidity .value").innerHTML = `${response.forecast.forecastday[0].day.avghumidity} %`
                    document.querySelector(".wind .value").innerHTML = `${response.forecast.forecastday[0].day.maxwind_kph} km/h`
                    document.querySelector(".image-conditions-meteo").setAttribute("src", `${response.forecast.forecastday[0].day.condition.icon}`)
                } catch (error) {
                    console.error('Erreur lors de la récupération des données météorologiques:', error);
                    reject(error);
                }
            }
            else {
                console.log(xhr.status)
            }
        }


    }
}

async function getTempForDate(date, location, i = 0) {

    // Formatez la date de demain pour qu'elle corresponde au format utilisé par l'API WeatherAPI (YYYY-MM-DD)
    const year = date.getFullYear(); // Obtenez l'année à quatre chiffres
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtenez le mois (ajoutez 1 car les mois sont indexés à partir de zéro) et formatez-le avec un zéro en tête si nécessaire
    const day = String(date.getDate()).padStart(2, '0'); // Obtenez le jour et formatez-le avec un zéro en tête si nécessaire

    // Formatez la date dans le format "aaaa-mm-jj"
    const formattedDate = `${year}-${month}-${day}`;

    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&dt=${formattedDate}`;
    console.log(apiUrl);
    const result = await new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest()
        xhr.open('get', apiUrl, true)
        xhr.send()
        xhr.onload = function () {
            if (xhr.status == 200) {
                try {
                    let response = JSON.parse(xhr.response)

                    if (i == 0) {
                        resolve(response.forecast.forecastday[0].day.avgtemp_c); // Température moyenne pour la date d
                    }
                    else {
                        resolve(response.forecast.forecastday[0].day.condition.icon)
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des données météorologiques:', error);
                    reject(error);
                }
            }
            else {
                console.log(xhr.status)
            }
        }

    })
    return result
}


async function displayTemperature(date, element, location, i = 0) {
    const temp = await getTempForDate(date, location, i)
    if (i == 0) {
        element.innerHTML = `${temp} °C`
    }
    else {
        element.setAttribute("src", temp)
    }
}

function loadLocation(location) {
    getWeather(today, location)
    let i = 0
    weekList.forEach(dayOfWeek => {
        let timeStamp = Date.now() + (i * 1000 * 60 * 60 * 24)
        let currentDate = new Date(timeStamp)
        console.log(currentDate)
        dayOfWeek.querySelector(".day-name").innerHTML = `${getDayName(currentDate)}`.substring(0, 3)
        displayTemperature(currentDate, dayOfWeek.querySelector(".day-temp"), location)
        displayTemperature(currentDate, dayOfWeek.querySelector("img"), location, 1)

        dayOfWeek.addEventListener("click", () => {
            document.querySelector(".active").classList.toggle("active")
            dayOfWeek.classList.toggle("active")
            getWeather(currentDate, location)
        })
        i++
    })
}

window.onload = loadLocation(currentLocation)