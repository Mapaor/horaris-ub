import React, { useEffect } from "react";
import styles from "../styles/YearSelector.module.css";
import { AnyAcademic } from "../lib/anyAcademic";

interface YearSelectorProps {
    anySeleccionat: number;
    anysAcademics: AnyAcademic[];
    dropdownObert: boolean;
    setDropdownObert: (obert: boolean) => void;
    handleAnyChange: (nouAny: number) => void;
}

export function YearSelector({
    anySeleccionat,
    anysAcademics,
    dropdownObert,
    setDropdownObert,
    handleAnyChange
}: YearSelectorProps) {
    
    // Tancar dropdown quan es clica fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownObert && target && !target.closest(`.${styles.dropdownWrapper}`)) {
                setDropdownObert(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownObert, setDropdownObert]);

    const anyActual = anysAcademics[0];
    const anyAnterior = anysAcademics[1];
    const restaAnys = anysAcademics.slice(2);
    
    const isRestSelected = !([anyActual?.valor, anyAnterior?.valor].includes(anySeleccionat));
    const labelDropdown = isRestSelected 
        ? (anysAcademics.find(a => a.valor === anySeleccionat)?.etiqueta || "Altres anys") 
        : "Altres anys";

    return (
        <div className={styles.yearSelectorContainer}>
            <div className={styles.segmentControl}>
                {anyActual && (
                    <button
                        className={`${styles.segmentButton} ${anySeleccionat === anyActual.valor ? styles.activeSegment : ""}`}
                        onClick={() => {
                            handleAnyChange(anyActual.valor);
                            setDropdownObert(false);
                        }}
                    >
                        {anyActual.etiqueta}
                    </button>
                )}
                
                {anyAnterior && (
                    <button
                        className={`${styles.segmentButton} ${anySeleccionat === anyAnterior.valor ? styles.activeSegment : ""}`}
                        onClick={() => {
                            handleAnyChange(anyAnterior.valor);
                            setDropdownObert(false);
                        }}
                    >
                        {anyAnterior.etiqueta}
                    </button>
                )}
                
                {restaAnys.length > 0 && (
                    <div className={styles.dropdownWrapper}>
                        <button
                            className={`${styles.segmentButton} ${styles.dropdownButton} ${isRestSelected ? styles.activeSegment : ""}`}
                            onClick={() => setDropdownObert(!dropdownObert)}
                        >
                            <span className={styles.selectedValue}>{labelDropdown}</span>
                            <span className={`${styles.arrow} ${dropdownObert ? styles.openArrow : ""}`}>▼</span>
                        </button>
                        
                        {dropdownObert && (
                            <div className={styles.dropdownMenu}>
                                {restaAnys.map((any) => (
                                    <div
                                        key={any.valor}
                                        className={`${styles.dropdownItem} ${anySeleccionat === any.valor ? styles.selected : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAnyChange(any.valor);
                                            setDropdownObert(false);
                                        }}
                                    >
                                        {any.etiqueta}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
