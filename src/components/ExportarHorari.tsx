import React, { useMemo } from "react";
import styles from "../styles/ExportarHorari.module.css";
import globalStyles from "../styles/PaginaPrincipal.module.css";
import { generateColorForAssignatura } from "../lib/horarisUtils";

interface ExportarHorariProps {
    cronosSelectedAssignatures: any[];
    cronosAssignaturaData: Record<string, any>;
    cronosConfig: {
        subjectColors: Record<string, string>;
        subjectAliases: Record<string, string>;
        activityAliases: Record<string, string>;
        hiddenActivities: Record<string, boolean>;
        timeSlotStyle: "standard" | "custom";
        showClassrooms: boolean;
    };
    updateSubjectColor: (id: string, color: string) => void;
    updateSubjectAlias: (id: string, alias: string) => void;
    updateActivityAlias: (activitatDesc: string, alias: string) => void;
    toggleActivityVisibility: (activitatDesc: string) => void;
    updateTimeSlotStyle: (style: "standard" | "custom") => void;
    toggleShowClassrooms: () => void;
}

const ShowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 9a3.02 3.02 0 0 0-3 3c0 1.642 1.358 3 3 3s3-1.358 3-3s-1.359-3-3-3"/>
        <path fill="currentColor" d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316l-.105-.316C21.927 11.617 19.633 5 12 5m0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5c-.504 1.158-2.578 5-7.926 5"/>
    </svg>
);

const HideIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757c-.273.021-.55.038-.841.038c-5.351 0-7.424-3.846-7.926-5a8.6 8.6 0 0 1 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379a1 1 0 0 0 0 .633C2.073 12.383 4.367 19 12 19m0-14c-1.837 0-3.346.396-4.604.981L3.707 2.293L2.293 3.707l18 18l1.414-1.414l-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657a1 1 0 0 0 0-.633C21.927 11.617 19.633 5 12 5m4.972 10.558l-2.28-2.28c.19-.39.308-.819.308-1.278c0-1.641-1.359-3-3-3c-.459 0-.888.118-1.277.309L8.915 7.501A9.3 9.3 0 0 1 12 7c5.351 0 7.424 3.846 7.926 5c-.302.692-1.166 2.342-2.954 3.558"/>
    </svg>
);

export function ExportarHorari({
    cronosSelectedAssignatures,
    cronosAssignaturaData,
    cronosConfig,
    updateSubjectColor,
    updateSubjectAlias,
    updateActivityAlias,
    toggleActivityVisibility,
    updateTimeSlotStyle,
    toggleShowClassrooms
}: ExportarHorariProps) {
    // Extreure totes les activitats úniques de les assignatures seleccionades
    const uniqueActivities = useMemo(() => {
        const activities = new Set<string>();
        cronosSelectedAssignatures.forEach(assignatura => {
            const data = cronosAssignaturaData[assignatura.idAssignatura];
            if (data && data.activitats) {
                data.activitats.forEach((act: any) => {
                    if (act.descTipusActivitat && act.descTipusActivitat !== "Exàmens") {
                        activities.add(act.descTipusActivitat);
                    }
                });
            }
        });
        return Array.from(activities).sort();
    }, [cronosSelectedAssignatures, cronosAssignaturaData]);

    if (cronosSelectedAssignatures.length === 0) {
        return (
            <div className={globalStyles.blankState} style={{ minHeight: '200px' }}>
                Selecciona assignatures primer per poder configurar la seva exportació.
            </div>
        );
    }

    return (
        <div className={styles.exportContainer}>
            
            <div className={styles.configSection}>
                <h3 className={styles.configSectionTitle}>Configuració d'Assignatures</h3>
                <p className={styles.configSectionDesc}>Personalitza el color i el nom curt (àlies) que apareixerà a l'horari final.</p>
                
                <div className={styles.configList}>
                    {cronosSelectedAssignatures.map(assignatura => {
                        const id = assignatura.idAssignatura;
                        const currentColor = cronosConfig.subjectColors[id] || generateColorForAssignatura(id);
                        const currentAlias = cronosConfig.subjectAliases[id] || "";

                        return (
                            <div key={id} className={styles.configRow}>
                                <div className={styles.configRowInfo}>
                                    <span className={styles.configRowTitle}>{assignatura.descAssignatura}</span>
                                </div>
                                <div className={styles.configRowControls}>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: FeiO, FOFT, EFis, MMA, etc."
                                        value={currentAlias}
                                        onChange={(e) => updateSubjectAlias(id, e.target.value)}
                                        className={styles.aliasInput}
                                    />
                                    <div className={styles.colorPickerWrapper}>
                                        <input 
                                            type="color" 
                                            value={currentColor}
                                            onChange={(e) => updateSubjectColor(id, e.target.value)}
                                            className={styles.nativeColorInput}
                                        />
                                        <div 
                                            className={styles.colorPickerDisplay} 
                                            style={{ backgroundColor: currentColor }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {uniqueActivities.length > 0 && (
                <div className={styles.configSection}>
                    <h3 className={styles.configSectionTitle}>Configuració d'Activitats</h3>
                    <p className={styles.configSectionDesc}>Escull com vols que es mostrin els tipus de classe per estalviar espai.</p>
                    
                    <div className={styles.configList}>
                        {uniqueActivities.map(activity => {
                            const currentAlias = cronosConfig.activityAliases[activity] || "";
                            const isHidden = !!cronosConfig.hiddenActivities[activity];
                            
                            return (
                                <div key={activity} className={`${styles.configRow} ${isHidden ? styles.configRowHidden : ''}`}>
                                    <div className={styles.configRowInfo}>
                                        <span className={styles.configRowTitle}>{activity}</span>
                                    </div>
                                    <div className={styles.configRowControls}>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Lab, Teoria..."
                                            value={currentAlias}
                                            onChange={(e) => updateActivityAlias(activity, e.target.value)}
                                            className={styles.aliasInput}
                                            disabled={isHidden}
                                        />
                                        <button 
                                            className={styles.visibilityToggleBtn}
                                            onClick={() => toggleActivityVisibility(activity)}
                                            title={isHidden ? "Mostrar a l'horari" : "Ocultar a l'horari"}
                                        >
                                            {isHidden ? <HideIcon /> : <ShowIcon />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

             <div className={styles.configSection}>
                <h3 className={styles.configSectionTitle}>Configuració Franges Horàries</h3>
                <p className={styles.configSectionDesc}>
                    Tria l'escala de temps que vols que es mostri al lateral de l'horari visual.
                </p>
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px', gap: '4px', width: '100%' }}>
                    <button 
                        style={{ 
                            flex: 1,
                            padding: '12px 16px', 
                            borderRadius: '6px', 
                            border: 'none', 
                            fontSize: '14px', 
                            color: (cronosConfig.timeSlotStyle === "standard" || !cronosConfig.timeSlotStyle) ? '#0078d4' : '#475569', 
                            backgroundColor: (cronosConfig.timeSlotStyle === "standard" || !cronosConfig.timeSlotStyle) ? 'white' : 'transparent',
                            boxShadow: (cronosConfig.timeSlotStyle === "standard" || !cronosConfig.timeSlotStyle) ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => updateTimeSlotStyle("standard")}
                    >
                        8:00, 9:00, 10:00, 11:00...
                    </button>
                    <button 
                        style={{ 
                            flex: 1,
                            padding: '12px 16px', 
                            borderRadius: '6px', 
                            border: 'none', 
                            fontSize: '14px', 
                            color: cronosConfig.timeSlotStyle === "custom" ? '#0078d4' : '#475569', 
                            backgroundColor: cronosConfig.timeSlotStyle === "custom" ? 'white' : 'transparent',
                            boxShadow: cronosConfig.timeSlotStyle === "custom" ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => updateTimeSlotStyle("custom")}
                    >
                        8:30, 9:30, 10:45, 11:45...
                    </button>
                </div>
            </div>

             <div className={styles.configSection}>
                <h3 className={styles.configSectionTitle}>Altres Opcions</h3>
                <div className={styles.configRow}>
                    <div className={styles.configRowInfo} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={styles.configRowTitle}>Mostrar Aules</span>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Mostra l'aula on s'imparteix la classe al costat del tipus d'activitat.</span>
                    </div>
                    <div className={styles.configRowControls}>
                        <div 
                            style={{
                                width: '44px',
                                height: '24px',
                                backgroundColor: cronosConfig.showClassrooms ? '#0078d4' : '#cbd5e1',
                                borderRadius: '12px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onClick={toggleShowClassrooms}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: cronosConfig.showClassrooms ? '22px' : '2px',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
