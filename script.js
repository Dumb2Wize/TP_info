const apiKey = 'MY_API_KEY';

const months = ['Jan', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const today = new Date()

let weekList = document.querySelectorAll(".week-list .day-select")
let formatLan = "fr"
let currentLocation = "Kinshasa"

async function getWeather(date, currentLocation) {
    document.querySelector(".date-dayname").innerHTML = `${daysOfWeek[date.getDay()]}`
    document.querySelector(".date-day").innerHTML = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`

    if (date.getDate() == today.getDate()) {
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${currentLocation}&lang=${formatLan}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const precip_mm = data.current.precip_mm;
            // Valeur de référence pour les précipitations fortes
            const referenceValue = 10; // 10 mm
            // Calcul du pourcentage de précipitations
            const pourcentagePrecipitation = (precip_mm / referenceValue) * 100;

            document.querySelector(".location").innerHTML = `${data.location.name}, ${data.location.country}`
            document.querySelector(".weather-temp").innerHTML = ` ${data.current.temp_c} °C`
            document.querySelector(".weather-desc").innerHTML = `${data.current.condition.text}`
            document.querySelector(".precipitation .value").innerHTML = `${pourcentagePrecipitation.toFixed(1)} %`
            document.querySelector(".humidity .value").innerHTML = `${data.current.humidity} %`
            document.querySelector(".wind .value").innerHTML = `${data.current.wind_kph} %`
            document.querySelector(".image-conditions-meteo").setAttribute("src", `${data.current.condition.icon}`)

        } catch (error) {
            console.error('Erreur lors de la récupération des données météorologiques:', error);
        }
    }
    else {

        // Formatez la date de demain pour qu'elle corresponde au format utilisé par l'API WeatherAPI (YYYY-MM-DD)
        const formattedDate = date.toISOString().split('T')[0];
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${currentLocation}&lang=${formatLan}&dt=${formattedDate}`;
        let xhr = new XMLHttpRequest()
        xhr.open('get', apiUrl, true)
        xhr.send()
        xhr.onload = function () {
            if (xhr.status == 200) {
                try {

                    

                    let response = JSON.parse(xhr.response)

                    const precip_mm = response.forecast.forecastday[0].day.totalprecip_mm;
                    // Valeur de référence pour les précipitations fortes
                    const referenceValue = 10; // 10 mm
                    // Calcul du pourcentage de précipitations
                    const pourcentagePrecipitation = (precip_mm / referenceValue) * 100;

                    document.querySelector(".weather-temp").innerHTML = ` ${response.forecast.forecastday[0].day.avgtemp_c} °C`
                    document.querySelector(".weather-desc").innerHTML = `${response.forecast.forecastday[0].day.condition.text}`
                    document.querySelector(".precipitation .value").innerHTML = `${pourcentagePrecipitation.toFixed(1)} %`
                    document.querySelector(".humidity .value").innerHTML = `${response.forecast.forecastday[0].day.avghumidity} %`
                    document.querySelector(".wind .value").innerHTML = `${response.forecast.forecastday[0].day.maxwind_kph} %`
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

async function getTempForDate(date, currentLocation, i = 0) {

    // Formatez la date de demain pour qu'elle corresponde au format utilisé par l'API WeatherAPI (YYYY-MM-DD)
    const year = date.getFullYear(); // Obtenez l'année à quatre chiffres
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtenez le mois (ajoutez 1 car les mois sont indexés à partir de zéro) et formatez-le avec un zéro en tête si nécessaire
    const day = String(date.getDate()).padStart(2, '0'); // Obtenez le jour et formatez-le avec un zéro en tête si nécessaire

    // Formatez la date dans le format "aaaa-mm-jj"
    const formattedDate = `${year}-${month}-${day}`;

    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${currentLocation}&dt=${formattedDate}`;
    console.log(apiUrl);
    const result = await new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest()
        xhr.open('get', apiUrl, true)
        xhr.send()
        xhr.onload = function () {
            if (xhr.status == 200) {
                try {
                    let response = JSON.parse(xhr.response)
                    // Récupérez les informations météorologiques pour demain
                    console.log(response)

                    // const c = { ,
                    //             icon: response.forecast.forecastday[0].day.condition.icon, }

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


async function displayTemperature(date, element, i = 0) {
    const temp = await getTempForDate(date, "Kinshasa", i)
    if (i == 0) {
        element.innerHTML = `${temp} °C`
    }
    else {
        element.setAttribute("src", temp)
    }
}

let i = 0
weekList.forEach(dayOfWeek => {
    let timeStamp = Date.now() + (i * 1000 * 60 * 60 * 24)
    let currentDate = new Date(timeStamp)
    console.log(currentDate)
    dayOfWeek.querySelector(".day-name").innerHTML = `${daysOfWeek[currentDate.getDay()]}`.substring(0, 3)
    displayTemperature(currentDate, dayOfWeek.querySelector(".day-temp"))
    displayTemperature(currentDate, dayOfWeek.querySelector("img"), 1)

    dayOfWeek.addEventListener("click", () => {
        document.querySelector(".active").classList.toggle("active")
        dayOfWeek.classList.toggle("active")
        getWeather(currentDate, currentLocation)
    })
    i++
})

window.onload = getWeather(today, "Kinshasa")