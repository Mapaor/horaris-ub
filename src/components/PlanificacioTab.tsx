"use client";

import React, { useState } from "react";
import styles from "../styles/PlanificacioTab.module.css";
import { getAnyAcademicPerDefecte } from "../lib/anyAcademic";
import { CalendarModal } from "./CalendarModal";

interface PlanificacioTabProps {
    allAssignatures: any[];
}

const formatHorariInline = (horaris: any[]) => {
    if (!horaris) return "Sense horari";
    
    const mapDays: Record<string, string> = {
        'MO': 'dll',
        'TU': 'dt',
        'WE': 'dc',
        'TH': 'dj',
        'FR': 'dv'
    };

    return horaris.map(h => {
        let dies = "";
        if (h.rrule) {
            const bydayMatch = h.rrule.match(/BYDAY=([^;]+)/);
            if (bydayMatch) {
                const daysArray = bydayMatch[1].split(',').map((d: string) => mapDays[d] || d);
                dies = daysArray.join(', ') + ' ';
            }
        }
        
        const start = h.dtstart ? h.dtstart.substring(11, 16) : '';
        const end = h.dtend ? h.dtend.substring(11, 16) : '';
        
        if (start && end) {
            return `${dies}${start}-${end}`.trim();
        }
        return h.literal || "Sense horari";
    }).join('; ');
};

const formatDateCatalan = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const day = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;

    const mesos = [
        "gener", "febrer", "març", "abril", "maig", "juny",
        "juliol", "agost", "setembre", "octubre", "novembre", "desembre"
    ];
    
    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
        const monthName = mesos[monthIndex];
        const isVowel = /^[aouie]/i.test(monthName);
        return `${day} d${isVowel ? "'" : "e "}${monthName}`;
    }
    return dateString;
};

const formatExamsObject = (examStrings: string[]) => {
    let finals: string[] = [];
    let recups: string[] = [];
    let finalDates: string[] = [];
    
    examStrings.forEach(str => {
        const parts = str.split(": ");
        if (parts.length !== 2) return;
        const sigles = parts[0];
        
        const dateAndHour = parts[1].trim();
        const spaceIdx = dateAndHour.indexOf(' ');
        
        let date = dateAndHour;
        let hourStr = "";
        
        if (spaceIdx !== -1) {
            date = dateAndHour.substring(0, spaceIdx);
            hourStr = dateAndHour.substring(spaceIdx); // " (9h)"
        }
        
        const formattedDate = formatDateCatalan(date) + hourStr;
        
        if (sigles.toLowerCase().includes("reav") || sigles.toLowerCase().includes("recup")) {
            recups.push(formattedDate);
        } else {
            finals.push(formattedDate);
            finalDates.push(date + hourStr); // e.g. "2025-01-09 (9h)"
        }
    });

    return {
        examFinal: finals.length > 0 ? finals.join(', ') : "Sense examen final",
        examRecup: recups.length > 0 ? recups.join(', ') : "",
        finalDates
    };
};

export function PlanificacioTab({ allAssignatures }: PlanificacioTabProps) {
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
            if (!res.ok) return { examFinal: "Error al carregar exàmens", examRecup: "", finalDates: [], teoriaInfo: [] };
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
                const { examFinal, examRecup, finalDates } = formatExamsObject(uniqueExams);

                // Classes teòriques
                const teoriaAct = activitats.find((act: any) => act.descTipusActivitat === "Classes teòriques");
                let teoriaInfo: string[] = [];
                if (teoriaAct && teoriaAct.grups) {
                    teoriaInfo = teoriaAct.grups.map((grup: any) => {
                        const profs = grup.professors.map((p: any) => p.nomComplet).join(', ') || "Sense professor";
                        const horari = formatHorariInline(grup.horaris);
                        return `${grup.sigles}: ${horari} (${profs})`;
                    });
                }
                
                return { examFinal, examRecup, finalDates, teoriaInfo };
        } catch (e) {
            return { examFinal: "Error al carregar exàmens", examRecup: "", finalDates: [], teoriaInfo: [] };
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
            teoriaInfo: ["Carregant horaris..."]
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
        e.currentTarget.classList.add(styles.dragging);
    };

    const onDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove(styles.dragging);
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
                subj.teoriaInfo = ["Carregant horaris..."];
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

    const renderColumn = (semestre: "1" | "2") => {
        const subjectsInColumn = selectedSubjects.filter(s => s.semestrePlaced === semestre);
        
        const totalCredits = subjectsInColumn.reduce((sum, subject) => {
            const credits = parseFloat(subject.creditsAssignatura);
            return sum + (isNaN(credits) ? 0 : credits);
        }, 0);

        let isInvalidDrop = false;
        let isSameSemestre = false;
        if (dragOverSemestre === semestre && draggingSubjectId) {
            const subject = selectedSubjects.find(s => s.idAssignatura === draggingSubjectId);
            if (subject) {
                if (subject.semestrePlaced === semestre) {
                    isSameSemestre = true;
                } else {
                    if (semestre === "1" && !subject.teOfertaSem1) isInvalidDrop = true;
                    if (semestre === "2" && !subject.teOfertaSem2) isInvalidDrop = true;
                }
            }
        }
        
        let columnClass = styles.column;
        if (dragOverSemestre === semestre && !isSameSemestre) {
            columnClass += " " + (isInvalidDrop ? styles.dragInvalid : styles.dragOver);
        }

        return (
            <div 
                className={columnClass}
                onDragOver={(e) => onDragOver(e, semestre)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, semestre)}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '16px' }}>
                    <h3 className={styles.columnTitle} style={{ marginBottom: 0 }}>Semestre {semestre}</h3>
                    <button 
                        className={styles.calendarButton} 
                        onClick={() => setCalendarSemestreOpen(semestre)}
                        title="Veure calendari d'exàmens"
                    >
                        <img src="/calendar-solid.svg" alt="Calendar" />
                    </button>
                </div>
                
                <div className={styles.subjectList}>
                    {subjectsInColumn.map(subject => {
                        const isCardDragOver = dragOverSubjectId === subject.idAssignatura;
                        return (
                            <div 
                                key={subject.idAssignatura}
                                className={`${styles.subjectCard} ${styles.draggable} ${isCardDragOver ? styles.cardDragOver : ""}`}
                                draggable={true}
                                onDragStart={(e) => onDragStart(e, subject.idAssignatura)}
                                onDragEnd={onDragEnd}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggingSubjectId !== subject.idAssignatura) {
                                        setDragOverSubjectId(subject.idAssignatura);
                                    }
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (dragOverSubjectId === subject.idAssignatura) {
                                        setDragOverSubjectId(null);
                                    }
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragOverSubjectId(null);
                                    setDragOverSemestre(null);
                                    const sourceId = e.dataTransfer.getData("text/plain");
                                    if (sourceId) {
                                        moveSubject(sourceId, subject.idAssignatura, semestre);
                                    }
                                }}
                            >
                                <button 
                                    className={styles.removeButton}
                                    onClick={() => handleRemove(subject.idAssignatura)}
                                    title="Eliminar"
                                >
                                    ✕
                                </button>
                                <div className={styles.subjectTitle}>{subject.descAssignatura}</div>
                                <div className={styles.subjectInfo}>
                                    {subject.examFinal && (
                                        <div><strong>Final:</strong> {subject.examFinal}</div>
                                    )}
                                    {subject.teoriaInfo && subject.teoriaInfo.length > 0 && (
                                        <div style={{ marginTop: '4px' }}>
                                            <strong>Teoria:</strong>
                                            {subject.teoriaInfo.map((info: string, idx: number) => (
                                                <div key={idx} style={{ paddingLeft: '8px', fontSize: '0.8rem', marginTop: '2px', color: '#555' }}>
                                                    • {info}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {subject.examRecup && (
                                        <div style={{ marginTop: '4px', color: '#888888' }}>
                                            <strong>Recuperació:</strong> {subject.examRecup}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.creditsBadge}>
                                    {subject.creditsAssignatura || 0} ECTS
                                </div>
                            </div>
                        );
                    })}
                    {subjectsInColumn.length === 0 && (
                        <div style={{ color: "#888888", textAlign: "center", marginTop: "20px", fontSize: "0.9rem" }}>
                            Arrossega assignatures aquí
                        </div>
                    )}
                    
                    {subjectsInColumn.length > 0 && dragOverSemestre === semestre && !dragOverSubjectId && draggingSubjectId && !isInvalidDrop && (
                        <div className={styles.dropIndicatorEnd} />
                    )}
                </div>
                {subjectsInColumn.length > 0 && (
                    <div className={styles.semesterCreditsBadge}>
                        Total: {totalCredits} ECTS
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    placeholder="Cerca assignatures..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                
                {searchQuery && (
                    <div className={styles.searchResults}>
                        {filteredAssignatures.map(assignatura => (
                            <div 
                                key={assignatura.idAssignatura} 
                                className={styles.searchResultItem}
                                onClick={() => handleSelect(assignatura)}
                            >
                                {assignatura.descAssignatura}
                            </div>
                        ))}
                        {filteredAssignatures.length === 0 && (
                            <div className={styles.searchResultItem} style={{ color: "#888888", cursor: "default" }}>
                                Cap assignatura trobada
                            </div>
                        )}
                    </div>
                )}
                {/* {!searchQuery && (
                    <div style={{ color: "#888888", fontSize: "0.9rem", textAlign: "center", marginTop: "10px" }}>
                        Utilitza el cercador per afegir assignatures a la teva planificació.
                    </div>
                )} */}
            </div>
            
            <div className={styles.semestersContainer}>
                {renderColumn("1")}
                {renderColumn("2")}
            </div>
            {calendarSemestreOpen && (
                <CalendarModal 
                    semestre={calendarSemestreOpen}
                    subjects={selectedSubjects.filter(s => s.semestrePlaced === calendarSemestreOpen)}
                    onClose={() => setCalendarSemestreOpen(null)}
                />
            )}
        </div>
    );
}
