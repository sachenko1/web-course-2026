export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <article className={`tx-item ${todo.completed ? 'completed' : ''}`}>
      <button
        type="button"
        className="tx-left"
        onClick={() => onToggle(todo.id)}
        aria-pressed={todo.completed}
      >
        <span className={`check-box ${todo.completed ? 'checked' : ''}`}>
          {todo.completed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="tx-title">{todo.text}</span>
      </button>
      <button type="button" className="icon-btn del" onClick={() => onDelete(todo.id)} aria-label="Удалить">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </article>
  );
}