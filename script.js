import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Configura el servidor per servir fitxers estàtics, com ara client.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Serveix el fitxer HTML per la pàgina principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Ruta per obtenir els horaris que llegeix la query parameter "slug"
app.get("/api/horaris", async (req, res) => {
    const slug = req.query.slug;
    console.log("API /api/horaris invocat amb:", slug);
    
    if (!slug) {
        return res.status(400).json({ error: "Falta el paràmetre 'slug'" });
    }
    
    const url = "https://www.ub.edu/guiaacademica/rest/guiaacademica/" + slug;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Obté el text de l'error i el retorna amb el mateix codi d'estat
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error en la petició:", error);
        res.status(500).json({ error: "Error en la petició" });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor en funcionament a http://localhost:${PORT}`);
});
