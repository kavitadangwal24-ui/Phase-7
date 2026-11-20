
import { LogOut, Sparkles, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <Sparkles size={22} />
        </div>
        <span>CollabSphere</span>
      </div>

      <div className="navbar-user">
        <div className="navbar-user-info">
          <UserCircle size={21} />
          <span>{user?.name || "Developer"}</span>
        </div>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

