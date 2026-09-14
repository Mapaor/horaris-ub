export const getAnyAcademicPerDefecte = (): number => {
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

export const getAnySeleccionat = (): number => {
    if (typeof window !== 'undefined') {
        const anyGuardat = localStorage.getItem('anySeleccionat');
        if (anyGuardat) {
            return parseInt(anyGuardat, 10);
        }
    }
    return getAnyAcademicPerDefecte();
};

export type AnyAcademic = {
    valor: number;
    etiqueta: string;
};

export const generaAnysAcademics = (): AnyAcademic[] => {
    const anyPerDefecte = getAnyAcademicPerDefecte();
    const anys: AnyAcademic[] = [];
    
    for (let any = 2009; any <= anyPerDefecte; any++) {
        anys.push({
            valor: any,
            etiqueta: `Curs ${any}-${any + 1}`
        });
    }
    
    return anys.reverse(); // Mostrar primer l'any més recent
};
