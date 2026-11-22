import { useState } from 'react';

export default function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return setError('Введите текст задачи');
    onAdd(clean);
    setText('');
    setError('');
  };

  return (
    <form className="card-section" onSubmit={handleSubmit} noValidate>
      <div className="row-submit">
        <input
          type="text"
          value={text}
          onChange={e => {
            setText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Новая задача..."
        />
        <button type="submit" className="btn btn-primary">Добавить</button>
      </div>
      {error && <div className="error-box">{error}</div>}
    </form>
  );
}