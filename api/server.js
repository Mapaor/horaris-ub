import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';
import { obtenirHoraris } from "./horaris.js";
import { extreuDies, extreuHora, generaTaulaHoraris } from "./utils.js";
import helmet from "helmet";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../")));

// Serveix el fitxer HTML per la pàgina principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/:idAssignatura", async (req, res) => {
    const idAssignatura = req.params.idAssignatura;
    const url = `https://www.ub.edu/guiaacademica/rest/guiaacademica/getPlanificacioAssignatura/${idAssignatura}/TG1035/2024/1/CAT`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).send(`<h1>Error</h1><p>${await response.text()}</p>`);
        }

        const data = await response.json();
        if (!data.datos.assignatura) {
            return res.status(404).send("<h1>Error</h1><p>L'assignatura no s'ha trobat.</p>");
        }

        const nomAssignatura = data.datos.assignatura.descAssignatura;
        const taulaHoraris = generaTaulaHoraris(data.datos.assignatura.activitats);

        res.send(`
            <!DOCTYPE html>
            <html lang="ca">
            <head>
                <meta charset="UTF-8">
                <title>${nomAssignatura}</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    table th, table td { border: 1px solid #ddd; padding: 8px; }
                    table th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>${nomAssignatura}</h1>
                <p>Horari de l'assignatura</p>
                ${taulaHoraris}
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send("<h1>Error del servidor</h1><p>No s'ha pogut obtenir la informació de l'assignatura.</p>");
    }
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
            const errorText = await response.text();
            console.error(`Error en la resposta de l'API: ${errorText}`);
            return res.status(response.status).send(`<h1>Error</h1><p>${errorText}</p>`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error en la petició:", error);
        res.status(500).json({ error: "Error en la petició" });
    }
});

// Serveix el fitxer HTML per qualsevol altra ruta que no sigui una API
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../index.html"));
});

const PORT = process.env.PORT || 3000; // Usa el port 3000 per defecte o un port definit a l'entorn
app.listen(PORT, () => {
    console.log(`Servidor en funcionament a http://localhost:${PORT}`);
});

app.use(helmet());

export default app;