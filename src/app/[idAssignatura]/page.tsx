"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../../styles/Assignatura.module.css";
import Header from "../../components/Header";
import { getAnySeleccionat } from "../../lib/anyAcademic";
import Link from "next/link";

export default function AssignaturaSemestreSelector() {
    const router = useRouter();
    const params = useParams();
    const idAssignatura = params.idAssignatura as string;
    
    const [semestresDisponibles, setSemestresDisponibles] = useState({ teOfertaSem1: false, teOfertaSem2: false, nomAssignatura: "" });
    const [plaDocentDisponible, setPlaDocentDisponible] = useState(false);

    useEffect(() => {
        if (idAssignatura) {
            const anySeleccionat = getAnySeleccionat();
            console.log("Carregant semestres per assignatura:", idAssignatura);
            fetch(`/api/horaris?slug=getItinerariGrau/TG1035/${anySeleccionat}/CAT`)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Resposta de l'API:", data);
                    let assignaturaTrobada = null;

                    for (const itinerari of data.datos) {
                        assignaturaTrobada = itinerari.assignatures.find(
                            (item: any) => item.idAssignatura === idAssignatura
                        );
                        if (assignaturaTrobada) break;
                    }

                    if (assignaturaTrobada) {
                        console.log("Assignatura trobada:", assignaturaTrobada);
                        setSemestresDisponibles({
                            teOfertaSem1: assignaturaTrobada.teOfertaSem1,
                            teOfertaSem2: assignaturaTrobada.teOfertaSem2,
                            nomAssignatura: assignaturaTrobada.descAssignatura,
                        });
                        setPlaDocentDisponible(!!assignaturaTrobada.calendariImparticio?.plaDocent);
                    } else {
                        console.error("Assignatura no trobada a l'API.");
                    }
                })
                .catch((error) => console.error("Error en carregar els semestres disponibles:", error));
        }
    }, [idAssignatura]);

    const breadcrumbs = [
        { label: "Horaris", link: "/" },
        { label: semestresDisponibles.nomAssignatura || "Nom Assignatura" }
    ];

    const title = semestresDisponibles.nomAssignatura || "Assignatura no definida";

    return (
        <div className={styles.container}>
            <Header breadcrumbs={breadcrumbs} />
            <h1>Selecciona el semestre</h1>
            <div className={styles.semestreButtons}>
                {semestresDisponibles.teOfertaSem1 && (
                    <Link
                        className={styles.semestreButton}
                        href={`/${idAssignatura}/1`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        1Sem
                    </Link>
                )}
                {semestresDisponibles.teOfertaSem2 && (
                    <Link
                        className={styles.semestreButton}
                        href={`/${idAssignatura}/2`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        2Sem
                    </Link>
                )}
            </div>
            <h1>Consulta el pla docent</h1>
            <div className={styles.plaDocentButtonContainer}>
                <Link
                    className={styles.plaDocentButton}
                    href={`/${idAssignatura}/pladocent`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Pla Docent
                </Link>
            </div>
        </div>
    );
}
