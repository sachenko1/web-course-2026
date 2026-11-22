export default function Stats({ total, active, completed }) {
  return (
    <div className="stats-panel">
      <div className="stat-item">
        <span className="stat-label">Всего</span>
        <strong className="stat-value">{total}</strong>
      </div>
      <div className="stat-item">
        <span className="stat-label">Осталось</span>
        <strong className="stat-value accent">{active}</strong>
      </div>
      <div className="stat-item">
        <span className="stat-label">Выполнено</span>
        <strong className="stat-value done">{completed}</strong>
      </div>
    </div>
  );
}