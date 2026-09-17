import React from 'react';
import styles from '../styles/CalendarModal.module.css';

interface CalendarModalProps {
    semestre: "1" | "2";
    subjects: any[];
    onClose: () => void;
}

export function CalendarModal({ semestre, subjects, onClose }: CalendarModalProps) {
    const examens: { date: Date, subjectName: string, id: string, timeStr?: string, isRecup: boolean }[] = [];
    
    subjects.forEach(subj => {
        const datesToUse = subj.activeExam === 'R' ? subj.recupDates : subj.finalDates;
        const isRecup = subj.activeExam === 'R';
        if (datesToUse && datesToUse.length > 0) {
            datesToUse.forEach((dStr: string) => {
                const spaceIdx = dStr.indexOf(' ');
                let rawDate = dStr;
                let timeStr = "";
                
                if (spaceIdx !== -1) {
                    rawDate = dStr.substring(0, spaceIdx);
                    timeStr = dStr.substring(spaceIdx).trim(); // e.g. "(9h)"
                }

                const parts = rawDate.split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    examens.push({
                        date: new Date(year, month, day),
                        subjectName: subj.descAssignatura,
                        id: subj.idAssignatura,
                        timeStr,
                        isRecup
                    });
                }
            });
        }
    });

    if (examens.length === 0) {
        return (
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                    <h2 className={styles.modalTitle}>Calendari d'Exàmens - Semestre {semestre}</h2>
                    <p style={{ textAlign: 'center', color: '#666', margin: '40px 0' }}>No hi ha exàmens finals registrats per a aquest semestre.</p>
                </div>
            </div>
        );
    }

    examens.sort((a, b) => a.date.getTime() - b.date.getTime());
    const minDate = examens[0].date;
    const maxDate = examens[examens.length - 1].date;

    const months = [];
    let currentMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    while (currentMonth <= endMonth) {
        months.push(new Date(currentMonth));
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const mesNames = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>✕</button>
                <h2 className={styles.modalTitle}>Calendari d'Exàmens - Semestre {semestre}</h2>
                
                <div className={styles.calendarScroll}>
                    {months.map((monthDate, i) => {
                        const year = monthDate.getFullYear();
                        const month = monthDate.getMonth();
                        const daysInMonth = getDaysInMonth(year, month);
                        const firstDay = getFirstDayOfMonth(year, month);
                        
                        const blanks = Array.from({ length: firstDay });
                        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                        return (
                            <div key={i} className={styles.monthContainer}>
                                <h3 className={styles.monthTitle}>{mesNames[month]} {year}</h3>
                                <div className={styles.grid}>
                                    {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(d => (
                                        <div key={d} className={styles.dayHeader}>{d}</div>
                                    ))}
                                    
                                    {blanks.map((_, idx) => (
                                        <div key={`blank-${idx}`} className={styles.emptyCell}></div>
                                    ))}
                                    
                                    {days.map(day => {
                                        const dayExams = examens.filter(e => 
                                            e.date.getDate() === day && 
                                            e.date.getMonth() === month && 
                                            e.date.getFullYear() === year
                                        );
                                        
                                        return (
                                            <div key={day} className={`${styles.cell} ${dayExams.length > 0 ? styles.hasExam : ''}`}>
                                                <span className={styles.dayNumber}>{day}</span>
                                                <div className={styles.examList}>
                                                    {dayExams.map((ex, idx) => (
                                                        <div key={idx} className={`${styles.examBadge} ${ex.isRecup ? styles.examBadgeRecup : ''}`} title={`${ex.subjectName} ${ex.timeStr ? ex.timeStr : ''}`}>
                                                            <span className={styles.examName}>{ex.subjectName}</span>
                                                            {ex.timeStr && <span className={styles.examTime}>{ex.timeStr}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
