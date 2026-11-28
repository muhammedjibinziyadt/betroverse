export const metadata = {
  title: "Betroverse | Agency CMS Admin",
};

export default function AdminLayout({ children }) {
  return (
    <>
      <link rel="stylesheet" href="/css/admin.css?v=13" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
