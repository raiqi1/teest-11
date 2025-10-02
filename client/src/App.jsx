import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchTodosWithToken(savedToken);
    }
  }, []);

  const axiosInstance = axios.create({
    baseURL: API_URL,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        handleLogout();
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      }
      return Promise.reject(error);
    }
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.success) {
        const accessToken = res.data.access_token;
        setToken(accessToken);
        localStorage.setItem("token", accessToken);
        setIsLoggedIn(true);
        setError("");
        fetchTodos(accessToken);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login gagal");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    localStorage.removeItem("token");
    setEmail("");
    setPassword("");
    setTodos([]);
  };

  const fetchTodosWithToken = async (customToken) => {
    try {
      const res = await axios.get(`${API_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${customToken}`,
        },
      });
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchTodos = async (customToken) => {
    try {
      const res = await axios.get(`${API_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${customToken || token}`,
        },
      });
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  const addTodo = async () => {
    if (!text) return;
    try {
      const newTodo = { id: Date.now(), text, completed: false };
      await axiosInstance.post(`/todos`, newTodo);
      setText("");
      fetchTodos();
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  const updateTodo = async (id) => {
    try {
      const todo = todos.find((t) => t.id === id);
      const updated = { ...todo, text };
      await axiosInstance.put(`/todos/${id}`, updated);
      setEditId(null);
      setText("");
      fetchTodos();
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const todo = todos.find((t) => t.id === id);
      const updated = { ...todo, completed: !todo.completed };
      await axiosInstance.put(`/todos/${id}`, updated);
      fetchTodos();
    } catch (err) {
      console.error("Error toggling todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axiosInstance.delete(`/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    input: {
      padding: "8px",
      fontSize: "14px",
      border: "1px solid #ccc",
      width: "100%",
      marginBottom: "10px",
      boxSizing: "border-box",
    },
    button: {
      padding: "8px 16px",
      fontSize: "14px",
      cursor: "pointer",
      border: "1px solid #ccc",
      background: "#f0f0f0",
    },
    error: {
      color: "red",
      fontSize: "14px",
      marginTop: "10px",
    },
    info: {
      marginTop: "10px",
      fontSize: "13px",
      color: "#666",
    },
  };

  return (
    <div style={styles.container}>
      {!isLoggedIn ? (
        <div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.info}>Email: test@test.com | Password: 123456</div>
        </div>
      ) : (
        <div>
          <h2>Todo List</h2>
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
          <br />
          <br />

          <input
            type="text"
            placeholder="Masukkan todo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.input}
          />
          {editId ? (
            <button onClick={() => updateTodo(editId)} style={styles.button}>
              Update
            </button>
          ) : (
            <button onClick={addTodo} style={styles.button}>
              Tambah
            </button>
          )}

          <ul style={{ marginTop: "20px", padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{ marginBottom: "10px", listStyle: "none" }}
              >
                <span
                  style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  onClick={() => toggleComplete(todo.id)}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => {
                    setEditId(todo.id);
                    setText(todo.text);
                  }}
                  style={styles.button}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ ...styles.button, marginLeft: "5px" }}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
