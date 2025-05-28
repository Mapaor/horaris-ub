export function generaTaulaHoraris(activitats) {
    let taula = `
        <table border="1" style="width: 100%;">
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Dilluns</th>
                    <th>Dimarts</th>
                    <th>Dimecres</th>
                    <th>Dijous</th>
                    <th>Divendres</th>
                </tr>
            </thead>
            <tbody>
    `;

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

    Object.keys(horari).sort().forEach(franja => {
        taula += `
            <tr>
                <td>${franja}</td>
                <td>${horari[franja].Dilluns || ""}</td>
                <td>${horari[franja].Dimarts || ""}</td>
                <td>${horari[franja].Dimecres || ""}</td>
                <td>${horari[franja].Dijous || ""}</td>
                <td>${horari[franja].Divendres || ""}</td>
            </tr>
        `;
    });

    taula += `
            </tbody>
        </table>
    `;

    return taula;
}

export function extreuDies(rrule) {
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

export function extreuHora(dataHora) {
    return new Date(dataHora).toLocaleTimeString("ca-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function setAssignatures(itinerari) {
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