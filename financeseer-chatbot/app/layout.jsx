import "./globals.css"

export const metadata = {
  title: "FinanceSeer - AI Financial Assistant",
  description: "Educational AI financial insights and analysis tool",
  generator: "v0.dev",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
