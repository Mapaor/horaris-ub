import React from "react";
import styles from "../styles/MainTabs.module.css";

interface MainTabsProps {
    pestanyaActiva: "guia" | "cronos" | "planificacio";
    setPestanyaActiva: (tab: "guia" | "cronos" | "planificacio") => void;
}

export function MainTabs({ pestanyaActiva, setPestanyaActiva }: MainTabsProps) {
    return (
        <div className={styles.categories}>
            <div className={styles.segmentControl}>
                <button
                    className={`${styles.segmentButton} ${pestanyaActiva === "guia" ? styles.activeSegment : ""}`}
                    onClick={() => setPestanyaActiva("guia")}
                >
                    Guia Acadèmica
                </button>
                <button
                    className={`${styles.segmentButton} ${pestanyaActiva === "cronos" ? styles.activeSegment : ""}`}
                    onClick={() => setPestanyaActiva("cronos")}
                >
                    Cronos
                </button>
                <button
                    className={`${styles.segmentButton} ${pestanyaActiva === "planificacio" ? styles.activeSegment : ""} ${styles.desktopOnly}`}
                    onClick={() => setPestanyaActiva("planificacio")}
                >
                    Planificació
                </button>
            </div>
        </div>
    );
}
