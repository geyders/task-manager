import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Не вдалося отримати завдання', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        title,
        description,
      });

      setTasks((currentTasks) => [response.data, ...currentTasks]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Не вдалося створити завдання', error);
    }
  };

  const toggleTask = async (task) => {
    try {
      const response = await axios.put(`${API_URL}/${task._id}`, {
        status: task.status === 'pending' ? 'completed' : 'pending',
      });

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? response.data : item,
        ),
      );
    } catch (error) {
      console.error('Не вдалося оновити завдання', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id),
      );
    } catch (error) {
      console.error('Не вдалося видалити завдання', error);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Task Manager</h1>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Назва завдання"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <input
            type="text"
            placeholder="Опис завдання"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <button type="submit">Додати</button>
        </form>

        {loading ? (
          <p className="message">Завантаження...</p>
        ) : tasks.length === 0 ? (
          <p className="message">Поки що немає завдань</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task" key={task._id}>
                <div>
                  <h3 className={task.status === 'completed' ? 'done' : ''}>
                    {task.title}
                  </h3>

                  {task.description && <p>{task.description}</p>}

                  <span className="status">
                    {task.status === 'completed'
                      ? 'Виконано'
                      : 'В процесі'}
                  </span>
                </div>

                <div className="actions">
                  <button onClick={() => toggleTask(task)}>
                    {task.status === 'completed'
                      ? 'Повернути'
                      : 'Виконано'}
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteTask(task._id)}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;