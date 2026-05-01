import "./globals.css";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { ToastRegion } from "@/components/toast-region";

export const metadata = {
  title: "FredoCloud Team Hub",
  description: "Collaborative Team Hub monorepo scaffold"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthBootstrap>
          <ToastRegion />
          {children}
        </AuthBootstrap>
      </body>
    </html>
  );
}
