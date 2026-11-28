import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata = {
  title: "Betroverse | The Solution for Professional Teams",
  description:
    "Our team blends creativity and technology to build impactful digital campaigns that take your brand beyond the competition.",
  keywords: "Betroverse, digital marketing, video production, social media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
