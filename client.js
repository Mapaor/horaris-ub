let itineraris = undefined;

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path !== "/") {
        // Si no estem a la pàgina principal, carrega el JSON de l'assignatura
        const idAssignatura = path.substring(1); // Extreu l'ID de la ruta
        const url = `/api/horaris?slug=getPlanificacioAssignatura/${idAssignatura}/TG1035/2024/1/CAT`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const dom_assignatures = document.getElementById("assignatures");
                dom_assignatures.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            })
            .catch(error => console.error("Error en carregar l'assignatura:", error));
    } else {
        // Codi existent per carregar itineraris
        const url = `/api/horaris?slug=getItinerariGrau/TG1035/2024/CAT`;
        let dom_itineraris = document.getElementById("itineraris");

        fetch(url)
            .then(response => response.json())
            .then(json => {
                itineraris = json.datos;
                itineraris.forEach(itinerari => {
                    let dom_itinerari = createItinerari(itinerari);
                    dom_itineraris.appendChild(dom_itinerari);
                }); 
            })
            .catch(error => console.error("Error en la petició:", error));
    }
});

function createItinerari(itinerari) {
    let dom_itinerari = document.createElement("fluent-option");
    dom_itinerari.textContent = itinerari.descItinerari;
    dom_itinerari.addEventListener('click', () => {
        console.log("Clicked " + itinerari.descItinerari);
        setAssignatures(itinerari);
    });
    return dom_itinerari;
}

function setAssignatures(itinerari) {
    let dom_assignatures = document.getElementById("assignatures");
    dom_assignatures.innerHTML = ""; // Neteja assignatures anteriors

    itinerari.assignatures.sort((x, y) => parseInt(x.cursImparticio) - parseInt(y.cursImparticio));
    console.log(itinerari.assignatures);

    itinerari.assignatures.forEach(assignatura => {
        let dom_assignatura = document.createElement("div");
        dom_assignatura.className = "assignatura";
        dom_assignatura.innerHTML = `
            <a href="/${assignatura.idAssignatura}" class="assignatura-link">
                ${assignatura.descAssignatura} (Curs: ${assignatura.cursImparticio})
            </a>
        `;
        dom_assignatures.appendChild(dom_assignatura);
    });
}