import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://horaris.ub.fisica.cat'),
    title: 'Horaris Física UB',
    description: 'Versió alternativa a la Guia Acadèmica de Física UB per consultar horaris, plans docents i altra informació sobre les assignatures del grau.',
    openGraph: {
        title: 'Horaris Física UB',
        description: 'Versió alternativa a la Guia Acadèmica de Física UB per consultar horaris, plans docents i altra informació sobre les assignatures del grau.',
        images: [{ url: '/horaris-ub.jpg' }],
        url: 'https://horaris.ub.fisica.cat',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ca">
            <body>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                />
                {children}
            </body>
        </html>
    );
}
