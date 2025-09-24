import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Tá Pago - Fitness Tracker",
  description: "App de controle de treinos e acompanhamento fitness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
