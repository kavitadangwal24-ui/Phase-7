
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-layout-body">
        <Sidebar />

        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
