import React from "react";
import styles from "../styles/CronosTab.module.css";
import globalStyles from "../styles/PaginaPrincipal.module.css";
import Link from "next/link";
import { HorariView } from "./HorariView";
import { ExportarHorari } from "./ExportarHorari";

interface CronosTabProps {
    cronosMode: "seleccionar" | "mostrar" | "dissenyar";
    setCronosMode: (mode: "seleccionar" | "mostrar" | "dissenyar") => void;
    cronosSemestre: "1" | "2";
    setCronosSemestre: (semestre: "1" | "2") => void;
    cronosSearchQuery: string;
    setCronosSearchQuery: (query: string) => void;
    cronosFilteredAssignatures: any[];
    handleSelectAssignatura: (assignatura: any) => void;
    cronosSelectedAssignatures: any[];
    removeAssignatura: (idAssignatura: string) => void;
    cronosAssignaturaGroups: Record<string, Record<string, string[]>>;
    cronosSelectedGroups: Record<string, Record<string, string>>;
    cronosAssignaturaData: Record<string, any>;
    cronosConfig: {
        subjectColors: Record<string, string>;
        subjectAliases: Record<string, string>;
        activityAliases: Record<string, string>;
        hiddenActivities: Record<string, boolean>;
        timeSlotStyle: "standard" | "custom";
        showClassrooms: boolean;
    };
    updateSelectedGroup: (idAssignatura: string, activitatDesc: string, grup: string) => void;
    updateSubjectColor: (id: string, color: string) => void;
    updateSubjectAlias: (id: string, alias: string) => void;
    updateActivityAlias: (activitatDesc: string, alias: string) => void;
    toggleActivityVisibility: (activitatDesc: string) => void;
    updateTimeSlotStyle: (style: "standard" | "custom") => void;
    toggleShowClassrooms: () => void;
    importCronosState: (data: any) => Promise<void>;
}

export function CronosTab({
    cronosMode, setCronosMode,
    cronosSemestre, setCronosSemestre,
    cronosSearchQuery, setCronosSearchQuery,
    cronosFilteredAssignatures, handleSelectAssignatura,
    cronosSelectedAssignatures, removeAssignatura,
    cronosAssignaturaGroups, cronosSelectedGroups, 
    cronosAssignaturaData, cronosConfig,
    updateSelectedGroup, updateSubjectColor,
    updateSubjectAlias, updateActivityAlias,
    toggleActivityVisibility, updateTimeSlotStyle,
    toggleShowClassrooms, importCronosState
}: CronosTabProps) {
    return (
        <div className={styles.cronosContainer}>
            <div className={styles.cronosModeSelectorWrapper}>
                <div className={styles.cronosModeSegmentControl}>
                    <button
                        className={`${styles.cronosModeSegmentButton} ${cronosMode === "seleccionar" ? styles.activeCronosModeSegment : ""}`}
                        onClick={() => setCronosMode("seleccionar")}
                        style={{ width: '33.33%' }}
                    >
                        Seleccionar Assignatures
                    </button>
                    <button
                        className={`${styles.cronosModeSegmentButton} ${cronosMode === "dissenyar" ? styles.activeCronosModeSegment : ""}`}
                        onClick={() => setCronosMode("dissenyar")}
                        style={{ width: '33.33%' }}
                    >
                        Dissenyar Horari
                    </button>
                    <button
                        className={`${styles.cronosModeSegmentButton} ${cronosMode === "mostrar" ? styles.activeCronosModeSegment : ""}`}
                        onClick={() => setCronosMode("mostrar")}
                        style={{ width: '33.33%' }}
                    >
                        Mostrar Horari
                    </button>
                </div>
            </div>

            {cronosMode === "seleccionar" && (
                <>
                    <div className={styles.searchSection}>
                        <div className={styles.smallSegmentControl}>
                            <button
                                className={`${styles.smallSegmentButton} ${cronosSemestre === "1" ? styles.activeSmallSegment : ""}`}
                                onClick={() => setCronosSemestre("1")}
                            >
                                Sem 1
                            </button>
                            <button
                                className={`${styles.smallSegmentButton} ${cronosSemestre === "2" ? styles.activeSmallSegment : ""}`}
                                onClick={() => setCronosSemestre("2")}
                            >
                                Sem 2
                            </button>
                        </div>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                placeholder="Cerca assignatures..." 
                                value={cronosSearchQuery}
                                onChange={(e) => setCronosSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            {cronosSearchQuery && cronosFilteredAssignatures.length > 0 && (
                                <div className={styles.searchResults}>
                                    {cronosFilteredAssignatures.map(assignatura => (
                                        <div 
                                            key={assignatura.idAssignatura} 
                                            className={styles.searchResultItem}
                                            onClick={() => handleSelectAssignatura(assignatura)}
                                        >
                                            {assignatura.descAssignatura}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {cronosSearchQuery && cronosFilteredAssignatures.length === 0 && (
                                <div className={styles.searchResults}>
                                    <div className={styles.searchResultItem} style={{ color: '#888', cursor: 'default' }}>
                                        Cap assignatura trobada
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.selectedAssignaturesContainer}>
                        {cronosSelectedAssignatures.length === 0 ? (
                            <div className={globalStyles.blankState} style={{ minHeight: '100px', marginTop: 20 }}>
                                Busca i afegeix assignatures per crear el teu horari.
                            </div>
                        ) : (
                            <ul className={styles.selectedList}>
                                {cronosSelectedAssignatures.map(assignatura => (
                                    <li key={assignatura.idAssignatura} className={styles.selectedItem}>
                                        <div className={styles.selectedItemHeader}>
                                            <span className={styles.selectedItemName}>{assignatura.descAssignatura}</span>
                                            <button 
                                                className={styles.removeButton}
                                                onClick={() => removeAssignatura(assignatura.idAssignatura)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className={styles.selectedItemActions}>
                                            <div className={styles.groupSelectorContainer}>
                                                {!cronosAssignaturaGroups[assignatura.idAssignatura] ? (
                                                    <span style={{ fontSize: '13px', padding: '6px 12px', color: '#94a3b8' }}>Carregant activitats...</span>
                                                ) : Object.keys(cronosAssignaturaGroups[assignatura.idAssignatura]).length === 0 ? (
                                                    <span style={{ fontSize: '13px', padding: '6px 12px', color: '#94a3b8' }}>Sense grups</span>
                                                ) : (
                                                    Object.entries(cronosAssignaturaGroups[assignatura.idAssignatura]).map(([activitatDesc, groupsArray]) => (
                                                        <div key={activitatDesc} className={styles.activityGroupBlock}>
                                                            <span className={styles.activityGroupLabel}>{activitatDesc}</span>
                                                            <div className={styles.groupSegmentControl}>
                                                                {groupsArray.map(grup => {
                                                                    const assignaturaSelected = cronosSelectedGroups[assignatura.idAssignatura] || {};
                                                                    const isActiu = assignaturaSelected[activitatDesc] === grup;
                                                                    return (
                                                                        <button
                                                                            key={grup}
                                                                            className={`${styles.groupSegmentButton} ${isActiu ? styles.activeGroupSegment : ""}`}
                                                                            onClick={() => updateSelectedGroup(assignatura.idAssignatura, activitatDesc, grup)}
                                                                        >
                                                                            {grup}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <Link 
                                                href={`/${assignatura.idAssignatura}/${cronosSemestre}`} 
                                                className={styles.horariLinkBtn}
                                            >
                                                Consultar Horaris
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}

            {cronosMode === "mostrar" && (
                <div className={styles.selectedAssignaturesContainer}>
                    <div className={styles.searchSection} style={{ maxWidth: '100%', marginTop: 0 }}>
                        <div className={styles.smallSegmentControl}>
                            <button
                                className={`${styles.smallSegmentButton} ${cronosSemestre === "1" ? styles.activeSmallSegment : ""}`}
                                onClick={() => setCronosSemestre("1")}
                            >
                                Sem 1
                            </button>
                            <button
                                className={`${styles.smallSegmentButton} ${cronosSemestre === "2" ? styles.activeSmallSegment : ""}`}
                                onClick={() => setCronosSemestre("2")}
                            >
                                Sem 2
                            </button>
                        </div>
                    </div>
                    <HorariView 
                        cronosSelectedAssignatures={cronosSelectedAssignatures}
                        cronosSelectedGroups={cronosSelectedGroups}
                        cronosAssignaturaData={cronosAssignaturaData}
                        cronosConfig={cronosConfig}
                        cronosSemestre={cronosSemestre}
                        importCronosState={importCronosState}
                    />
                </div>
            )}

            {cronosMode === "dissenyar" && (
                <div className={styles.selectedAssignaturesContainer}>
                    <div className={styles.searchSection} style={{ maxWidth: '100%', marginTop: 0 }}>
                        <div className={styles.smallSegmentControl}>
                            <button
                                className={`${styles.smallSegmentButton} ${cronosSemestre === "1" ? styles.activeSmallSegment : ""}`}
                                onClick={() => setCronosSemestre("1")}
                            >
                                Sem 1
                            </button>
                            <button
                                className={`${styles.smallSegmentButton} ${cronosSemestre === "2" ? styles.activeSmallSegment : ""}`}
                                onClick={() => setCronosSemestre("2")}
                            >
                                Sem 2
                            </button>
                        </div>
                    </div>
                    <ExportarHorari 
                        cronosSelectedAssignatures={cronosSelectedAssignatures}
                        cronosAssignaturaData={cronosAssignaturaData}
                        cronosConfig={cronosConfig}
                        updateSubjectColor={updateSubjectColor}
                        updateSubjectAlias={updateSubjectAlias}
                        updateActivityAlias={updateActivityAlias}
                        toggleActivityVisibility={toggleActivityVisibility}
                        updateTimeSlotStyle={updateTimeSlotStyle}
                        toggleShowClassrooms={toggleShowClassrooms}
                    />
                </div>
            )}
        </div>
    );
}
