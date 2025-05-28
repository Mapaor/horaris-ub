let itineraris = undefined;

document.addEventListener("DOMContentLoaded", () => {
    // Actualitza la URL per enviar el "slug" com a paràmetre de consulta
    const url = `/api/horaris?slug=getItinerariGrau/TG1035/2024/CAT`;
    let dom_itineraris = document.getElementById("itineraris");
    
    fetch(url)
        .then(response => response.json())
        .then(json => {
            itineraris = json.datos;
            itineraris.forEach(itinerari => {
                let dom_itinerari = createItinerari(itinerari);
                dom_itineraris.appendChild(dom_itinerari);
            }); 
        })
        .catch(error => console.error("Error en la petició:", error));
});

function createItinerari(itinerari) {
    let dom_itinerari = document.createElement("fluent-option");
    dom_itinerari.textContent = itinerari.descItinerari;
    dom_itinerari.addEventListener('click', () => {
        console.log("Clicked " + itinerari.descItinerari);
        setAssignatures(itinerari);
    });
    return dom_itinerari;
}

function setAssignatures(itinerari) {
    let dom_assignatures = document.getElementById("assignatures");
    itinerari.assignatures.sort((x, y) => parseInt(x.cursImparticio) - parseInt(y.cursImparticio));
    console.log(itinerari.assignatures);
    dom_assignatures.rowsData = itinerari.assignatures.map(x => ({ "Curs": x.cursImparticio, "Nom": x.descAssignatura }));
}


// /api/horaris/getItinerariGrau/TG1035/2024/CAT -> totes les assignatures
// /api/horaris/getPlanificacioAssignatura/${id}/TG1035/2024/1/CAT -> info de l'assignatura


// document.getElementById("butt").addEventListener("click", function () {
//     let id = document.getElementById("id-horari").value;
//     const url = `/api/horaris/getPlanificacioAssignatura/${id}/TG1035/2024/1/CAT`;  // Aquesta és la ruta que has definit al servidor

//     fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             document.getElementById("result").innerHTML = JSON.stringify(data, null, 2);
//         })
//         .catch(error => {
//             console.error("Error en la petició:", error);
//             document.getElementById("result").innerHTML = "Error en la petició";
//         });

// })