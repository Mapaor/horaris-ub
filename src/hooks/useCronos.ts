import { useState } from "react";
import { generateColorForAssignatura } from "../lib/horarisUtils";

export function useCronos(anySeleccionat: number) {
    const [cronosMode, setCronosMode] = useState<"seleccionar" | "mostrar" | "dissenyar">("seleccionar");
    const [cronosSemestre, setCronosSemestre] = useState<"1" | "2">("1");
    const [cronosSearchQuery, setCronosSearchQuery] = useState("");
    
    // Separem l'estat per semestre
    const [cronosSelectedAssignatures, setCronosSelectedAssignatures] = useState<Record<"1" | "2", any[]>>({ "1": [], "2": [] });
    const [cronosSelectedGroups, setCronosSelectedGroups] = useState<Record<"1" | "2", Record<string, Record<string, string>>>>({ "1": {}, "2": {} });
    const [cronosAssignaturaGroups, setCronosAssignaturaGroups] = useState<Record<"1" | "2", Record<string, Record<string, string[]>>>>({ "1": {}, "2": {} });
    // Guardem tot el payload per poder recuperar horaris
    const [cronosAssignaturaData, setCronosAssignaturaData] = useState<Record<"1" | "2", Record<string, any>>>({ "1": {}, "2": {} });
    // Configuració per exportació (colors, àlies)
    const [cronosConfig, setCronosConfig] = useState<Record<"1" | "2", {
        subjectColors: Record<string, string>;
        subjectAliases: Record<string, string>;
        activityAliases: Record<string, string>;
        hiddenActivities: Record<string, boolean>;
        timeSlotStyle: "standard" | "custom";
        showClassrooms: boolean;
    }>>({ 
        "1": { subjectColors: {}, subjectAliases: {}, activityAliases: {}, hiddenActivities: {}, timeSlotStyle: "standard", showClassrooms: false }, 
        "2": { subjectColors: {}, subjectAliases: {}, activityAliases: {}, hiddenActivities: {}, timeSlotStyle: "standard", showClassrooms: false } 
    });

    const handleSelectAssignatura = async (assignatura: any) => {
        setCronosSelectedAssignatures(prev => ({
            ...prev,
            [cronosSemestre]: [...prev[cronosSemestre], assignatura]
        }));
        setCronosSearchQuery("");

        if (!cronosAssignaturaGroups[cronosSemestre][assignatura.idAssignatura]) {
            try {
                const res = await fetch(`/api/horaris?slug=getPlanificacioAssignatura/${assignatura.idAssignatura}/TG1035/${anySeleccionat}/${cronosSemestre}/CAT`);
                const data = await res.json();
                const assignaturaPayload = data.datos?.assignatura || {};
                const activitats = assignaturaPayload.activitats || [];
                
                // Guardem el payload complet
                setCronosAssignaturaData(prev => ({
                    ...prev,
                    [cronosSemestre]: {
                        ...prev[cronosSemestre],
                        [assignatura.idAssignatura]: assignaturaPayload
                    }
                }));
                
                const groupedByActivity: Record<string, string[]> = {};
                const initialSelected: Record<string, string> = {};

                activitats.forEach((act: any) => {
                    if (act.descTipusActivitat && act.descTipusActivitat !== "Exàmens") {
                        const uniqueGroups = new Set<string>();
                        act.grups?.forEach((grup: any) => {
                            if (grup.sigles) uniqueGroups.add(grup.sigles);
                        });
                        const groupsArray = Array.from(uniqueGroups).sort();
                        if (groupsArray.length > 0) {
                            groupedByActivity[act.descTipusActivitat] = groupsArray;
                            initialSelected[act.descTipusActivitat] = groupsArray[0];
                        }
                    }
                });
                
                setCronosAssignaturaGroups(prev => ({
                    ...prev,
                    [cronosSemestre]: {
                        ...prev[cronosSemestre],
                        [assignatura.idAssignatura]: groupedByActivity
                    }
                }));
                
                if (Object.keys(initialSelected).length > 0) {
                    setCronosSelectedGroups(prev => ({
                        ...prev,
                        [cronosSemestre]: {
                            ...prev[cronosSemestre],
                            [assignatura.idAssignatura]: initialSelected
                        }
                    }));
                }
            } catch (error) {
                console.error("Error fetching groups for", assignatura.idAssignatura, error);
                setCronosAssignaturaGroups(prev => ({
                    ...prev,
                    [cronosSemestre]: {
                        ...prev[cronosSemestre],
                        [assignatura.idAssignatura]: {}
                    }
                }));
            }
        }
    };

    const removeAssignatura = (idAssignatura: string) => {
        setCronosSelectedAssignatures(prev => ({
            ...prev,
            [cronosSemestre]: prev[cronosSemestre].filter(a => a.idAssignatura !== idAssignatura)
        }));
    };

    const updateSelectedGroup = (idAssignatura: string, activitatDesc: string, grup: string) => {
        setCronosSelectedGroups(prev => ({
            ...prev,
            [cronosSemestre]: {
                ...prev[cronosSemestre],
                [idAssignatura]: {
                    ...(prev[cronosSemestre][idAssignatura] || {}),
                    [activitatDesc]: grup
                }
            }
        }));
    };

    const updateSubjectColor = (idAssignatura: string, color: string) => {
        setCronosConfig(prev => ({
            ...prev,
            [cronosSemestre]: {
                ...prev[cronosSemestre],
                subjectColors: {
                    ...prev[cronosSemestre].subjectColors,
                    [idAssignatura]: color
                }
            }
        }));
    };

    const updateSubjectAlias = (idAssignatura: string, alias: string) => {
        setCronosConfig(prev => ({
            ...prev,
            [cronosSemestre]: {
                ...prev[cronosSemestre],
                subjectAliases: {
                    ...prev[cronosSemestre].subjectAliases,
                    [idAssignatura]: alias
                }
            }
        }));
    };

    const updateActivityAlias = (activitatDesc: string, alias: string) => {
        setCronosConfig(prev => ({
            ...prev,
            [cronosSemestre]: {
                ...prev[cronosSemestre],
                activityAliases: {
                    ...prev[cronosSemestre].activityAliases,
                    [activitatDesc]: alias
                }
            }
        }));
    };

    const toggleActivityVisibility = (activitatDesc: string) => {
        setCronosConfig(prev => {
            const currentHidden = !!prev[cronosSemestre].hiddenActivities[activitatDesc];
            return {
                ...prev,
                [cronosSemestre]: {
                    ...prev[cronosSemestre],
                    hiddenActivities: {
                        ...prev[cronosSemestre].hiddenActivities,
                        [activitatDesc]: !currentHidden
                    }
                }
            };
        });
    };

    const updateTimeSlotStyle = (style: "standard" | "custom") => {
        setCronosConfig(prev => ({
            ...prev,
            [cronosSemestre]: {
                ...prev[cronosSemestre],
                timeSlotStyle: style
            }
        }));
    };

    const toggleShowClassrooms = () => {
        setCronosConfig(prev => ({
            ...prev,
            [cronosSemestre]: {
                ...prev[cronosSemestre],
                showClassrooms: !prev[cronosSemestre].showClassrooms
            }
        }));
    };

    // Helper per obtenir les dades només del semestre actiu
    const activeSelectedAssignatures = cronosSelectedAssignatures[cronosSemestre];
    const activeSelectedGroups = cronosSelectedGroups[cronosSemestre];
    const activeAssignaturaGroups = cronosAssignaturaGroups[cronosSemestre];
    const activeAssignaturaData = cronosAssignaturaData[cronosSemestre];
    const activeCronosConfig = cronosConfig[cronosSemestre];

    return {
        cronosMode, setCronosMode,
        cronosSemestre, setCronosSemestre,
        cronosSearchQuery, setCronosSearchQuery,
        // Retornem només els del semestre actiu per facilitar la renderització
        cronosSelectedAssignatures: activeSelectedAssignatures,
        cronosSelectedGroups: activeSelectedGroups,
        cronosAssignaturaGroups: activeAssignaturaGroups,
        cronosAssignaturaData: activeAssignaturaData,
        cronosConfig: activeCronosConfig,
        // Funcions manipuladores
        handleSelectAssignatura,
        removeAssignatura,
        updateSelectedGroup,
        updateSubjectColor,
        updateSubjectAlias,
        updateActivityAlias,
        toggleActivityVisibility,
        updateTimeSlotStyle,
        toggleShowClassrooms
    };
}
