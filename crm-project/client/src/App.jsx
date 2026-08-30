import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Customers from "./pages/Customers";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Layout = ({ children }) => (
  <div>
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Layout>
              <Leads />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <ProtectedRoute>
            <Layout>
              <Pipeline />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
