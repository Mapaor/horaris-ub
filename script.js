import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from 'url';
import helmet from "helmet";

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

app.get("/:idAssignatura", async (req, res) => {
    const idAssignatura = req.params.idAssignatura;
    const url = `https://www.ub.edu/guiaacademica/rest/guiaacademica/getPlanificacioAssignatura/${idAssignatura}/TG1035/2024/1/CAT`;

    console.log(`Sol·licitant dades per a l'assignatura amb ID: ${idAssignatura}`);
    console.log(`URL de la petició: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`Estat de la resposta: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en la resposta de l'API: ${errorText}`);
            return res.status(response.status).send(`<h1>Error</h1><p>${errorText}</p>`);
        }

        const data = await response.json();
        console.log(`Dades rebudes: ${JSON.stringify(data, null, 2)}`);

        const nomAssignatura = data.datos.assignatura.descAssignatura;

        res.send(`
            <!DOCTYPE html>
            <html lang="ca">
            <head>
                <meta charset="UTF-8">
                <title>${nomAssignatura}</title>
                <style>
                    table {
                        border-collapse: collapse;
                        margin: 20px 0;
                        font-size: 1em;
                        font-family: Arial, sans-serif;
                        width: 100%;
                    }
                    table th, table td {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
                    table th {
                        background-color: #f2f2f2;
                    }
                    table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <h1>${nomAssignatura}</h1>
                <p>Horari de l'assignatura</p>
                <div id="horari"></div>
                <script>
                    const activitats = ${JSON.stringify(data.datos.assignatura.activitats)};
                    ${generaTaulaHoraris.toString()}
                    ${extreuDies.toString()}
                    ${extreuHora.toString()}
                    document.getElementById("horari").appendChild(generaTaulaHoraris(activitats));
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Error en la petició al servidor:", error);
        res.status(500).send("<h1>Error del servidor</h1><p>No s'ha pogut obtenir la informació de l'assignatura.</p>");
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor en funcionament a http://localhost:${PORT}`);
});

// Serveix el fitxer HTML per qualsevol altra ruta que no sigui una API
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Per poder gestionar rutes dimàmiques i evitar problemes de seguretat, utilitzem Helmet
app.use(helmet());