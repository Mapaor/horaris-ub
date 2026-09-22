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
    importCronosState?: (data: any) => Promise<void>;
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

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14V3M8 7L12 3L16 7M4 18V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V18"/>
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
    cronosSemestre,
    importCronosState
}: HorariViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [exportFormat, setExportFormat] = useState<"JPG" | "PDF" | "JSON">("JPG");
    const horariRef = useRef<HTMLDivElement>(null);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleDownload = async () => {
        if (exportFormat === "JSON") {
            const jsonData = {
                version: "1.0",
                semestre: cronosSemestre,
                assignatures: cronosSelectedAssignatures.map(a => ({
                    idAssignatura: a.idAssignatura,
                    descAssignatura: a.descAssignatura
                })),
                grups: cronosSelectedGroups,
                config: cronosConfig
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

        const target = horariRef.current;
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

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            alert("Si us plau, selecciona un fitxer JSON vàlid.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target?.result as string);
                if (importCronosState) {
                    importCronosState(data);
                }
            } catch (err) {
                console.error("Error al analitzar el JSON:", err);
                alert("El fitxer no té un format JSON vàlid.");
            }
        };
        reader.readAsText(file);
        
        // Reset the input so the same file can be selected again if needed
        e.target.value = '';
    };
    const isCustom = cronosConfig?.timeSlotStyle === "custom" || !cronosConfig?.timeSlotStyle;

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
                {!isFullscreen && (
                    <div style={{ display: 'flex', marginRight: 'auto' }}>
                        <input 
                            type="file" 
                            accept=".json" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange} 
                        />
                        <button 
                            className={styles.toolbarIconBtn} 
                            onClick={handleImportClick}
                            title="Importar JSON"
                        >
                            <UploadIcon />
                        </button>
                    </div>
                )}
                <button 
                    className={styles.toolbarIconBtn} 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title="Pantalla completa"
                    disabled={cronosSelectedAssignatures.length === 0}
                >
                    <FullscreenIcon />
                </button>
                
                <div className={cronosStyles.smallSegmentControl}>
                    <button
                        className={`${cronosStyles.smallSegmentButton} ${exportFormat === "JPG" ? cronosStyles.activeSmallSegment : ""}`}
                        onClick={() => setExportFormat("JPG")}
                        disabled={cronosSelectedAssignatures.length === 0}
                    >
                        JPG
                    </button>
                    <button
                        className={`${cronosStyles.smallSegmentButton} ${exportFormat === "PDF" ? cronosStyles.activeSmallSegment : ""}`}
                        onClick={() => setExportFormat("PDF")}
                        disabled={cronosSelectedAssignatures.length === 0}
                    >
                        PDF
                    </button>
                    <button
                        className={`${cronosStyles.smallSegmentButton} ${exportFormat === "JSON" ? cronosStyles.activeSmallSegment : ""}`}
                        onClick={() => setExportFormat("JSON")}
                        disabled={cronosSelectedAssignatures.length === 0}
                    >
                        JSON
                    </button>
                </div>
                
                <button 
                    className={styles.toolbarIconBtn} 
                    onClick={handleDownload}
                    title={`Descarregar en ${exportFormat}`}
                    disabled={cronosSelectedAssignatures.length === 0}
                >
                    <DownloadIcon />
                </button>
            </div>
            
            {cronosSelectedAssignatures.length === 0 ? (
                <div className={globalStyles.blankState} style={{ minHeight: '200px', marginTop: '20px' }}>
                    Selecciona assignatures per veure el teu horari o importa un fitxer JSON.
                </div>
            ) : (
            <div className={`${styles.calendarContainer} ${isFullscreen ? styles.calendarFullscreenMode : ''}`}>
            <div className={styles.calendarScrollArea} ref={horariRef}>
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
        )}
        </div>
    );
}
