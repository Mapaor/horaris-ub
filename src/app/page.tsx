"use client";

import { useEffect, useState } from "react";
import styles from "../styles/PaginaPrincipal.module.css";
import { getAnySeleccionat, generaAnysAcademics, AnyAcademic } from "../lib/anyAcademic";

// Hooks
import { useAssignaturesData } from "../hooks/useAssignaturesData";
import { useCronos } from "../hooks/useCronos";

// Components
import { MainTabs } from "../components/MainTabs";
import { YearSelector } from "../components/YearSelector";
import { GuiaAcademica } from "../components/GuiaAcademica";
import { CronosTab } from "../components/CronosTab";

export default function Home() {
    const [anySeleccionat, setAnySeleccionat] = useState<number>(0);
    const [dropdownObert, setDropdownObert] = useState(false);
    const [anysAcademics, setAnysAcademics] = useState<AnyAcademic[]>([]);
    const [pestanyaActiva, setPestanyaActiva] = useState<"guia" | "cronos" | "planificacio">("guia");

    useEffect(() => {
        setAnySeleccionat(getAnySeleccionat());
        setAnysAcademics(generaAnysAcademics());
    }, []);

    const handleAnyChange = (nouAny: number) => {
        setAnySeleccionat(nouAny);
        setDropdownObert(false);
        localStorage.setItem('anySeleccionat', nouAny.toString());
    };

    const nomsCursos: Record<string, string> = {
        1: "1r",
        2: "2n",
        3: "3r",
        4: "4t",
        Altres: "Altres"
    };

    const { assignaturesPerCurs, allAssignatures } = useAssignaturesData(anySeleccionat);
    
    const cronosState = useCronos(anySeleccionat);

    const cronosFilteredAssignatures = allAssignatures.filter(a => {
        if (!cronosState.cronosSearchQuery) return false;
        
        const queryNormalized = cronosState.cronosSearchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const subjectNormalized = a.descAssignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const matchesName = subjectNormalized.includes(queryNormalized);
        const hasSemesterOffer = cronosState.cronosSemestre === "1" ? a.teOfertaSem1 : a.teOfertaSem2;
        const isSelected = cronosState.cronosSelectedAssignatures.some(sel => sel.idAssignatura === a.idAssignatura);
        return matchesName && hasSemesterOffer && !isSelected;
    });

    if (!anySeleccionat) {
        return <div>Carregant...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Horaris Física UB</h1>
            
            <MainTabs 
                pestanyaActiva={pestanyaActiva} 
                setPestanyaActiva={setPestanyaActiva} 
            />

            {pestanyaActiva === "guia" && (
                <>
                    <YearSelector
                        anySeleccionat={anySeleccionat}
                        anysAcademics={anysAcademics}
                        dropdownObert={dropdownObert}
                        setDropdownObert={setDropdownObert}
                        handleAnyChange={handleAnyChange}
                    />
                    <GuiaAcademica 
                        assignaturesPerCurs={assignaturesPerCurs}
                        nomsCursos={nomsCursos}
                    />
                </>
            )}

            {pestanyaActiva === "cronos" && (
                <CronosTab 
                    {...cronosState}
                    cronosFilteredAssignatures={cronosFilteredAssignatures}
                    cronosAssignaturaData={cronosState.cronosAssignaturaData}
                />
            )}

            {pestanyaActiva === "planificacio" && (
                <div className={styles.blankState}>
                    {/* En desenvolupament */}
                </div>
            )}

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
