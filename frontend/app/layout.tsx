import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sundance Renovations",
  description: "Track renovation projects from planning through completion",
};

const themeScript = `
try {
  const stored = localStorage.getItem("kanban-boards-v2");
  if (stored && JSON.parse(stored).preferences?.darkMode) {
    document.documentElement.classList.add("dark");
  }
} catch {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
