import { useEffect, useState } from "react";
import styles from "../styles/PaginaPrincipal.module.css";

export default function Home() {
    const [itineraris, setItineraris] = useState([]);
    const [assignaturesPerCurs, setAssignaturesPerCurs] = useState({});
    const [itinerariActiu, setItinerariActiu] = useState(null);

    const nomsCursos = {
        1: "1r",
        2: "2n",
        3: "3r",
        4: "4t",
        Altres: "Altres"
    };

    useEffect(() => {
        fetch("/api/horaris?slug=getItinerariGrau/TG1035/2024/CAT")
            .then((response) => response.json())
            .then((data) => {
                setItineraris(data.datos);
                const itinerariPerDefecte = data.datos.find(
                    (itinerari) => itinerari.descItinerari === "Menció en Física Fonamental"
                );
                if (itinerariPerDefecte) {
                    setItinerariActiu(itinerariPerDefecte.idItinerari);
                    agrupaAssignatures(itinerariPerDefecte.assignatures);
                }
            })
            .catch((error) => console.error("Error en carregar els itineraris:", error));
    }, []);

    const agrupaAssignatures = (assignatures) => {
        const agrupades = assignatures.reduce((acc, assignatura) => {
            const curs = assignatura.cursImparticio || "Altres";
            const tipus = assignatura.descTipusAssignatura || "Sense tipus";
            if (!acc[curs]) acc[curs] = {};
            if (!acc[curs][tipus]) acc[curs][tipus] = [];
            acc[curs][tipus].push(assignatura);
            return acc;
        }, {});
        setAssignaturesPerCurs(agrupades);
    };

    const handleItinerariClick = (itinerari) => {
        setItinerariActiu(itinerari.idItinerari);
        agrupaAssignatures(itinerari.assignatures);
    };

    return (
        <div className={styles.container}>
            <h1>Horaris UB</h1>
            <div className={styles.categories}>
                {itineraris.map((itinerari) => (
                    <button
                        key={itinerari.idItinerari}
                        className={`${styles.categoryButton} ${
                            itinerariActiu === itinerari.idItinerari ? styles.activeButton : ""
                        }`}
                        onClick={() => handleItinerariClick(itinerari)}
                    >
                        {itinerari.descItinerari}
                    </button>
                ))}
            </div>
            <div className={styles.assignatures}>
                <h2>Llistat d'assignatures</h2>
                {Object.keys(assignaturesPerCurs).map((curs) => (
                    <div key={curs}>
                        <h3>{nomsCursos[curs] || curs}</h3>
                        {Object.keys(assignaturesPerCurs[curs]).map((tipus) => (
                            <div key={tipus}>
                                <h4>{tipus}</h4>
                                <ul>
                                    {assignaturesPerCurs[curs][tipus].map((assignatura) => (
                                        <li key={assignatura.idAssignatura} className={styles.assignaturaItem}>
                                            <a
                                                href={`/${assignatura.idAssignatura}`}
                                                className={styles.assignaturaLink}
                                            >
                                                {assignatura.descAssignatura}
                                            </a>
                                            <div className={styles.semestreButtons}>
                                                <div style={{ flex: 1, textAlign: "left" }}>
                                                    {assignatura.teOfertaSem1 && (
                                                        <a
                                                            href={`/${assignatura.idAssignatura}/1`}
                                                            className={styles.semestreButtonSmall}
                                                        >
                                                            1Sem
                                                        </a>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, textAlign: "right" }}>
                                                    {assignatura.teOfertaSem2 && (
                                                        <a
                                                            href={`/${assignatura.idAssignatura}/2`}
                                                            className={styles.semestreButtonSmall}
                                                        >
                                                            2Sem
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}