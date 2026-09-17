export const formatHorariInline = (horaris: any[]) => {
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

export const formatDateCatalan = (dateString: string) => {
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

export const formatExamsObject = (examStrings: string[], semestre: "1" | "2") => {
    let finals: string[] = [];
    let recups: string[] = [];
    let finalDates: string[] = [];
    let recupDates: string[] = [];
    
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
        
        const siglesLower = sigles.toLowerCase();
        let isRecup = false;
        
        if (siglesLower.includes("reav") || siglesLower.includes("recup")) {
            isRecup = true;
        } else if (siglesLower.includes("ex-g")) {
            isRecup = false; // Final S1
        } else if (siglesLower.includes("ex-j")) {
            isRecup = semestre === "1"; // Recup S1, Final S2
        } else if (siglesLower.includes("ex-s") || siglesLower.includes("ex-a")) {
            isRecup = true; // Recup S2 (Setembre/Agost)
        } else {
            // Fallback by date
            const dateParts = date.split("-");
            if (dateParts.length === 3) {
                const month = parseInt(dateParts[1], 10);
                if (semestre === "1") {
                    // Final: Gener, Febrer. Recup: Maig, Juny, Juliol
                    if (month >= 5 && month <= 7) {
                        isRecup = true;
                    } else {
                        isRecup = false;
                    }
                } else {
                    // Final: Maig, Juny. Recup: Juliol, Agost, Setembre
                    if (month >= 8 && month <= 9) {
                        isRecup = true;
                    } else if (month <= 6) {
                        isRecup = false;
                    } else {
                        // Month 7 overlaps. Default to recup if no name given
                        isRecup = true;
                    }
                }
            }
        }
        
        if (isRecup) {
            recups.push(formattedDate);
            recupDates.push(date + hourStr);
        } else {
            finals.push(formattedDate);
            finalDates.push(date + hourStr);
        }
    });

    return {
        examFinal: finals.length > 0 ? finals.join(', ') : "Sense examen final",
        examRecup: recups.length > 0 ? recups.join(', ') : "",
        finalDates,
        recupDates
    };
};
