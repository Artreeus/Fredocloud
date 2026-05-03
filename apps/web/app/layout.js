import "./globals.css";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { ToastRegion } from "@/components/toast-region";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "FredoCloud Team Hub",
  description: "Collaborative Team Hub monorepo scaffold"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-canvas dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthBootstrap>
            <ToastRegion />
            {children}
          </AuthBootstrap>
        </ThemeProvider>
      </body>
    </html>
  );
}
