import "./globals.css";

export const metadata = {
  title: "BetterBot AI",
  description:
    "Better World AI to generate response relating to social responsibility query",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">{children}</body>
    </html>
  );
}
