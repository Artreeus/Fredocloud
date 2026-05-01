import "./globals.css";

export const metadata = {
  title: "FredoCloud Team Hub",
  description: "Collaborative Team Hub monorepo scaffold"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
