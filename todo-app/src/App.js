import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Buy groceries", description: "Milk, eggs, bread", completed: false },
    { id: 2, title: "Finish homework", description: "Math and science", completed: true },
    { id: 3, title: "Call mom", completed: false },
  ]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/todos')
      .then((res) => {
        // Merge hardcoded tasks with backend data, avoiding duplicates by ID
        const backendTasks = res.data.map(task => ({ ...task, id: task._id }));
        const mergedTasks = [...tasks, ...backendTasks.filter(bt => !tasks.some(t => t.id === bt.id))];
        setTasks(mergedTasks);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    axios
      .post('http://localhost:5000/api/todos', {
        title,
        description,
        completed: false,
      })
      .then((res) => {
        setTasks([...tasks, { ...res.data, id: res.data._id }]);
        setTitle('');
        setDescription('');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleUpdate = (id) => {
    setLoading(true);
    axios
      .put(`http://localhost:5000/api/todos/${id}`, {
        title: editTitle,
        description: editDescription,
        completed: tasks.find(t => t.id === id).completed, // Preserve completion
      })
      .then((res) => {
        setTasks(tasks.map((task) => (task.id === id ? res.data : task)));
        setEditingTask(null);
        setEditTitle('');
        setEditDescription('');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    axios
      .delete(`http://localhost:5000/api/todos/${id}`)
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleToggleComplete = (id, completed) => {
    setLoading(true);
    axios
      .patch(`http://localhost:5000/api/todos/${id}/complete`, {
        completed: !completed,
      })
      .then((res) => {
        setTasks(tasks.map((task) => (task.id === id ? res.data : task)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold text-center mb-6">To-Do App</h1>
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      <form onSubmit={handleAddTask} className="mb-6 flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading}
        >
          Add Task
        </button>
      </form>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleComplete(task.id, task.completed)}
                className="mr-3"
              />
              {editingTask === task.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border p-2 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border p-2 rounded-lg"
                  />
                  <button
                    onClick={() => handleUpdate(task.id)}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="text-gray-600"> - {task.description}</span>
                  )}
                </div>
              )}
            </div>
            {!editingTask && (
              <div>
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;