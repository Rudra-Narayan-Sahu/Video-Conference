import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${API}/api/v1/users/login`, {
        username,
        password,
      });
      console.log("Login response:", res.data);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        // navigate to dashboard/home if needed
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px", borderRadius: "4px", border: "none", backgroundColor: "#007bff", color: "#fff", cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "16px" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
