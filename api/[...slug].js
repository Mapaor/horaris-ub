import fetch from "node-fetch";

export default async function handler(req, res) {
    const { slug } = req.query; // 'slug' és un array amb els segments de la ruta

    // Uneix els segments per formar la part dinàmica de la URL
    const joinedSlug = Array.isArray(slug) ? slug.join("/") : slug;
    const url = `https://www.ub.edu/guiaacademica/rest/guiaacademica/${joinedSlug}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error en la petició:", error);
        res.status(500).json({ error: "Error en la petició" });
    }
}