import fetch from "node-fetch";

export async function obtenirHoraris(slug) {
    const url = "https://www.ub.edu/guiaacademica/rest/guiaacademica/" + slug;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        return await response.json();
    } catch (error) {
        console.error("Error en la petició:", error);
        throw error;
    }
}