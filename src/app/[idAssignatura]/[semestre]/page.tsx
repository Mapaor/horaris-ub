"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generaTaulaHoraris } from "../../../lib/utils";
import styles from "../../../styles/Semestre.module.css";
import Header from "../../../components/Header";
import { getAnySeleccionat } from "../../../lib/anyAcademic";

export default function AssignaturaSemestre() {
    const params = useParams();
    const idAssignatura = params.idAssignatura as string;
    const semestre = params.semestre as string;
    const [assignatura, setAssignatura] = useState<any>(null);

    useEffect(() => {
        if (idAssignatura && semestre) {
            const anySeleccionat = getAnySeleccionat();
            fetch(`/api/horaris?slug=getPlanificacioAssignatura/${idAssignatura}/TG1035/${anySeleccionat}/${semestre}/CAT`)
                .then((response) => response.json())
                .then((data) => setAssignatura(data.datos.assignatura))
                .catch((error) => console.error("Error en carregar l'assignatura:", error));
        }
    }, [idAssignatura, semestre]);

    if (!assignatura) return <p>Carregant...</p>;

    const taulaHoraris = assignatura.activitats
        ? generaTaulaHoraris(assignatura.activitats)
        : "<p>No hi ha activitats disponibles.</p>";

    const examens = assignatura.activitats?.filter(
        (activitat: any) => activitat.descTipusActivitat === "Exàmens"
    );

    const breadcrumbs = [
        { label: "Horaris", link: "/" },
        { label: assignatura.descAssignatura, link: `/${idAssignatura}` },
        { label: `Semestre ${semestre}` }
    ];

    return (
        <div className={styles.container}>
            <Header breadcrumbs={breadcrumbs} />
            <h1 className={styles.titolPrincipal}>{assignatura.descAssignatura} - {semestre}Sem</h1>

            <h2 className={styles.titolSeccio}>Grups</h2>
            <div className={styles.grupsContainer}>
                {assignatura.activitats?.map((activitat: any) =>
                    activitat.grups.map((grup: any) => (
                        <div key={grup.id} className={styles.grupCard}>
                            <h3 className={styles.grupTitle}>{grup.sigles}</h3>
                            <p className={styles.tipusActivitat}>{activitat.descTipusActivitat}</p>
                            <div className={styles.professors}>
                                <strong>Professorat:</strong>
                                {grup.professors.map((professor: any) => (
                                    <p key={professor.id}>
                                        {professor.nomComplet} - {professor.llengua}
                                    </p>
                                ))}
                            </div>
                            <div className={styles.aules}>
                                <strong>Aules:</strong>
                                {grup.espais.map((espai: any) => (
                                    <p key={espai.id}>{espai.nom}</p>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <h2 className={styles.titolSeccio}>Horari</h2>
            <div className={styles.tableContainer}>
                <div dangerouslySetInnerHTML={{ __html: taulaHoraris }} />
            </div>

            <h2 className={styles.titolSeccio}>Calendari d'exàmens</h2>
            <div className={styles.examensContainer}>
                {examens?.map((activitat: any) =>
                    activitat.grups.map((grup: any) => (
                        <div key={grup.id} className={styles.examenCard}>
                            <h3 className={styles.examenTitle}>{grup.sigles}</h3>
                            <p className={styles.tipusActivitat}>{activitat.descTipusActivitat} ({activitat.descActivitat})</p>
                            {grup.horaris.map((horari: any) => (
                                <div key={horari.id} className={styles.horari}>
                                    <p><strong>Data:</strong> {horari.primerEsdev}</p>
                                    <p><strong>Horari:</strong> {horari.literal}</p>
                                    <p><strong>Aules:</strong> {grup.espais.map((espai: any) => espai.nom).join(", ")}</p>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
