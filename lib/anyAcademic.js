// Funció per calcular l'any acadèmic per defecte basant-se en el mes actual
export const getAnyAcademicPerDefecte = () => {
    const avui = new Date();
    const mes = avui.getMonth() + 1; // getMonth() retorna 0-11, volem 1-12
    const anyActual = avui.getFullYear();

    // Juliol (7) - Desembre (12): utilitzem l'any actual
    // Gener (1) - Juny (6): utilitzem l'any anterior
    // Seria 7 o 8 en funció de si publiquen els horaris nous a finals de juny o a mitjans de juliol
    if (mes >= 7 && mes <= 12) {
        return anyActual;
    } else {
        return anyActual - 1;
    }
};

// Funció per obtenir l'any seleccionat del localStorage o per defecte l'any acadèmic calculat
export const getAnySeleccionat = () => {
    if (typeof window !== 'undefined') {
        const anyGuardat = localStorage.getItem('anySeleccionat');
        if (anyGuardat) {
            return parseInt(anyGuardat);
        }
    }
    return getAnyAcademicPerDefecte();
};

// Funció per generar la llista d'anys acadèmics des de 2009 fins a l'any per defecte
export const generaAnysAcademics = () => {
    const anyPerDefecte = getAnyAcademicPerDefecte();
    const anys = [];
    
    for (let any = 2009; any <= anyPerDefecte; any++) {
        anys.push({
            valor: any,
            etiqueta: `Curs ${any}-${any + 1}`
        });
    }
    
    return anys.reverse(); // Mostrar primer l'any més recent
};
