"use client";

import React from "react";
import styles from "../styles/PlanificacioTab.module.css";
import { CalendarModal } from "./CalendarModal";
import { SubjectCard } from "./SubjectCard";
import { usePlanificacio } from "../hooks/usePlanificacio";

interface PlanificacioTabProps {
    allAssignatures: any[];
}

export function PlanificacioTab({ allAssignatures }: PlanificacioTabProps) {
    const {
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
    } = usePlanificacio(allAssignatures);

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
                            <SubjectCard
                                key={subject.idAssignatura}
                                subject={subject}
                                semestre={semestre}
                                isCardDragOver={isCardDragOver}
                                draggingSubjectId={draggingSubjectId}
                                dragOverSubjectId={dragOverSubjectId}
                                setDragOverSubjectId={setDragOverSubjectId}
                                setDragOverSemestre={setDragOverSemestre}
                                moveSubject={moveSubject}
                                handleRemove={handleRemove}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                toggleSubjectExam={toggleSubjectExam}
                            />
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
            </div>
            
            <div className={styles.semestersContainer}>
                {renderColumn("1")}
                {renderColumn("2")}
            </div>
            {calendarSemestreOpen && (
                <CalendarModal 
                    semestre={calendarSemestreOpen}
                    subjects={selectedSubjects.filter(s => {
                        if (calendarSemestreOpen === "1") {
                            return s.semestrePlaced === "1" && s.activeExam === 'F';
                        } else {
                            // calendarSemestreOpen === "2"
                            return (s.semestrePlaced === "2" && s.activeExam === 'F') || s.activeExam === 'R';
                        }
                    })}
                    onClose={() => setCalendarSemestreOpen(null)}
                />
            )}
        </div>
    );
}
