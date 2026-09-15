export type CalendarEvent = {
    id: string;
    idAssignatura: string;
    descAssignatura: string;
    siglesGrup: string;
    descTipusActivitat: string;
    dayIndex: number; // 0 (Dilluns) a 4 (Divendres)
    startMinute: number; // minuts des de les 00:00 (ex. 8:30 -> 510)
    endMinute: number;
    
    // Propietats visuals
    color: string;
    columnWidth: number;
    columnOffset: number;
    
    // Altres
    classroomStr?: string;
};

// Genera un color únic i atractiu basat en el nom o ID de l'assignatura
export function generateColorForAssignatura(idAssignatura: string): string {
    const colors = [
        "#0078d4", // Blau corporatiu UB
        "#059669", // Verd emerald
        "#dc2626", // Vermell
        "#7c3aed", // Lila violet
        "#ea580c", // Taronja
        "#db2777", // Rosa
        "#2563eb", // Blau clar
        "#0891b2", // Cyan
        "#ca8a04", // Groc ocre
        "#4f46e5"  // Indigo
    ];
    let hash = 0;
    for (let i = 0; i < idAssignatura.length; i++) {
        hash = idAssignatura.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function getDayIndices(rrule: string): number[] {
    const diesMap: Record<string, number> = {
        MO: 0,
        TU: 1,
        WE: 2,
        TH: 3,
        FR: 4
    };
    const match = rrule.match(/BYDAY=([^;]+)/);
    if (match) {
        return match[1].split(",").map(codi => diesMap[codi]).filter(x => x !== undefined);
    }
    return [];
}

export function getMinutesFromDate(dateStr: string): number {
    const d = new Date(dateStr);
    return d.getHours() * 60 + d.getMinutes();
}

export function calculateLayout(events: CalendarEvent[]): CalendarEvent[] {
    // Agrupar per dies
    const days: Record<number, CalendarEvent[]> = {};
    events.forEach(ev => {
        if (!days[ev.dayIndex]) days[ev.dayIndex] = [];
        days[ev.dayIndex].push(ev);
    });

    const laidOutEvents: CalendarEvent[] = [];

    // Processar cada dia de forma independent
    Object.values(days).forEach(dayEvents => {
        // Ordenar per hora d'inici i, si són iguals, per hora final
        dayEvents.sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute);

        const clusters: CalendarEvent[][] = [];
        let currentCluster: CalendarEvent[] = [];
        let clusterEnd = 0;

        // Agrupar esdeveniments en clústers (blocs de temps connectats on hi ha solapaments directes o indirectes)
        dayEvents.forEach(ev => {
            if (currentCluster.length === 0) {
                currentCluster.push(ev);
                clusterEnd = ev.endMinute;
            } else if (ev.startMinute < clusterEnd) {
                // Solapa amb el clúster actual
                currentCluster.push(ev);
                clusterEnd = Math.max(clusterEnd, ev.endMinute);
            } else {
                // No solapa, tancar clúster i obrir-ne un de nou
                clusters.push(currentCluster);
                currentCluster = [ev];
                clusterEnd = ev.endMinute;
            }
        });
        
        if (currentCluster.length > 0) {
            clusters.push(currentCluster);
        }

        // Calcular l'amplada i posició (columnes) per a cada clúster independentment
        clusters.forEach(cluster => {
            const columns: CalendarEvent[][] = [];

            cluster.forEach(ev => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    const lastEvent = col[col.length - 1];
                    if (lastEvent.endMinute <= ev.startMinute) {
                        col.push(ev);
                        ev.columnOffset = i; // Assignem l'índex de la columna
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    columns.push([ev]);
                    ev.columnOffset = columns.length - 1;
                }
            });

            const totalColumns = columns.length;
            cluster.forEach(ev => {
                // Si hi ha 2 columnes al clúster, ocuparan 50% d'amplada cadascuna.
                // Si només n'hi ha 1, ocuparà el 100%.
                ev.columnWidth = 100 / totalColumns;
                ev.columnOffset = ev.columnOffset * ev.columnWidth; // offset final en %
            });

            laidOutEvents.push(...cluster);
        });
    });

    return laidOutEvents;
}
