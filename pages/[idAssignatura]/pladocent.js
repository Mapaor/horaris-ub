import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../../styles/PlaDocent.module.css";
import Header from "../../components/Header";
import { getAnySeleccionat } from "../../lib/anyAcademic";

export default function PlaDocent() {
    const router = useRouter();
    const { idAssignatura } = router.query;
    const [plaDocentData, setPlaDocentData] = useState(null);

    useEffect(() => {
        if (idAssignatura) {
            const anySeleccionat = getAnySeleccionat();
            console.log("Carregant JSON del Pla Docent per assignatura:", idAssignatura);
            const urlPlaDocent = `/api/pladocent?idAssignatura=${idAssignatura}&any=${anySeleccionat}`;

            fetch(urlPlaDocent)
                .then((response) => response.json())
                .then((data) => {
                    console.log("JSON del Pla Docent:", data);
                    setPlaDocentData(data.pladocent);
                })
                .catch((error) => console.error("Error en carregar el JSON del Pla Docent:", error));
        }
    }, [idAssignatura]);

    if (!plaDocentData) {
        return <p>Carregant Pla Docent...</p>;
    }

    const { dadesGenerals, definicioPlaDocent } = plaDocentData;

    const breadcrumbs = [
        { label: "Horaris", link: "/" },
        { label: dadesGenerals.descripcioAssig, link: `/${idAssignatura}` },
        { label: "Pla Docent" }
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>{dadesGenerals.descripcioAssig} - Pla Docent</title>
                <meta name="description" content={`Pla Docent de l'assignatura ${dadesGenerals.descripcioAssig}`} />
                <meta property="og:title" content={`Pla Docent - ${dadesGenerals.descripcioAssig} ~ Horaris Física UB`}/>
                <meta property="og:description" content={`Versió alternativa a la guia acadèmica pel pla docent de l'assignatura ${dadesGenerals.descripcioAssig}.`} />
                <meta property="og:image" content="/horaris-ub.jpg" />
                <meta property="og:url" content={`https://horaris.ub.fisica.cat/${idAssignatura}/pladocent`} />
                <meta property="og:type" content="website" />
            </Head>
            <Header breadcrumbs={breadcrumbs} />
            <h1 className={styles.titolPrincipal}>{dadesGenerals.descripcioAssig}</h1>
            <h2 className={styles.titolSeccio}>Informació General</h2>
            <ul className={styles.llista}>
                <li className={styles.elementLlista}>
                    <strong className={styles.textDestacat}>Departament:</strong> {dadesGenerals.descripcioDepartament}
                </li>
                <li className={styles.elementLlista}>
                    <strong className={styles.textDestacat}>Coordinador:</strong> {dadesGenerals.descripcioCoordinador}
                </li>
                <li className={styles.elementLlista}>
                    <strong className={styles.textDestacat}>Crèdits:</strong> {dadesGenerals.creditsTotals}
                </li>
                <li className={styles.elementLlista}>
                    <strong className={styles.textDestacat}>Curs Acadèmic:</strong> {dadesGenerals.cursAcademic}
                </li>
            </ul>

            <h2 className={styles.titolSeccio}>Competències</h2>
            <ul className={styles.llista}>
                {definicioPlaDocent.competencies.map((competencia) => (
                    <li key={competencia.codiCompetencia} className={styles.elementLlista}>
                        {competencia.descripcioCompetencia}
                    </li>
                ))}
            </ul>

            <h2 className={styles.titolSeccio}>Objectius</h2>
            <ul className={styles.llista}>
                {definicioPlaDocent.objectius.map((objectiu) => (
                    <li key={objectiu.codiObjectiu} className={styles.elementLlista}>
                        <div dangerouslySetInnerHTML={{ __html: objectiu.descripcioObjectiu }} />
                    </li>
                ))}
            </ul>

            <h2 className={styles.titolSeccio}>Temari</h2>
            <ul className={styles.llista}>
                {definicioPlaDocent.temari.map((bloc) => (
                    <li key={bloc.codiBloc} className={styles.elementLlista}>
                        <strong className={styles.textDestacat}>{bloc.titol}</strong>
                        {bloc.temes ? (
                            <ul className={styles.llista}>
                                {bloc.temes.map((tema) => (
                                    <li key={tema.codiTema} className={styles.elementLlista}>
                                        <div dangerouslySetInnerHTML={{ __html: tema.titol }} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: bloc.descripcio }} />
                        )}
                    </li>
                ))}
            </ul>

            <h2 className={styles.titolSeccio}>Metodologia</h2>
            <div dangerouslySetInnerHTML={{ __html: definicioPlaDocent.metodologia }} />
            <h2 className={styles.titolSeccio}>Avaluació</h2>
            <div>
                <h3 className={styles.titolSubseccio}>Avaluació Continuada</h3>
                <div dangerouslySetInnerHTML={{ __html: definicioPlaDocent.avaluacio.avaluacioContinuada }} />
            </div>
            <div>
                <h3 className={styles.titolSubseccio}>Avaluació Única</h3>
                <div dangerouslySetInnerHTML={{ __html: definicioPlaDocent.avaluacio.avaluacioUnica }} />
            </div>
            <h2 className={styles.titolSeccio}>Bibliografia</h2>
            <ul className={styles.llista}>
                {definicioPlaDocent.fontsInformacio.map((font) => (
                    <li key={font.codiFont} className={styles.elementLlista}>
                        <div dangerouslySetInnerHTML={{ __html: font.citaLiteral }} />
                        {font.linkCatalegURL1 && (
                            <a href={font.linkCatalegURL1} target="_blank" rel="noopener noreferrer">
                                Enllaç al catàleg
                            </a>
                        )}
                    </li>
                ))}
            </ul>
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
            idAssignatura: params.idAssignatura
        },
        revalidate: 2592000 // Recarreguem la info un cop al mes
    };
}