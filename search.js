let userSearch = document.querySelector(".search-location input")
let suggestions = document.querySelector(".suggestions")

async function searchRegions(query) {
    const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la recherche de régions:', error);
        return [];
    }
}


userSearch.addEventListener("input", () => {
    if (userSearch.value.trim() === "") {
        suggestions.innerHTML = ``
        suggestions.style.visibility = "hidden";
        userSearch.classList.add("unactive")
        return
    }

    searchRegions(userSearch.value)
        .then(regions => {
            suggestions.style.color = "#002"
            
            if (regions.length != 0) {
                suggestions.innerHTML = ``
                regions.forEach(region => {
                    let element = document.createElement("p")
                    element.innerHTML = `${region.name}, ${region.country}`
                    suggestions.appendChild(element)
                    element.style.cursor = "pointer"
                    element.addEventListener("click", () => {
                        loadLocation(region.name)
                        suggestions.innerHTML = ``
                        suggestions.style.visibility = "hidden";
                        userSearch.value = ''
                        userSearch.classList.add("unactive")
                    })

                });
                suggestions.style.visibility = "visible";
                return
            }
            else {
                let element = document.createElement("p")
                suggestions.innerHTML = `<p>Aucun lieu ne correspond a la recherche '${userSearch.value}'</p>`
                suggestions.style.color = "red"

            }
            userSearch.classList.remove("unactive")

        })
        .catch(error => {
            console.error('Une erreur s\'est produite:', error);
        });






})