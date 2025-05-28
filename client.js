document.addEventListener("DOMContentLoaded", function () {
    const url = "/api/horaris";  // Aquesta és la ruta que has definit al servidor

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("result").innerHTML = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error("Error en la petició:", error);
            document.getElementById("result").innerHTML = "Error en la petició";
        });
});
