import { useState, useEffect } from "react";

export function useAssignaturesData(anySeleccionat: number) {
    const [assignaturesPerCurs, setAssignaturesPerCurs] = useState<Record<string, Record<string, any[]>>>({});

    useEffect(() => {
        if (!anySeleccionat) return;

        const agrupaAssignatures = (assignatures: any[]) => {
            const agrupades = assignatures.reduce((acc, assignatura) => {
                const curs = assignatura.cursImparticio || "Altres";
                const tipus = assignatura.descTipusAssignatura || "Sense tipus";
                if (!acc[curs]) acc[curs] = {};
                if (!acc[curs][tipus]) acc[curs][tipus] = [];
                acc[curs][tipus].push(assignatura);
                return acc;
            }, {} as Record<string, Record<string, any[]>>);

            // Ordenem les assignatures per tenir abans les obligatòries
            Object.keys(agrupades).forEach((curs) => {
                agrupades[curs] = Object.keys(agrupades[curs])
                    .sort((a, b) => {
                        if (a === "Obligatòria de grau") return -1;
                        if (b === "Obligatòria de grau") return 1;
                        return 0;
                    })
                    .reduce((acc: any, tipus) => {
                        acc[tipus] = agrupades[curs][tipus];
                        return acc;
                    }, {});
            });

            setAssignaturesPerCurs(agrupades);
        };

        fetch(`/api/horaris?slug=getItinerariGrau/TG1035/${anySeleccionat}/CAT`)
            .then((response) => response.json())
            .then((data) => {
                const itinerariPerDefecte = data.datos.find(
                    (itinerari: any) => itinerari.descItinerari === "Menció en Física Fonamental"
                );
                if (itinerariPerDefecte) {
                    agrupaAssignatures(itinerariPerDefecte.assignatures);
                } else if (data.datos.length > 0) {
                    agrupaAssignatures(data.datos[0].assignatures);
                }
            })
            .catch((error) => console.error("Error en carregar els itineraris:", error));
    }, [anySeleccionat]);

    // Obtenir totes les assignatures en una llista plana per al cercador de Cronos
    const allAssignatures = typeof window !== 'undefined' ? 
        Object.values(assignaturesPerCurs).flatMap(cursObj => 
            Object.values(cursObj).flat()
        ).filter((v, i, a) => a.findIndex(t => (t.idAssignatura === v.idAssignatura)) === i)
        : [];

    return { assignaturesPerCurs, allAssignatures };
}
