import './globals.css';

export const metadata = {
  title: 'Radar de Passagens',
  description: 'Monitore promoções de passagens aéreas em várias companhias, em tempo real.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-sky-100 text-ink font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
