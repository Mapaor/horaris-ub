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

// Ruta per obtenir els horaris
app.get("/api/horaris/*", async (req, res) => {
    console.log(req.params['0']);
    const url = "https://www.ub.edu/guiaacademica/rest/guiaacademica/" + req.params[0];
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error en la petició:", error);
        // Retorna sempre resposta en format JSON
        res.status(500).json({ error: "Error en la petició" });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor en funcionament a http://localhost:${PORT}`);
});
