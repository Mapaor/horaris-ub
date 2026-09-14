export type Grup = {
    sigles: string;
    horaris: { rrule: string; dtstart: string; dtend: string; }[];
};

export type Activitat = {
    descTipusActivitat?: string;
    grups: Grup[];
};

export function generaTaulaHoraris(activitats: Activitat[]): string {
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

    const horari: Record<string, Record<string, string>> = {};

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

export function extreuDies(rrule: string): string[] {
    const diesMap: Record<string, string> = {
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

export function extreuHora(dataHora: string): string {
    return new Date(dataHora).toLocaleTimeString("ca-ES", {
        hour: "2-digit",
        minute: "2-digit"
    });
}
