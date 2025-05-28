import fetch from "node-fetch";

export default async function handler(req, res) {
    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({ error: "Falta el paràmetre 'slug'" });
    }

    const url = `https://www.ub.edu/guiaacademica/rest/guiaacademica/${slug}`;

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