import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/PlaDocent.module.css";

export default function PlaDocent() {
    const router = useRouter();
    const { idAssignatura } = router.query;
    const [plaDocentData, setPlaDocentData] = useState(null);

    useEffect(() => {
        if (idAssignatura) {
            console.log("Carregant JSON del Pla Docent per assignatura:", idAssignatura);
            const urlPlaDocent = `/api/pladocent?idAssignatura=${idAssignatura}`;

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

    return (
        <div className={styles.container}>
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