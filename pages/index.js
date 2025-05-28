import { useEffect, useState } from "react";
import styles from "../styles/PaginaPrincipal.module.css";

export default function Home() {
    const [itineraris, setItineraris] = useState([]);
    const [assignatures, setAssignatures] = useState([]);

    useEffect(() => {
        // Carregar les mencions des de l'API
        fetch("/api/horaris?slug=getItinerariGrau/TG1035/2024/CAT")
            .then((response) => response.json())
            .then((data) => setItineraris(data.datos))
            .catch((error) => console.error("Error en carregar les mencions:", error));
    }, []);

    const handleItinerariClick = (itinerari) => {
        // Ordenar assignatures per curs i actualitzar l'estat
        const assignaturesOrdenades = itinerari.assignatures.sort(
            (a, b) => parseInt(a.cursImparticio) - parseInt(b.cursImparticio)
        );
        setAssignatures(assignaturesOrdenades);
    };

    return (
        <div className={styles.container}>
            <h1>Horaris UB</h1>
            <div className={styles.categories}>
                {itineraris.map((itinerari) => (
                    <button
                        key={itinerari.idItinerari}
                        className={styles.categoryButton}
                        onClick={() => handleItinerariClick(itinerari)}
                    >
                        {itinerari.descItinerari}
                    </button>
                ))}
            </div>
            <div className={styles.assignatures}>
                <h2>Llistat d'assignatures</h2>
                <ul>
                    {assignatures.map((assignatura) => (
                        <li key={assignatura.idAssignatura}>
                            <a
                                href={`/${assignatura.idAssignatura}`}
                                className={styles.assignaturaLink}
                            >
                                {assignatura.descAssignatura} (Curs: {assignatura.cursImparticio})
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

