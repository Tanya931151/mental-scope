export default function StatCard({ title, value, icon, unit }) {
  const isEmpty = value === "No data" || value === null || value === undefined;

  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <h4 className="stat-title">{title}</h4>
      </div>

      <p className={`stat-value ${isEmpty ? "muted" : ""}`}>
        {isEmpty ? "No data yet" : `${value}${unit ?? ""}`}
      </p>
    </div>
  );
}
