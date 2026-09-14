"use client";

import { useEffect, useState } from "react";
import styles from "../styles/PaginaPrincipal.module.css";
import { getAnySeleccionat, generaAnysAcademics, AnyAcademic } from "../lib/anyAcademic";
import Link from "next/link";

export default function Home() {
    const [assignaturesPerCurs, setAssignaturesPerCurs] = useState<Record<string, Record<string, any[]>>>({});
    const [anySeleccionat, setAnySeleccionat] = useState<number>(0);
    const [dropdownObert, setDropdownObert] = useState(false);
    const [anysAcademics, setAnysAcademics] = useState<AnyAcademic[]>([]);

    useEffect(() => {
        setAnySeleccionat(getAnySeleccionat());
        setAnysAcademics(generaAnysAcademics());
    }, []);

    const nomsCursos: Record<string, string> = {
        1: "1r",
        2: "2n",
        3: "3r",
        4: "4t",
        Altres: "Altres"
    };

    const handleAnyChange = (nouAny: number) => {
        setAnySeleccionat(nouAny);
        setDropdownObert(false);
        // Guardar l'any seleccionat al localStorage només quan es canvia
        localStorage.setItem('anySeleccionat', nouAny.toString());
        // Recarregar dades amb el nou any
        fetch(`/api/horaris?slug=getItinerariGrau/TG1035/${nouAny}/CAT`)
            .then((response) => response.json())
            .then((data) => {
                const itinerariPerDefecte = data.datos.find(
                    (itinerari: any) => itinerari.descItinerari === "Menció en Física Fonamental"
                );
                if (itinerariPerDefecte) {
                    agrupaAssignatures(itinerariPerDefecte.assignatures);
                } else if (data.datos.length > 0) {
                    agrupaAssignatures(data.datos[0].assignatures);
                }
            })
            .catch((error) => console.error("Error en carregar els itineraris:", error));
    };

    useEffect(() => {
        if (!anySeleccionat) return;
        fetch(`/api/horaris?slug=getItinerariGrau/TG1035/${anySeleccionat}/CAT`)
            .then((response) => response.json())
            .then((data) => {
                const itinerariPerDefecte = data.datos.find(
                    (itinerari: any) => itinerari.descItinerari === "Menció en Física Fonamental"
                );
                if (itinerariPerDefecte) {
                    agrupaAssignatures(itinerariPerDefecte.assignatures);
                } else if (data.datos.length > 0) {
                    agrupaAssignatures(data.datos[0].assignatures);
                }
            })
            .catch((error) => console.error("Error en carregar els itineraris:", error));
    }, [anySeleccionat]);

    // Tancar dropdown quan es clica fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownObert && target && !target.closest(`.${styles.yearSelectorContainer}`)) {
                setDropdownObert(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownObert]);

    const agrupaAssignatures = (assignatures: any[]) => {
        const agrupades = assignatures.reduce((acc, assignatura) => {
            const curs = assignatura.cursImparticio || "Altres";
            const tipus = assignatura.descTipusAssignatura || "Sense tipus";
            if (!acc[curs]) acc[curs] = {};
            if (!acc[curs][tipus]) acc[curs][tipus] = [];
            acc[curs][tipus].push(assignatura);
            return acc;
        }, {} as Record<string, Record<string, any[]>>);

        // Ordenem les assignatures per tenir abans les obligatòries
        Object.keys(agrupades).forEach((curs) => {
            agrupades[curs] = Object.keys(agrupades[curs])
                .sort((a, b) => {
                    if (a === "Obligatòria de grau") return -1;
                    if (b === "Obligatòria de grau") return 1;
                    return 0;
                })
                .reduce((acc: any, tipus) => {
                    acc[tipus] = agrupades[curs][tipus];
                    return acc;
                }, {});
        });

        setAssignaturesPerCurs(agrupades);
    };



    if (!anySeleccionat) {
        return <div>Carregant...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Horaris Física UB</h1>
            <div className={styles.categories}>
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
                {Object.keys(assignaturesPerCurs).map((curs) => (
                    <div key={curs}>
                        <h3 className={styles.cursSeccio}>{nomsCursos[curs] || curs}</h3>
                        {Object.keys(assignaturesPerCurs[curs]).map((tipus) => (
                            <div key={tipus}>
                                <h4>{tipus}</h4>
                                <ul>
                                    {assignaturesPerCurs[curs][tipus].map((assignatura) => (
                                        <li key={assignatura.idAssignatura} className={styles.assignaturaItem}>
                                            <Link
                                                href={`/${assignatura.idAssignatura}`}
                                                className={styles.assignaturaLink}
                                            >
                                                {assignatura.descAssignatura}
                                            </Link>
                                            <div className={styles.semestreButtons}>
                                                <div style={{ flex: 1, textAlign: "left" }}>
                                                    {assignatura.teOfertaSem1 && (
                                                        <Link
                                                            href={`/${assignatura.idAssignatura}/1`}
                                                            className={styles.semestreButtonSmall}
                                                        >
                                                            1Sem
                                                        </Link>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, textAlign: "right" }}>
                                                    {assignatura.teOfertaSem2 && (
                                                        <Link
                                                            href={`/${assignatura.idAssignatura}/2`}
                                                            className={styles.semestreButtonSmall}
                                                        >
                                                            2Sem
                                                        </Link>
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
