import { setAssignatures, generaTaulaHoraris, extreuDies, extreuHora } from "./lib/utils.js";

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
                dom_assignatures.innerHTML = ""; // Neteja contingut anterior

                // Genera la taula d'horaris
                const horariTaula = generaTaulaHoraris(data.datos.assignatura.activitats);
                dom_assignatures.appendChild(horariTaula);
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

useEffect(() => {
    if (idAssignatura) {
        console.log("Carregant assignatura:", idAssignatura);
        fetch(`/api/horaris?slug=getPlanificacioAssignatura/${idAssignatura}/TG1035/2024/1/CAT`)
            .then((response) => {
                console.log("Resposta del servidor:", response);
                return response.json();
            })
            .then((data) => {
                console.log("Dades rebudes:", data);
                setAssignatura(data.datos.assignatura);
            })
            .catch((error) => console.error("Error en carregar l'assignatura:", error));
    }
}, [idAssignatura]);

if (!assignatura) {
    return <p>Error: No s'ha pogut carregar l'assignatura.</p>;
}