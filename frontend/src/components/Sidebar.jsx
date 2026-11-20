
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  FolderOpen,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={19} />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FolderKanban size={19} />,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: <FileText size={19} />,
    },
    {
      name: "Files",
      path: "/files",
      icon: <FolderOpen size={19} />,
    },
    {
      name: "AI Assistant",
      path: "/ai",
      icon: <Sparkles size={19} />,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <span>WORKSPACE</span>
        <PanelLeftClose size={18} />
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Sparkles size={17} />
        <span>Build. Collaborate. Grow.</span>
      </div>
    </aside>
  );
}

export default Sidebar;
