import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm w-96 border">
        <h1 className="text-xl font-semibold mb-6 text-center">CRM Portal Login</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <label className="block text-sm mb-1 text-gray-600">Email</label>
        <input
          type="email"
          className="w-full border rounded-md px-3 py-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block text-sm mb-1 text-gray-600">Password</label>
        <input
          type="password"
          className="w-full border rounded-md px-3 py-2 mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium hover:bg-indigo-700">
          Log in
        </button>
        <p className="text-sm text-center mt-4 text-gray-500">
          No account? <Link to="/register" className="text-indigo-600">Register</Link>
        </p>
        <p className="text-xs text-center mt-4 text-gray-400">
          Demo: admin@crm.test / password123 (run server seed script first)
        </p>
      </form>
    </div>
  );
};

export default Login;
