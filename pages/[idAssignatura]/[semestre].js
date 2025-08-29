import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { generaTaulaHoraris } from "../../lib/utils";
import Head from "next/head";
import styles from "../../styles/Semestre.module.css";
import Header from "../../components/Header";
import { getAnySeleccionat } from "../../lib/anyAcademic";

export default function AssignaturaSemestre() {
    const router = useRouter();
    const { idAssignatura, semestre } = router.query;
    const [assignatura, setAssignatura] = useState(null);

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
        (activitat) => activitat.descTipusActivitat === "Exàmens"
    );

    const breadcrumbs = [
        { label: "Horaris", link: "/" },
        { label: assignatura.descAssignatura, link: `/${idAssignatura}` },
        { label: `Semestre ${semestre}` }
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>{assignatura.descAssignatura} - {semestre} Sem</title>
                <meta name="description" content={`Horaris i informació de l'assignatura ${assignatura.descAssignatura} pel semestre ${semestre}.`} />
                <meta property="og:title" content={`${assignatura.descAssignatura} - ${semestre}Sem ~ Horaris Física UB`}/>
                <meta property="og:description" content={`Versió alternativa a la guia acadèmica pels horaris i informació de l'assignatura ${assignatura.descAssignatura} pel semestre ${semestre}.`} />
                <meta property="og:image" content="/horaris-ub.jpg" />
                <meta property="og:url" content={`https://horaris.ub.fisica.cat/${idAssignatura}/${semestre}`} />
                <meta property="og:type" content="website" />
            </Head>
            <Header breadcrumbs={breadcrumbs} />
            <h1 className={styles.titolPrincipal}>{assignatura.descAssignatura} - {semestre}Sem</h1>

            <h2 className={styles.titolSeccio}>Grups</h2>
            <div className={styles.grupsContainer}>
                {assignatura.activitats?.map((activitat) =>
                    activitat.grups.map((grup) => (
                        <div key={grup.id} className={styles.grupCard}>
                            <h3 className={styles.grupTitle}>{grup.sigles}</h3>
                            <p className={styles.tipusActivitat}>{activitat.descTipusActivitat}</p>
                            <div className={styles.professors}>
                                <strong>Professorat:</strong>
                                {grup.professors.map((professor) => (
                                    <p key={professor.id}>
                                        {professor.nomComplet} - {professor.llengua}
                                    </p>
                                ))}
                            </div>
                            <div className={styles.aules}>
                                <strong>Aules:</strong>
                                {grup.espais.map((espai) => (
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
                {examens?.map((activitat) =>
                    activitat.grups.map((grup) => (
                        <div key={grup.id} className={styles.examenCard}>
                            <h3 className={styles.examenTitle}>{grup.sigles}</h3>
                            <p className={styles.tipusActivitat}>{activitat.descTipusActivitat} ({activitat.descActivitat})</p>
                            {grup.horaris.map((horari) => (
                                <div key={horari.id} className={styles.horari}>
                                    <p><strong>Data:</strong> {horari.primerEsdev}</p>
                                    <p><strong>Horari:</strong> {horari.literal}</p>
                                    <p><strong>Aules:</strong> {grup.espais.map((espai) => espai.nom).join(", ")}</p>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export async function getStaticPaths() {
    // No generem paths estàtics ja que dependrà de l'any seleccionat
    return {
        paths: [],
        fallback: "blocking"
    };
}

export async function getStaticProps({ params }) {
    // Retornem props bàsiques, les dades es carregaran dinàmicament
    return {
        props: {
            idAssignatura: params.idAssignatura,
            semestre: params.semestre
        },
        revalidate: 2592000 // Recarreguem la info un cop al mes
    };
}