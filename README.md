# Horaris Física UB
Aquest repositori utilitza l'API oficial de la UB per obtenir i presentar els horaris, grups, professors, plans docents, etc. de les diferents assignatures.

La idea inicial era recrear la [guia acadèmica](https://www.ub.edu/guiaacademica/?codEnsenyament=TG1035&curs=2025&idioma=CAT) però fent-la menys odiosa, és a dir separant les assignatures en URLs diferents, per tal d'evitar que la navegació sigui frustrant i per permetre compartir l'enllaç d'una assignatura concreta.

S'utilitzen tres endpoints de l'API oficial de la UB diferents. Un per obtenir informació sobre el grau, un altre per obtenir informació sobre una assignatura en un semestre concret (horari, calendaris d'exàmens, professors, etc.) i un altre per obtenir informació sobre el pla docent d'una assignatura.

- Física: [https://www.ub.edu/guiaacademica/rest/guiaacademica/getItinerariGrau/TG1035/2025/CAT](https://www.ub.edu/guiaacademica/rest/guiaacademica/getItinerariGrau/TG1035/2025/CAT)
- Assignatura d'exemple (Física Estadística - 2n semestre): [https://www.ub.edu/guiaacademica/rest/guiaacademica/getPlanificacioAssignatura/360580/TG1035/2025/2/CAT](https://www.ub.edu/guiaacademica/rest/guiaacademica/getPlanificacioAssignatura/360580/TG1035/2025/2/CAT)
- Pla docent d'exemple (Física Estadística): [https://www.ub.edu/pladocent/rest/plandocente/getPlaDocent/360580/2025/CAT](https://www.ub.edu/pladocent/rest/plandocente/getPlaDocent/360580/2025/CAT)

Nota per si a algú li interessa: La API de la UB, així com moltes altres APIs (per exemple la de Rodalies) són públiques en el sentit que són públicament accessibles, però no estan documentades com ho estarien la majoria d'APIs d'aplicacions d'empreses de software. Aleshores la manera típica per trobar aquests endpoints és trobar una web que els utilitzi (la guia acadèmica oficial en aquest cas) i simplement obrir la consola de l'inspector del navegador i filtrar els esdeveniments XHR. D'aquesta manera al fer clic a una assignatura, un pla docent, una aula, etc. es pot veure a quines URLs es fan els http requests, és a dir en les URLs que utilitza el navegador per fer la petició, i entre aquestes hi haurà els endpoints esmentats abans.

Aquest repositori funciona amb el framework NextJS, la web està publicada a Vercel i és accessible tant a [horaris-ub.vercel.app](https://horaris-ub.vercel.app/) com a [horaris.ub.fisica.cat](https://horaris.ub.fisica.cat).

Recentment s'ha afegit a la web dues pestanyes addicionals a part de la guia acadèmica, una encarada a recrear el Chronos de la UB, és a dir mostrar els horaris de les assignatures d'un semestre i l'altra dedicada a permetre planificar quines assignatures matricular quan entra un nou any i veure com queda el calendari d'exàmens de les assignatures seleccionades.

Si estàs llegint això i també estudies física a la UB i tens alguna suggerència o voldries modificar-ne alguna cosa, pots fer una Pull Request o obrir un Issue (aquí a GitHub) o simplement escriure'm a `pardo.marti@gmail.com`.