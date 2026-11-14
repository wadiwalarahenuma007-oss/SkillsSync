import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../common/StudentSidebar";
import { RiMenuLine } from "react-icons/ri";
import "./Studentlayout.css";


const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="student-layout">

      {/* Sidebar */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mobile-menu-button"
        >
          <RiMenuLine size={26} />
        </button>

        <span className="mobile-logo">
          SkillSync
        </span>
      </header>

      {/* Overlay
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}

      {/* Main Content */}
      <main className="main-content">
        <div className="student-page-container">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default StudentLayout;
