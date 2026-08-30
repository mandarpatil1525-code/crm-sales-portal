import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg text-indigo-600">CRM Portal</span>
        <div className="ml-6 flex gap-1">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/leads" className={linkClass}>Leads</NavLink>
          <NavLink to="/pipeline" className={linkClass}>Pipeline</NavLink>
          <NavLink to="/customers" className={linkClass}>Customers</NavLink>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
