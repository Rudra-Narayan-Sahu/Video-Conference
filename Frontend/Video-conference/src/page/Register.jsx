import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!name || !username || !password) {
      setError("Please fill in all fields (Name, Username, Password)");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await axios.post(`${API}/api/v1/users/register`, {
        name,
        username,
        password,
      });
      console.log("Register response:", res.data);
      setSuccess("Registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
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
          style={{ padding: "10px", borderRadius: "4px", border: "none", backgroundColor: "#28a745", color: "#fff", cursor: "pointer" }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "16px" }}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
}