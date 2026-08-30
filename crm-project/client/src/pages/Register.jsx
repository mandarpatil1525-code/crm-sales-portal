import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales_rep" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm w-96 border">
        <h1 className="text-xl font-semibold mb-6 text-center">Create account</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <label className="block text-sm mb-1 text-gray-600">Name</label>
        <input name="name" className="w-full border rounded-md px-3 py-2 mb-4" value={form.name} onChange={handleChange} required />
        <label className="block text-sm mb-1 text-gray-600">Email</label>
        <input name="email" type="email" className="w-full border rounded-md px-3 py-2 mb-4" value={form.email} onChange={handleChange} required />
        <label className="block text-sm mb-1 text-gray-600">Password</label>
        <input name="password" type="password" className="w-full border rounded-md px-3 py-2 mb-4" value={form.password} onChange={handleChange} required />
        <label className="block text-sm mb-1 text-gray-600">Role</label>
        <select name="role" className="w-full border rounded-md px-3 py-2 mb-6" value={form.role} onChange={handleChange}>
          <option value="sales_rep">Sales Representative</option>
          <option value="admin">Admin / Sales Manager</option>
        </select>
        <button className="w-full bg-indigo-600 text-white rounded-md py-2 font-medium hover:bg-indigo-700">
          Register
        </button>
        <p className="text-sm text-center mt-4 text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
