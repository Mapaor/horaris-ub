import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { generaTaulaHoraris } from "../lib/utils";

export default function Assignatura() {
    const router = useRouter();
    const { idAssignatura } = router.query;
    const [assignatura, setAssignatura] = useState(null);

    useEffect(() => {
        if (idAssignatura) {
            fetch(`/api/horaris?slug=getPlanificacioAssignatura/${idAssignatura}/TG1035/2024/1/CAT`)
                .then(response => response.json())
                .then(data => setAssignatura(data.datos.assignatura))
                .catch(error => console.error("Error en carregar l'assignatura:", error));
        }
    }, [idAssignatura]);

    if (!assignatura) return <p>Carregant...</p>;

    return (
        <div>
            <h1>{assignatura.descAssignatura}</h1>
            <div dangerouslySetInnerHTML={{ __html: generaTaulaHoraris(assignatura.activitats) }} />
        </div>
    );
}