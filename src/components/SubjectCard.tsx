import React, { useState } from "react";
import styles from "../styles/SubjectCard.module.css";

export const SubjectCard = ({
    subject,
    semestre,
    isCardDragOver,
    draggingSubjectId,
    dragOverSubjectId,
    setDragOverSubjectId,
    setDragOverSemestre,
    moveSubject,
    handleRemove,
    onDragStart,
    onDragEnd,
    toggleSubjectExam
}: any) => {
    const [activeGroupIdx, setActiveGroupIdx] = useState(0);
    const [activePractiquesIdx, setActivePractiquesIdx] = useState(0);

    return (
        <div 
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
                {(subject.examFinal || subject.examRecup) && (
                    <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '2px' }}>
                        {subject.examFinal && (
                            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                <span 
                                    onClick={() => toggleSubjectExam(subject.idAssignatura, 'F')}
                                    style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: subject.activeExam === 'F' ? 600 : 400,
                                        textDecoration: subject.activeExam === 'F' ? 'underline' : 'none',
                                        color: subject.activeExam === 'F' ? '#555' : '#aaa',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Final
                                </span>
                                <span style={{ fontSize: '0.8rem', color: subject.activeExam === 'F' ? '#555' : '#aaa' }}>: {subject.examFinal}</span>
                            </div>
                        )}
                        {subject.examFinal && subject.examRecup && (
                            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>|</span>
                        )}
                        {subject.examRecup && (
                            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                <span 
                                    onClick={() => toggleSubjectExam(subject.idAssignatura, 'R')}
                                    style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: subject.activeExam === 'R' ? 600 : 400,
                                        textDecoration: subject.activeExam === 'R' ? 'underline' : 'none',
                                        color: subject.activeExam === 'R' ? '#555' : '#aaa',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Recuperació
                                </span>
                                <span style={{ fontSize: '0.8rem', color: subject.activeExam === 'R' ? '#555' : '#aaa' }}>: {subject.examRecup}</span>
                            </div>
                        )}
                    </div>
                )}
                {subject.teoriaInfo && subject.teoriaInfo.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', marginTop: '2px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {subject.teoriaInfo.map((grup: any, idx: number) => (
                                <span 
                                    key={idx}
                                    onClick={() => setActiveGroupIdx(idx)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: activeGroupIdx === idx ? 600 : 400,
                                        textDecoration: activeGroupIdx === idx ? 'underline' : 'none',
                                        color: '#555',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {grup.sigles || grup}
                                </span>
                            ))}
                        </div>
                        {subject.teoriaInfo[activeGroupIdx] && subject.teoriaInfo[activeGroupIdx].horari && (
                            <div style={{ fontSize: '0.8rem', color: '#555' }}>
                                : {subject.teoriaInfo[activeGroupIdx].horari} <span style={{color: '#888'}}>({subject.teoriaInfo[activeGroupIdx].profs})</span>
                            </div>
                        )}
                    </div>
                )}
                {subject.practiquesInfo && subject.practiquesInfo.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', marginTop: '2px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {subject.practiquesInfo.map((grup: any, idx: number) => (
                                <span 
                                    key={idx}
                                    onClick={() => setActivePractiquesIdx(idx)}
                                    style={{ 
                                        cursor: 'pointer', 
                                        fontWeight: activePractiquesIdx === idx ? 600 : 400,
                                        textDecoration: activePractiquesIdx === idx ? 'underline' : 'none',
                                        color: '#555',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {grup.sigles || grup}
                                </span>
                            ))}
                        </div>
                        {subject.practiquesInfo[activePractiquesIdx] && subject.practiquesInfo[activePractiquesIdx].horari && (
                            <div style={{ fontSize: '0.8rem', color: '#555' }}>
                                : {subject.practiquesInfo[activePractiquesIdx].horari} <span style={{color: '#888'}}>({subject.practiquesInfo[activePractiquesIdx].profs})</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.creditsBadge}>
                {subject.creditsAssignatura || 0} ECTS
            </div>
        </div>
    );
};
