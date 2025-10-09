export default function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}
