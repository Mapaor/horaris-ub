import { useState } from "react";
import { getAnyAcademicPerDefecte } from "../lib/anyAcademic";
import { formatExamsObject, formatHorariInline } from "../lib/planificacioUtils";
import styles from "../styles/PlanificacioTab.module.css";

export const usePlanificacio = (allAssignatures: any[]) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
    const [dragOverSemestre, setDragOverSemestre] = useState<"1" | "2" | null>(null);
    const [draggingSubjectId, setDraggingSubjectId] = useState<string | null>(null);
    const [dragOverSubjectId, setDragOverSubjectId] = useState<string | null>(null);
    const [calendarSemestreOpen, setCalendarSemestreOpen] = useState<"1" | "2" | null>(null);

    const filteredAssignatures = allAssignatures.filter(a => {
        if (!searchQuery) return false;
        const queryNormalized = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const subjectNormalized = a.descAssignatura.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const isSelected = selectedSubjects.some(sel => sel.idAssignatura === a.idAssignatura);
        return subjectNormalized.includes(queryNormalized) && !isSelected;
    });

    const fetchSubjectInfo = async (idAssignatura: string, semestre: "1" | "2") => {
        try {
            const anySeleccionat = getAnyAcademicPerDefecte();
            const res = await fetch(`/api/horaris?slug=getPlanificacioAssignatura/${idAssignatura}/TG1035/${anySeleccionat}/${semestre}/CAT`);
            if (!res.ok) return { examFinal: "Error al carregar exàmens", examRecup: "", finalDates: [], recupDates: [], teoriaInfo: [] };
            const data = await res.json();
            const activitats = data.datos.assignatura?.activitats || [];
                
            // Exàmens
            const examens = activitats.filter((act: any) => act.descTipusActivitat === "Exàmens");
            let examStrings: string[] = [];
            examens.forEach((exam: any) => {
                if (exam.grups) {
                    exam.grups.forEach((grup: any) => {
                        if (grup.horaris) {
                            grup.horaris.forEach((h: any) => {
                                if (h.primerEsdev) {
                                    let hourStr = "";
                                    if (h.dtstart) {
                                        const hour = h.dtstart.substring(11, 13);
                                        hourStr = ` (${parseInt(hour, 10)}h)`;
                                    }
                                    examStrings.push(`${grup.sigles}: ${h.primerEsdev}${hourStr}`);
                                }
                            });
                        }
                    });
                }
            });
            
            const uniqueExams = Array.from(new Set(examStrings));
            const { examFinal, examRecup, finalDates, recupDates } = formatExamsObject(uniqueExams, semestre);

            // Classes teòriques
            const teoriaAct = activitats.find((act: any) => act.descTipusActivitat === "Classes teòriques");
            let teoriaInfo: any[] = [];
            if (teoriaAct && teoriaAct.grups) {
                teoriaInfo = teoriaAct.grups.map((grup: any) => {
                    const profs = grup.professors.map((p: any) => {
                        const name = p.nomComplet;
                        if (!name) return "";
                        if (name.includes(',')) {
                            const parts = name.split(',');
                            const cognoms = parts[0].trim().split(' ');
                            const nom = parts[1].trim().split(' ')[0];
                            return `${nom} ${cognoms[0]}`;
                        }
                        const parts = name.split(' ');
                        if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
                        return name;
                    }).filter(Boolean).join(', ') || "Sense professor";
                    const horari = formatHorariInline(grup.horaris);
                    return { sigles: grup.sigles, horari, profs };
                });
            }

            // Pràctiques
            const practiquesAct = activitats.find((act: any) => 
                act.descTipusActivitat === "Pràctiques de laboratori" || 
                act.descTipusActivitat === "Pràctiques amb tecnologia o entorns tecnològics" ||
                act.descTipusActivitat === "Altres pràctiques"
            );
            let practiquesInfo: any[] = [];
            if (practiquesAct && practiquesAct.grups) {
                practiquesInfo = practiquesAct.grups.map((grup: any) => {
                    const profs = grup.professors.map((p: any) => {
                        const name = p.nomComplet;
                        if (!name) return "";
                        if (name.includes(',')) {
                            const parts = name.split(',');
                            const cognoms = parts[0].trim().split(' ');
                            const nom = parts[1].trim().split(' ')[0];
                            return `${nom} ${cognoms[0]}`;
                        }
                        const parts = name.split(' ');
                        if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
                        return name;
                    }).filter(Boolean).join(', ') || "Sense professor";
                    const horari = formatHorariInline(grup.horaris);
                    return { sigles: grup.sigles, horari, profs };
                });
            }
            
            return { examFinal, examRecup, finalDates, recupDates, teoriaInfo, practiquesInfo };
        } catch (e) {
            return { examFinal: "Error al carregar exàmens", examRecup: "", finalDates: [], recupDates: [], teoriaInfo: [], practiquesInfo: [] };
        }
    };

    const handleSelect = async (assignatura: any) => {
        const semestrePlaced = assignatura.teOfertaSem1 ? "1" : "2";
        
        const newSubject = {
            ...assignatura,
            semestrePlaced,
            examFinal: "Carregant exàmens...",
            examRecup: "",
            finalDates: [],
            recupDates: [],
            teoriaInfo: ["Carregant horaris..."],
            practiquesInfo: [],
            activeExam: 'F'
        };
        
        setSelectedSubjects(prev => [...prev, newSubject]);
        setSearchQuery("");
        
        const info = await fetchSubjectInfo(assignatura.idAssignatura, semestrePlaced);
        setSelectedSubjects(prev => 
            prev.map(s => s.idAssignatura === assignatura.idAssignatura ? { ...s, ...info } : s)
        );
    };

    const handleRemove = (id: string) => {
        setSelectedSubjects(prev => prev.filter(s => s.idAssignatura !== id));
    };

    const onDragStart = (e: React.DragEvent, id: string) => {
        setDraggingSubjectId(id);
        e.dataTransfer.setData("text/plain", id);
        // Cast to HTMLElement for classList
        (e.currentTarget as HTMLElement).classList.add(styles.dragging);
    };

    const onDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove(styles.dragging);
        setDragOverSemestre(null);
        setDraggingSubjectId(null);
        setDragOverSubjectId(null);
    };

    const onDragOver = (e: React.DragEvent, semestre: "1" | "2") => {
        e.preventDefault();
        if (dragOverSemestre !== semestre) {
            setDragOverSemestre(semestre);
        }
    };

    const onDragLeave = (e: React.DragEvent) => {
        setDragOverSemestre(null);
    };

    const moveSubject = async (sourceId: string, targetId: string | null, targetSemestre: "1" | "2") => {
        const sourceSubj = selectedSubjects.find(s => s.idAssignatura === sourceId);
        if (!sourceSubj) return;

        const isCrossSemester = sourceSubj.semestrePlaced !== targetSemestre;
        if (isCrossSemester) {
            if (targetSemestre === "1" && !sourceSubj.teOfertaSem1) return;
            if (targetSemestre === "2" && !sourceSubj.teOfertaSem2) return;
        }

        setSelectedSubjects(prev => {
            const newArr = [...prev];
            const sourceIndex = newArr.findIndex(s => s.idAssignatura === sourceId);
            if (sourceIndex === -1) return prev;
            
            const [subj] = newArr.splice(sourceIndex, 1);
            
            if (isCrossSemester) {
                subj.semestrePlaced = targetSemestre;
                subj.examFinal = "Carregant exàmens...";
                subj.examRecup = "";
                subj.finalDates = [];
                subj.recupDates = [];
                subj.teoriaInfo = ["Carregant horaris..."];
                subj.practiquesInfo = [];
            }

            if (targetId) {
                const targetIndex = newArr.findIndex(s => s.idAssignatura === targetId);
                const insertIndex = targetIndex === -1 ? newArr.length : targetIndex;
                newArr.splice(insertIndex, 0, subj);
            } else {
                newArr.push(subj);
            }
            return newArr;
        });

        if (isCrossSemester) {
            const info = await fetchSubjectInfo(sourceId, targetSemestre);
            setSelectedSubjects(prev => 
                prev.map(s => s.idAssignatura === sourceId ? { ...s, ...info } : s)
            );
        }
    };

    const onDrop = async (e: React.DragEvent, targetSemestre: "1" | "2") => {
        e.preventDefault();
        setDragOverSemestre(null);
        setDraggingSubjectId(null);
        setDragOverSubjectId(null);
        
        const id = e.dataTransfer.getData("text/plain");
        if (id) {
            moveSubject(id, null, targetSemestre);
        }
    };

    const toggleSubjectExam = (id: string, exam: 'F' | 'R') => {
        setSelectedSubjects(prev => prev.map(s => s.idAssignatura === id ? { ...s, activeExam: exam } : s));
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedSubjects,
        dragOverSemestre,
        draggingSubjectId,
        dragOverSubjectId,
        setDragOverSubjectId,
        setDragOverSemestre,
        calendarSemestreOpen,
        setCalendarSemestreOpen,
        filteredAssignatures,
        handleSelect,
        handleRemove,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDragLeave,
        onDrop,
        moveSubject,
        toggleSubjectExam
    };
};
