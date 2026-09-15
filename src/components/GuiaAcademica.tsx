import React, { useState } from "react";
import styles from "../styles/GuiaAcademica.module.css";
import Link from "next/link";

interface GuiaAcademicaProps {
    assignaturesPerCurs: Record<string, Record<string, any[]>>;
    nomsCursos: Record<string, string>;
}

export function GuiaAcademica({ assignaturesPerCurs, nomsCursos }: GuiaAcademicaProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const queryNormalized = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    return (
        <div className={styles.assignatures}>
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="Cerca assignatures..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {Object.keys(assignaturesPerCurs).map((curs) => {
                const cursData = assignaturesPerCurs[curs];
                const filteredTipus = Object.keys(cursData).map(tipus => {
                    const assignaturesTipus = cursData[tipus].filter(a => {
                        if (!searchQuery) return true;
                        const subjectNormalized = a.descAssignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        return subjectNormalized.includes(queryNormalized);
                    });
                    return { tipus, assignatures: assignaturesTipus };
                }).filter(t => t.assignatures.length > 0);
                
                if (filteredTipus.length === 0) return null;

                return (
                    <div key={curs}>
                        <h3 className={styles.cursSeccio}>{nomsCursos[curs] || curs}</h3>
                        {filteredTipus.map(({ tipus, assignatures }) => (
                            <div key={tipus}>
                                <h4>{tipus}</h4>
                                <ul>
                                    {assignatures.map((assignatura) => (
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
                );
            })}
        </div>
    );
}
