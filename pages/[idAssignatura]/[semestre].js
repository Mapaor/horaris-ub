import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { generaTaulaHoraris } from "../../lib/utils";
import styles from "../../styles/Assignatura.module.css";

export default function AssignaturaSemestre() {
    const router = useRouter();
    const { idAssignatura, semestre } = router.query;
    const [assignatura, setAssignatura] = useState(null);

    useEffect(() => {
        if (idAssignatura && semestre) {
            fetch(`/api/horaris?slug=getPlanificacioAssignatura/${idAssignatura}/TG1035/2024/${semestre}/CAT`)
                .then((response) => response.json())
                .then((data) => setAssignatura(data.datos.assignatura))
                .catch((error) => console.error("Error en carregar l'assignatura:", error));
        }
    }, [idAssignatura, semestre]);

    if (!assignatura) return <p>Carregant...</p>;

    const taulaHoraris = assignatura.activitats
        ? generaTaulaHoraris(assignatura.activitats)
        : "<p>No hi ha activitats disponibles.</p>";

    return (
        <div className={styles.container}>
            <h1>{assignatura.descAssignatura} - {semestre}Sem</h1>
            <div className={styles.tableContainer}>
                <div dangerouslySetInnerHTML={{ __html: taulaHoraris }} />
            </div>
        </div>
    );
}