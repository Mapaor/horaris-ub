import fetch from "node-fetch";
import { getAnyAcademicPerDefecte } from "../../lib/anyAcademic";

export default async function handler(req, res) {
    const { idAssignatura, any } = req.query;
    const anySeleccionat = any ? parseInt(any) : getAnyAcademicPerDefecte();

    if (!idAssignatura) {
        return res.status(400).json({ error: "Falta el paràmetre 'idAssignatura'" });
    }

    const url = `https://www.ub.edu/pladocent/rest/plandocente/getPlaDocent/${idAssignatura}/${anySeleccionat}/CAT`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error en la petició:", error);
        res.status(500).json({ error: "Error en la petició" });
    }
}