import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Carrega Font Awesome */}
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                />
                <link rel="icon" href="/favicon.ico" />
                <title>Horaris Física UB</title>
                <meta property="og:title" content="Horaris Física UB" />
                <meta property="og:description" content="Versió alternativa a la Guia Acadèmica de Física UB per consultar horaris, plans docents i altra informació sobre les assignatures del grau." />
                <meta property="og:image" content="/horaris-ub.jpg" />
                <meta property="og:url" content="https://horaris.ub.fisica.cat" />
                <meta property="og:type" content="website" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}