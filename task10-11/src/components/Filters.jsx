const TABS = [
  ['all', 'Все'],
  ['active', 'Активные'],
  ['completed', 'Завершённые']
];

export default function Filters({ filter, sort, onFilterChange, onSortChange }) {
  return (
    <div className="filter-row">
      <div className="segmented">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`seg-btn ${filter === value ? 'active' : ''}`}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <select value={sort} onChange={e => onSortChange(e.target.value)} aria-label="Сортировка">
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
        <option value="alpha-asc">По алфавиту (А → Я)</option>
        <option value="alpha-desc">По алфавиту (Я → А)</option>
      </select>
    </div>
  );
}