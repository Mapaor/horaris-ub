import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Assignatura.module.css";
import Header from "../components/Header";

export default function AssignaturaSemestreSelector() {
    const router = useRouter();
    const { idAssignatura } = router.query;
    const [semestresDisponibles, setSemestresDisponibles] = useState({ teOfertaSem1: false, teOfertaSem2: false });
    const [plaDocentDisponible, setPlaDocentDisponible] = useState(false);

    useEffect(() => {
        if (idAssignatura) {
            console.log("Carregant semestres per assignatura:", idAssignatura);
            fetch(`/api/horaris?slug=getItinerariGrau/TG1035/2024/CAT`)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Resposta de l'API:", data);
                    let assignaturaTrobada = null;

                    // Iterar sobre els itineraris per buscar l'assignatura dins de `assignatures`
                    for (const itinerari of data.datos) {
                        assignaturaTrobada = itinerari.assignatures.find(
                            (item) => item.idAssignatura === idAssignatura
                        );
                        if (assignaturaTrobada) break; // Aturar la cerca si es troba l'assignatura
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

    const handleSemestreClick = (semestre) => {
        router.push(`/${idAssignatura}/${semestre}`);
    };

    const handlePlaDocentClick = () => {
        router.push(`/${idAssignatura}/pladocent`);
    };

    const breadcrumbs = [
        { label: "Horaris", link: "/" },
        { label: semestresDisponibles.nomAssignatura || "Nom Assignatura" }
    ];

    return (
        <div className={styles.container}>
            <Header breadcrumbs={breadcrumbs} />
            <h1>Selecciona el semestre</h1>
            <div className={styles.semestreButtons}>
                {semestresDisponibles.teOfertaSem1 && (
                    <a
                        className={styles.semestreButton}
                        href={`/${idAssignatura}/1`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        1Sem
                    </a>
                )}
                {semestresDisponibles.teOfertaSem2 && (
                    <a
                        className={styles.semestreButton}
                        href={`/${idAssignatura}/2`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        2Sem
                    </a>
                )}
            </div>
            <h1>Consulta el pla docent</h1>
            <div className={styles.plaDocentButtonContainer}>
                <a
                    className={styles.plaDocentButton}
                    href={`/${idAssignatura}/pladocent`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Pla Docent
                </a>
            </div>
        </div>
    );
}