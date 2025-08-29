import { useEffect, useState } from "react";
import styles from "../styles/PaginaPrincipal.module.css";
import { getAnySeleccionat, generaAnysAcademics } from "../lib/anyAcademic";

export default function Home() {
    const [itineraris, setItineraris] = useState([]);
    const [assignaturesPerCurs, setAssignaturesPerCurs] = useState({});
    const [itinerariActiu, setItinerariActiu] = useState(null);
    const [anySeleccionat, setAnySeleccionat] = useState(getAnySeleccionat());
    const [dropdownObert, setDropdownObert] = useState(false);

    const nomsCursos = {
        1: "1r",
        2: "2n",
        3: "3r",
        4: "4t",
        Altres: "Altres"
    };

    const anysAcademics = generaAnysAcademics();

    const handleAnyChange = (nouAny) => {
        setAnySeleccionat(nouAny);
        setDropdownObert(false);
        // Guardar l'any seleccionat al localStorage només quan es canvia
        localStorage.setItem('anySeleccionat', nouAny.toString());
        // Recarregar dades amb el nou any
        fetch(`/api/horaris?slug=getItinerariGrau/TG1035/${nouAny}/CAT`)
            .then((response) => response.json())
            .then((data) => {
                setItineraris(data.datos);
                const itinerariPerDefecte = data.datos.find(
                    (itinerari) => itinerari.descItinerari === "Menció en Física Fonamental"
                );
                if (itinerariPerDefecte) {
                    setItinerariActiu(itinerariPerDefecte.idItinerari);
                    agrupaAssignatures(itinerariPerDefecte.assignatures);
                } else if (data.datos.length > 0) {
                    setItinerariActiu(data.datos[0].idItinerari);
                    agrupaAssignatures(data.datos[0].assignatures);
                }
            })
            .catch((error) => console.error("Error en carregar els itineraris:", error));
    };

    useEffect(() => {
        fetch(`/api/horaris?slug=getItinerariGrau/TG1035/${anySeleccionat}/CAT`)
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
    }, [anySeleccionat]);

    // Tancar dropdown quan es clica fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownObert && !event.target.closest(`.${styles.yearSelectorContainer}`)) {
                setDropdownObert(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownObert]);

    const agrupaAssignatures = (assignatures) => {
        const agrupades = assignatures.reduce((acc, assignatura) => {
            const curs = assignatura.cursImparticio || "Altres";
            const tipus = assignatura.descTipusAssignatura || "Sense tipus";
            if (!acc[curs]) acc[curs] = {};
            if (!acc[curs][tipus]) acc[curs][tipus] = [];
            acc[curs][tipus].push(assignatura);
            return acc;
        }, {});

        // Ordenem les assignatures per tenir abans les obligatòries
        Object.keys(agrupades).forEach((curs) => {
            agrupades[curs] = Object.keys(agrupades[curs])
                .sort((a, b) => {
                    if (a === "Obligatòria de grau") return -1;
                    if (b === "Obligatòria de grau") return 1;
                    return 0;
                })
                .reduce((acc, tipus) => {
                    acc[tipus] = agrupades[curs][tipus];
                    return acc;
                }, {});
        });

        setAssignaturesPerCurs(agrupades);
    };

    const handleItinerariClick = (itinerari) => {
        setItinerariActiu(itinerari.idItinerari);
        agrupaAssignatures(itinerari.assignatures);
    };

    return (
        <div className={styles.container}>
            <h1>Horaris Física UB</h1>
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
                <div className={styles.yearSelectorContainer}>
                    <div 
                        className={`${styles.customSelector} ${dropdownObert ? styles.open : ''}`}
                        onClick={() => setDropdownObert(!dropdownObert)}
                    >
                        <span className={styles.selectedValue}>
                            {anysAcademics.find(any => any.valor === anySeleccionat)?.etiqueta || 'Selecciona any'}
                        </span>
                        <span className={styles.arrow}>▼</span>
                        {dropdownObert && (
                            <div className={styles.dropdownMenu}>
                                {anysAcademics.map((any) => (
                                    <div
                                        key={any.valor}
                                        className={`${styles.dropdownItem} ${anySeleccionat === any.valor ? styles.selected : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAnyChange(any.valor);
                                        }}
                                    >
                                        {any.etiqueta}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.assignatures}>
                {/* <h2 className={styles.titolBuit}>Llistat d'assignatures</h2> */}
                {Object.keys(assignaturesPerCurs).map((curs) => (
                    <div key={curs}>
                        <h3 className={styles.cursSeccio}>{nomsCursos[curs] || curs}</h3>
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
            <footer className={styles.footer}>
                <a
                    className={styles.github}
                    href="https://github.com/Mapaor/horaris-ub"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block" }}
                >
                    <i className="fab fa-github"></i>
                </a>
            </footer>
        </div>
    );
}

export async function getStaticProps() {
    // No utilitzem cap any específic aquí ja que les dades es carreguen dinàmicament
    return {
        props: {},
        revalidate: 2592000 // Recarreguem la info un cop al mes
    };
}