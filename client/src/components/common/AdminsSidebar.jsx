import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom"
import LogoDark from "../../assets/Logo-dark.png";
import React, { useEffect, useState } from "react";
import LogoLight from "../../assets/Logo-light.png";
import LogoutModal from "./LogoutModal";
import {
    RiDashboardLine,
    RiUserLine,
    RiTeamLine,
    RiCodeBoxLine,
    RiExchangeLine,
    RiStarLine,
    RiVipCrownLine,
    RiBarChartLine,
    RiMoonLine,
    RiSunLine,
    RiCloseLine,
    RiLogoutBoxLine,
    RiBellLine,
} from "react-icons/ri";

import "./AdminSidebar.css";

const adminLinks = [
    {
        to: "/admin",
        icon: <RiDashboardLine />,
        label: "Dashboard",
    },
    {
        to: "/admin/users",
        icon: <RiUserLine />,
        label: "Users",
    },
    {
        to: "/admin/mentors",
        icon: <RiTeamLine />,
        label: "Mentors",
    },
    {
        to: "/admin/skills",
        icon: <RiCodeBoxLine />,
        label: "Skills",
    },
    {
        to: "/admin/requests",
        icon: <RiExchangeLine />,
        label: "Skill Requests",
    },
    {
        to: "/admin/reviews",
        icon: <RiStarLine />,
        label: "Reviews",
    },
    {
        to: "/admin/membership",
        icon: <RiVipCrownLine />,
        label: "Membership",
    },
    // {
    //     to: "/admin/coins",
    //     icon: <RiCoinLine />,
    //     label: "Coins",
    // },
    {
        to: "/admin/reports",
        icon: <RiBarChartLine />,
        label: "Reports",
    },
    {
        to: "/admin/notifications",
        icon: <RiBellLine />,
        label: "Notifications",
    },
];

const AdminSidebar = ({ isOpen, onClose }) => {
    const { isDark, toggleTheme } = useTheme();
    const { user, setUser } = useAuth();
    const avatarUrl = user?.profilePicture;

    const navigate = useNavigate();

    /* ── Logout modal state ── */
    const [showLogout, setShowLogout] = useState(false);

    const confirmLogout = async () => {
        try {
            await fetch("https://skillssync-a4r9.onrender.com/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        } finally {
            setUser(null);
            navigate("/");
        }
    };

    return (
        <>
            {/* Logout confirmation modal */}
            <LogoutModal
                isOpen={showLogout}
                onCancel={() => setShowLogout(false)}
                onConfirm={confirmLogout}
                userName={user?.name}
            />

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="admin-overlay"
                    onClick={onClose}
                />
            )}

            <aside
                className={`admin-sidebar ${isOpen ? "open" : ""}`}
            >
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
                                    {user?.role}
                                </span>
                                {/* <span className="coin-badge" style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
                                    🪙 {user?.skillCoins}
                                </span> */}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Navigation */}
                <nav className="admin-nav">

                    {adminLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/admin"}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `admin-nav-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="admin-nav-icon">
                                {link.icon}
                            </span>

                            <span>
                                {link.label}
                            </span>
                        </NavLink>
                    ))}

                </nav>

                {/* Bottom Actions */}
                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-nav-link admin-action-btn"
                        onClick={toggleTheme}
                    >
                        <span className="admin-nav-icon">
                            {isDark ? (
                                <RiSunLine />
                            ) : (
                                <RiMoonLine />
                            )}
                        </span>

                        {isDark ? "Light Mode" : "Dark Mode"}
                    </button>

                    <button
                        className="admin-nav-link admin-logout"
                        onClick={() => setShowLogout(true)}
                    >
                        <span className="admin-nav-icon">
                            <RiLogoutBoxLine />
                        </span>

                        Logout
                    </button>

                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
