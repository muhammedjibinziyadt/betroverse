export default function PublicLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/css/style.css?v=4.0" />
      <link rel="stylesheet" href="/css/portfolio-redesign.css?v=3.7" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
      />
      {children}
    </>
  );
}
