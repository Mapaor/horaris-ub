import React, { useMemo, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import styles from "../styles/HorariView.module.css";
import globalStyles from "../styles/PaginaPrincipal.module.css";
import cronosStyles from "../styles/CronosTab.module.css";
import { CalendarEvent, calculateLayout, generateColorForAssignatura, getDayIndices, getMinutesFromDate } from "../lib/horarisUtils";

interface HorariViewProps {
    cronosSelectedAssignatures: any[];
    cronosSelectedGroups: Record<string, Record<string, string>>;
    cronosAssignaturaData: Record<string, any>;
    cronosConfig: {
        subjectColors: Record<string, string>;
        subjectAliases: Record<string, string>;
        activityAliases: Record<string, string>;
        hiddenActivities: Record<string, boolean>;
        timeSlotStyle?: "standard" | "custom";
        showClassrooms?: boolean;
    };
    cronosSemestre: "1" | "2";
}

const FullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3H20.5C20.77614 3 21 3.22386 21 3.5V10M14 10L20.4 3.6M10 21H3.5C3.22386 21 3 20.77614 3 20.5V14M10 14L3.6 20.4"/>
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3V14M8 10L12 14L16 10M4 18V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V18"/>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
    </svg>
);

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
const CUSTOM_TIMES = [
    { label: "8:30", minute: 510 },
    { label: "9:30", minute: 570 },
    { label: "10:45", minute: 645 },
    { label: "11:45", minute: 705 },
    { label: "12:45", minute: 765 },
    { label: "15:00", minute: 900 },
    { label: "16:00", minute: 960 },
    { label: "17:00", minute: 1020 },
    { label: "18:00", minute: 1080 },
    { label: "19:00", minute: 1140 },
    { label: "20:00", minute: 1200 },
];

const DAYS = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres"];
const MINUTE_HEIGHT = 1; // 1px = 1 minut. Cada hora = 60px

export function HorariView({
    cronosSelectedAssignatures,
    cronosSelectedGroups,
    cronosAssignaturaData,
    cronosConfig,
    cronosSemestre
}: HorariViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [exportFormat, setExportFormat] = useState<"JPG" | "PDF" | "JSON">("JPG");
    const horariRef = useRef<HTMLDivElement>(null);
    const fullscreenRef = useRef<HTMLDivElement>(null);

    const events = useMemo(() => {
        const rawEvents: CalendarEvent[] = [];
        
        cronosSelectedAssignatures.forEach((assignatura) => {
            const selectedGroupsForSubject = cronosSelectedGroups[assignatura.idAssignatura] || {};
            const subjectData = cronosAssignaturaData[assignatura.idAssignatura];
            
            if (!subjectData || !subjectData.activitats) return;

            subjectData.activitats.forEach((activitat: any) => {
                if (activitat.descTipusActivitat === "Exàmens") return;
                
                const selectedGroup = selectedGroupsForSubject[activitat.descTipusActivitat];
                if (!selectedGroup) return;

                const grupData = activitat.grups?.find((g: any) => g.sigles === selectedGroup);
                if (!grupData || !grupData.horaris) return;

                grupData.horaris.forEach((horariItem: any) => {
                    const days = getDayIndices(horariItem.rrule);
                    const startMinute = getMinutesFromDate(horariItem.dtstart);
                    const endMinute = getMinutesFromDate(horariItem.dtend);
                    
                    const assignaturaAlias = cronosConfig?.subjectAliases?.[assignatura.idAssignatura] || assignatura.descAssignatura;
                    const activityAlias = cronosConfig?.activityAliases?.[activitat.descTipusActivitat] || activitat.descTipusActivitat;
                    const customColor = cronosConfig?.subjectColors?.[assignatura.idAssignatura] || generateColorForAssignatura(assignatura.idAssignatura);
                    
                    const isHidden = !!cronosConfig?.hiddenActivities?.[activitat.descTipusActivitat];
                    if (isHidden) return;

                    let classroomStr = "";
                    if (cronosConfig?.showClassrooms) {
                        const espais = horariItem.espais || grupData.espais;
                        if (Array.isArray(espais) && espais.length > 0) {
                            classroomStr = espais.map((e: any) => e.nom.startsWith("F ") ? e.nom.substring(2) : e.nom).join(" / ");
                        }
                    }

                    days.forEach(dayIndex => {
                        rawEvents.push({
                            id: `${assignatura.idAssignatura}-${activitat.descTipusActivitat}-${dayIndex}-${startMinute}`,
                            idAssignatura: assignatura.idAssignatura,
                            descAssignatura: assignaturaAlias,
                            siglesGrup: grupData.sigles,
                            descTipusActivitat: activityAlias,
                            dayIndex,
                            startMinute,
                            endMinute,
                            color: customColor,
                            columnWidth: 100,
                            columnOffset: 0,
                            classroomStr
                        });
                    });
                });
            });
        });
        
        return calculateLayout(rawEvents);
    }, [cronosSelectedAssignatures, cronosSelectedGroups, cronosAssignaturaData]);

    if (cronosSelectedAssignatures.length === 0) {
        return (
            <div className={globalStyles.blankState} style={{ minHeight: '200px' }}>
                Selecciona assignatures per veure el teu horari.
            </div>
        );
    }

    const handleDownload = async () => {
        if (exportFormat === "JSON") {
            const classesForJSON = events.map(ev => ({
                assignatura: ev.descAssignatura, // Si té alias, ja està resolt a l'event (però seria millor tenir l'original també, per ara passem aquest que és el que l'usuari vol veure)
                assignaturaAlias: cronosConfig?.subjectAliases?.[ev.idAssignatura] || "",
                activitat: ev.descTipusActivitat, // Alias
                activitatAlias: cronosConfig?.activityAliases?.[ev.descTipusActivitat] || "",
                aula: ev.classroomStr || "",
                grup: ev.siglesGrup,
                dia: DAYS[ev.dayIndex],
                horaInici: `${Math.floor(ev.startMinute / 60).toString().padStart(2, '0')}:${(ev.startMinute % 60).toString().padStart(2, '0')}`,
                horaFi: `${Math.floor(ev.endMinute / 60).toString().padStart(2, '0')}:${(ev.endMinute % 60).toString().padStart(2, '0')}`,
                color: ev.color,
                hidden: false
            }));
            
            const jsonData = {
                semestre: cronosSemestre,
                classes: classesForJSON
            };
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "horari.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            return;
        }

        const target = isFullscreen ? fullscreenRef.current : horariRef.current;
        if (!target) return;
        
        try {
            const canvas = await html2canvas(target, {
                scale: 2, // Millor resolució
                backgroundColor: "#ffffff",
                useCORS: true
            });

            if (exportFormat === "JPG") {
                const imgData = canvas.toDataURL("image/jpeg", 0.9);
                const link = document.createElement('a');
                link.href = imgData;
                link.download = "horari.jpg";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (exportFormat === "PDF") {
                const imgData = canvas.toDataURL("image/jpeg", 0.9);
                // A4 en horitzontal (landscape): 297mm x 210mm
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                
                const finalWidth = imgWidth * ratio;
                const finalHeight = imgHeight * ratio;
                
                const marginX = (pdfWidth - finalWidth) / 2;
                const marginY = (pdfHeight - finalHeight) / 2;
                
                pdf.addImage(imgData, 'JPEG', marginX, marginY, finalWidth, finalHeight);
                pdf.save("horari.pdf");
            }
        } catch (error) {
            console.error("Error exportant l'horari:", error);
        }
    };
    const isCustom = cronosConfig?.timeSlotStyle === "custom";

    return (
        <div className={isFullscreen ? styles.fullscreenOverlay : ""} ref={fullscreenRef}>
            {isFullscreen && (
                <button 
                    className={styles.fullscreenCloseBtn}
                    onClick={() => setIsFullscreen(false)}
                    title="Tancar pantalla completa"
                    data-html2canvas-ignore="true"
                >
                    <CloseIcon />
                </button>
            )}
            <div className={styles.exportToolbar} data-html2canvas-ignore="true">
                <button 
                    className={styles.toolbarIconBtn} 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title="Pantalla completa"
                >
                    <FullscreenIcon />
                </button>
                
                <div className={cronosStyles.smallSegmentControl}>
                    <button
                        className={`${cronosStyles.smallSegmentButton} ${exportFormat === "JPG" ? cronosStyles.activeSmallSegment : ""}`}
                        onClick={() => setExportFormat("JPG")}
                    >
                        JPG
                    </button>
                    <button
                        className={`${cronosStyles.smallSegmentButton} ${exportFormat === "PDF" ? cronosStyles.activeSmallSegment : ""}`}
                        onClick={() => setExportFormat("PDF")}
                    >
                        PDF
                    </button>
                    <button
                        className={`${cronosStyles.smallSegmentButton} ${exportFormat === "JSON" ? cronosStyles.activeSmallSegment : ""}`}
                        onClick={() => setExportFormat("JSON")}
                    >
                        JSON
                    </button>
                </div>
                
                <button 
                    className={styles.toolbarIconBtn} 
                    onClick={handleDownload}
                    title={`Descarregar en ${exportFormat}`}
                >
                    <DownloadIcon />
                </button>
            </div>
            
            <div className={`${styles.calendarContainer} ${isFullscreen ? styles.calendarFullscreenMode : ''}`} ref={horariRef}>
            <div className={styles.calendarHeaderRow}>
                <div className={styles.calendarTimeColumn}></div>
                {DAYS.map(day => (
                    <div key={day} className={styles.calendarHeaderCell}>{day}</div>
                ))}
            </div>
            <div className={styles.calendarBody}>
                <div className={styles.calendarTimeScale}>
                    {isCustom 
                        ? CUSTOM_TIMES.map(t => (
                            <div key={t.minute} className={styles.timeScaleLabel} style={{ position: 'absolute', width: '100%', top: (t.minute - 8 * 60) * MINUTE_HEIGHT }}>
                                {t.label}
                            </div>
                        ))
                        : HOURS.map(hour => (
                            <div key={hour} className={styles.timeScaleLabel} style={{ position: 'absolute', width: '100%', top: (hour - 8) * 60 * MINUTE_HEIGHT }}>
                                {hour}:00
                            </div>
                        ))
                    }
                </div>
                <div className={styles.calendarGrid}>
                    {/* Linies de les hores */}
                    {isCustom
                        ? CUSTOM_TIMES.map(t => (
                            <div key={`line-${t.minute}`} className={styles.hourLine} style={{ top: (t.minute - 8 * 60) * MINUTE_HEIGHT }}></div>
                        ))
                        : HOURS.map(hour => (
                            <div key={`line-${hour}`} className={styles.hourLine} style={{ top: (hour - 8) * 60 * MINUTE_HEIGHT }}></div>
                        ))
                    }
                    
                    {/* Esdeveniments per columnes */}
                    {DAYS.map((_, dayIndex) => {
                        const dayEvents = events.filter(e => e.dayIndex === dayIndex);
                        return (
                            <div key={`day-${dayIndex}`} className={styles.dayColumn}>
                                {dayEvents.map(event => {
                                    const topOffset = (event.startMinute - 8 * 60) * MINUTE_HEIGHT;
                                    const height = (event.endMinute - event.startMinute) * MINUTE_HEIGHT;
                                    
                                    return (
                                        <div 
                                            key={event.id}
                                            className={styles.calendarEvent}
                                            style={{
                                                top: `${topOffset}px`,
                                                height: `${height}px`,
                                                left: `${event.columnOffset}%`,
                                                width: `${event.columnWidth}%`,
                                                backgroundColor: event.color,
                                            }}
                                            title={`${event.descAssignatura}\n${event.siglesGrup} • ${event.descTipusActivitat}${event.classroomStr ? ` • ${event.classroomStr}` : ''}`}
                                        >
                                            <div className={styles.eventTitle}>{event.descAssignatura}</div>
                                            <div className={styles.eventSubtitle}>{event.siglesGrup} • {event.descTipusActivitat}{event.classroomStr ? ` • ${event.classroomStr}` : ''}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        </div>
    );
}
