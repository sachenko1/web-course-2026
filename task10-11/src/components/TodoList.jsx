import TodoItem from './TodoItem.jsx';

export default function TodoList({ todos, onToggle, onDelete }) {
  if (!todos.length) {
    return (
      <div className="tx-list">
        <div className="empty">Задач не найдено</div>
      </div>
    );
  }

  return (
    <div className="tx-list">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}