# Horaris Física UB
Aquest repositori utilitza la API oficial de la UB per obtenir i presentar els horaris acadèmics de les diferents assignatures.

La idea estar en recrear la [guia acadèmica](https://www.ub.edu/guiaacademica/?codEnsenyament=TG1035&curs=2024&idioma=CAT) però fent-la menys odiosa, és a dir separant les assignatures en URLs diferents. Perquè sinó la navegació és bastant horrible.

S'utilitzen tres endpoints de l'API oficial de la UB diferent. Un per obtenir informació sobre el grau, i l'altre per obtenir informació sobre l'assignatura en un semestre concret  (horari, calendaris d'exàmens, professors, etc.).

- Física: [https://www.ub.edu/guiaacademica/rest/guiaacademica/getItinerariGrau/TG1035/2024/CAT](https://www.ub.edu/guiaacademica/rest/guiaacademica/getItinerariGrau/TG1035/2024/CAT)
- Assignatura d'exemple (Física Estadística - 2n semestre): [https://www.ub.edu/guiaacademica/rest/guiaacademica/getPlanificacioAssignatura/360580/TG1035/2024/2/CAT](https://www.ub.edu/guiaacademica/rest/guiaacademica/getPlanificacioAssignatura/360580/TG1035/2024/2/CAT)
- Pla docent d'exemple (Física Estadística): [https://www.ub.edu/pladocent/rest/plandocente/getPlaDocent/360580/2024/CAT](https://www.ub.edu/pladocent/rest/plandocente/getPlaDocent/360580/2024/CAT)

Aquest repositori crea una aplicació web amb el framework NextJS i utilitza aquests JSON obtinguts a través de la API, amb un endpoint local, per presentar la informació tal com es desitgi. La web funciona en local fent des del repositori `yarn install` seguit de `yarn dev`. O funciona també en línia, important des de Vercel el repositori i configurant-lo com un projecte de NextJS.

Es pot veure la web en funcionament aquí: [https://horaris-ub.vercel.app/](https://horaris-ub.vercel.app/)
