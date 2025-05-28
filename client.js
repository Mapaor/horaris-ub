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

function generaTaulaHoraris(activitats) {
    // Crea la taula
    const taula = document.createElement("table");
    taula.border = "1";
    taula.style.width = "100%";

    // Afegeix la capçalera amb els dies de la setmana
    const capcalera = document.createElement("thead");
    capcalera.innerHTML = `
        <tr>
            <th>Hora</th>
            <th>Dilluns</th>
            <th>Dimarts</th>
            <th>Dimecres</th>
            <th>Dijous</th>
            <th>Divendres</th>
        </tr>
    `;
    taula.appendChild(capcalera);

    // Crea un objecte per organitzar les activitats per hora i dia
    const horari = {};

    activitats.forEach(activitat => {
        activitat.grups.forEach(grup => {
            grup.horaris.forEach(horariItem => {
                const dies = extreuDies(horariItem.rrule);
                const horaInici = extreuHora(horariItem.dtstart);
                const horaFi = extreuHora(horariItem.dtend);
                const franjaHoraria = `${horaInici}-${horaFi}`;

                dies.forEach(dia => {
                    if (!horari[franjaHoraria]) {
                        horari[franjaHoraria] = { Dilluns: "", Dimarts: "", Dimecres: "", Dijous: "", Divendres: "" };
                    }
                    horari[franjaHoraria][dia] += `${grup.sigles} ${activitat.descTipusActivitat || ""}<br>`;
                });
            });
        });
    });

    // Afegeix les files amb les hores i activitats
    const cos = document.createElement("tbody");
    Object.keys(horari).sort().forEach(franja => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${franja}</td>
            <td>${horari[franja].Dilluns || ""}</td>
            <td>${horari[franja].Dimarts || ""}</td>
            <td>${horari[franja].Dimecres || ""}</td>
            <td>${horari[franja].Dijous || ""}</td>
            <td>${horari[franja].Divendres || ""}</td>
        `;
        cos.appendChild(fila);
    });

    taula.appendChild(cos);
    return taula;
}

function extreuDies(rrule) {
    const diesMap = {
        MO: "Dilluns",
        TU: "Dimarts",
        WE: "Dimecres",
        TH: "Dijous",
        FR: "Divendres"
    };
    const match = rrule.match(/BYDAY=([^;]+)/);
    if (match) {
        return match[1].split(",").map(codi => diesMap[codi] || codi);
    }
    return [];
}

function extreuHora(dataHora) {
    return new Date(dataHora).toLocaleTimeString("ca-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });
}