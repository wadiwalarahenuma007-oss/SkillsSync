import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import LogoutModal from "./LogoutModal";
import SwitchRoleModal from "./SwitchRoleModal";

import LogoDark from "../../assets/Logo-dark.png";
import LogoLight from "../../assets/Logo-light.png";

import {
  RiDashboardLine,
  RiCalendarLine,
  RiTeamLine,
  RiFileListLine,
  RiStarLine,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
  RiExchangeLine,
  RiMessage3Line,
  RiWallet3Line,
  RiNotification3Line,
  RiUserLine,
  RiLogoutBoxLine,
  RiMoonLine,
  RiSunLine,
  RiCloseLine
} from "react-icons/ri";

import "./MentorSidebar.css";

const mentorLinks = [
  {
    to: "/mentor",
    icon: <RiDashboardLine />,
    label: "Dashboard",
  },
  {
    to: "/mentor/profile",
    icon: <RiUserLine />,
    label: "Profile",
  },
  {
    to: "/mentor/sessions",
    icon: <RiCalendarLine />,
    label: "Sessions",
  },
  {
    to: "/mentor/students",
    icon: <RiTeamLine />,
    label: "My Students",
  },
  {
    to: "/mentor/tests",
    icon: <RiFileListLine />,
    label: "Create Tests",
  },
  {
    to: "/mentor/reviews",
    icon: <RiStarLine />,
    label: "Reviews",
  },
  {
    to: "/mentor/verification",
    icon: <RiShieldCheckLine />,
    label: "Verification",
  },
  {
    to: "/mentor/requests",
    icon: <RiExchangeLine />,
    label: "Requests",
  },
  {
    to: "/mentor/chat",
    icon: <RiMessage3Line />,
    label: "Chat",
  },
  {
    to: "/mentor/wallet",
    icon: <RiWallet3Line />,
    label: "Wallet",
  },
  {
    to: "/mentor/notifications",
    icon: <RiNotification3Line />,
    label: "Notifications",
  },

];

const MentorSidebar = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();

  const navigate = useNavigate();

  const getAvatarSrc = (user) => {
    const pic = user?.profilePicture || user?.avatar;
    if (!pic) return null;
    if (pic.startsWith("http") || pic.startsWith("data:")) return pic;
    return `https://skillssync-a4r9.onrender.com${pic}`;
  };

  const avatarUrl = getAvatarSrc(user);

  /* ── Logout modal state ── */
  const [showLogout, setShowLogout] = useState(false);

  /* ── Switch Role modal state ── */
  const [showSwitch, setShowSwitch] = useState(false);

  const confirmLogout = async () => {
    try {
      await fetch("https://skillssync-a4r9.onrender.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  /* ── Switch to Student: update localStorage then navigate ── */
  const confirmSwitchRole = () => {
    setShowSwitch(false);
    localStorage.setItem("activeRole", "student");
    navigate("/dashboard");
  };

  return (
    <>
      <LogoutModal
        isOpen={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={confirmLogout}
        userName={user?.name}
      />
      <SwitchRoleModal
        isOpen={showSwitch}
        currentRole="mentor"
        onCancel={() => setShowSwitch(false)}
        onConfirm={confirmSwitchRole}
      />

      <aside className={`mentor-sidebar ${isOpen ? "open" : ""}`}>

      {/* Logo */}
      <div className="sidebar-header"
        style={{
          padding: '1.25rem 1.25rem 0.75rem'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'self-start', gap: '0.5rem' }}>
            <div style={{
              paddingLeft: 30,
              width: 100, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}><Link to="/" className="flex items-center shrink-0">
                <img
                  // src={LogoDark}
                  src={isDark ? LogoLight : LogoDark}
                  alt="SkillSync"
                  className="block w-auto h-24 sm:h-36"
                />
              </Link></div>


          </div>
          <button onClick={onClose} className="btn-ghost sidebar-close-btn" style={{ padding: '0.25rem' }} id="sidebar-close">
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* User info */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} className="avatar" style={{ width: 40, height: 40 }} />
          ) : (
            <div className="avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                {user?.isMentor ? 'mentor' : (user?.role || 'user')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LINKS */}

      <nav className="mentor-nav">

        {mentorLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/mentor"}
            onClick={onClose} // Close sidebar on link click
            className={({ isActive }) =>
              isActive
                ? "mentor-link active"
                : "mentor-link"
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

      </nav>

      {/* FOOTER */}

      <div className="mentor-sidebar-footer">

        {/* Switch to Student — only for dual-role users (isMentor=true means they also have student access) */}
        <button
          onClick={() => setShowSwitch(true)}
          className="mentor-link footer-btn"
          style={{ color: '#a78bfa' }}
        >
          <RiExchangeLine />
          <span>Switch to Student</span>
        </button>

        <button
          onClick={toggleTheme}
          className="mentor-link footer-btn"
        >
          {isDark ? <RiSunLine /> : <RiMoonLine />}
          <span>
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        <button
          onClick={() => setShowLogout(true)}
          className="mentor-link footer-btn logout"
        >
          <RiLogoutBoxLine />
          <span>Logout</span>
        </button>

      </div>

    </aside>
    </>
  );
};

export default MentorSidebar;

