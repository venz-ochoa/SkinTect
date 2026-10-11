//card — simple container with a title and content
//claude generated UI
export default function Card({ title, children }) {
  return (
    <div className="bg-surface rounded-lg p-4">
      {title && <h3 className="font-bold text-text mb-2">{title}</h3>}
      {children}
    </div>
  );
}