import "./globals.css";
import { AuthBootstrap } from "@/components/auth-bootstrap";

export const metadata = {
  title: "FredoCloud Team Hub",
  description: "Collaborative Team Hub monorepo scaffold"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthBootstrap>{children}</AuthBootstrap>
      </body>
    </html>
  );
}
