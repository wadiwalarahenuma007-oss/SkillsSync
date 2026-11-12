import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import LogoDark from "../../assets/Logo-dark.png";
import LogoLight from "../../assets/Logo-light.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"
import LogoutModal from './LogoutModal';
import SwitchRoleModal from './SwitchRoleModal';
import axios from "axios";
import './StudentSidebar.css';
import {
    RiDashboardLine, RiUserLine, RiSearchLine, RiTeamLine,
    RiExchangeLine, RiMessage3Line, RiCoinLine, RiBellLine,
    RiCalendarLine, RiFileListLine, RiBarChartLine, RiLogoutBoxLine,
    RiMoonLine, RiSunLine, RiCloseLine, RiShieldStarLine,RiUserStarLine
} from 'react-icons/ri';

const studentLinks = [
    { to: '/dashboard', icon: <RiDashboardLine />, label: 'Dashboard' },
    { to: '/profile', icon: <RiUserLine />, label: 'Profile' },
    { to: '/browse-skills', icon: <RiSearchLine />, label: 'Browse Skills' },
    { to: '/find-mentors', icon: <RiTeamLine />, label: 'Find Mentors' },
    { to: '/requests', icon: <RiExchangeLine />, label: 'Requests' },
    { to: '/chat', icon: <RiMessage3Line />, label: 'Chat' },
    { to: '/wallet', icon: <RiCoinLine />, label: 'Wallet' },
    { to: '/notifications', icon: <RiBellLine />, label: 'Notifications', badge: true },
    {to: "/become-mentor",icon: <RiUserStarLine />,label: "Become Mentor",},
    { to: '/sessions', icon: <RiCalendarLine />, label: 'Sessions' },
    { to: '/tests', icon: <RiFileListLine />, label: 'Tests' },
    { to: '/progress', icon: <RiBarChartLine />, label: 'Progress' },
    // { to: '/membership', icon: <RiShieldStarLine />, label: 'Premium 👑' },
];
const StudentSidebar = ({ isOpen, onClose }) => {
    const { isDark, toggleTheme } = useTheme();
    const { user, loading, setUser } = useAuth();

    const navigate = useNavigate();

    /* ── Logout modal state ── */
    const [showLogout, setShowLogout] = useState(false);

    /* ── Switch Role modal state (only shown to approved mentors) ── */
    const [showSwitch, setShowSwitch] = useState(false);

    /* ── Unread notification count for bell badge (role-aware) ── */
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const role = user.role === "admin"
            ? "admin"
            : (localStorage.getItem("activeRole") === "mentor" && user.isMentor ? "mentor" : "student");
        axios.get(`https://skillssync-a4r9.onrender.com/api/notifications/unread-count?role=${role}`, { withCredentials: true })
            .then((res) => setUnreadCount(res.data.count || 0))
            .catch(() => {});
    }, [user]);

    /* ── Switch role handler ── */
    const confirmSwitchRole = () => {
        setShowSwitch(false);
        localStorage.setItem("activeRole", "mentor");
        navigate("/mentor");
    };

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

    const avatarUrl = user?.profilePicture
        ? `https://skillssync-a4r9.onrender.com${user.profilePicture}`
        : null;
    if (loading) {
        return null;
    }

    /* Is this user an approved mentor? (dual-role) */
    const isApprovedMentor = user?.isMentor === true && user?.mentorApplicationStatus === "approved";

    return (
        <>
            {/* Logout confirmation modal */}
            <LogoutModal
                isOpen={showLogout}
                onCancel={() => setShowLogout(false)}
                onConfirm={confirmLogout}
                userName={user?.name}
            />
            {/* Switch Role confirmation modal — only for approved dual-role users */}
            <SwitchRoleModal
                isOpen={showSwitch}
                currentRole="student"
                onCancel={() => setShowSwitch(false)}
                onConfirm={confirmSwitchRole}
            />
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 39,
                    }}
                    className="md-overlay"
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}
                style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "fixed",
                    left: 0,
                    top: 0,
                }}
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
                    {studentLinks.map(link => {
                        /* Hide "Become Mentor" for approved mentors — replaced below */
                        if (link.to === '/become-mentor' && isApprovedMentor) return null;
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                                style={{ marginBottom: '0.15rem' }}
                            >
                                <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                                <span style={{ flex: 1 }}>{link.label}</span>
                                {/* Bell badge — only on Notifications link */}
                                {link.badge && unreadCount > 0 && (
                                    <span style={{
                                        minWidth: 18, height: 18, borderRadius: '9999px',
                                        background: '#7c3aed', color: '#fff',
                                        fontSize: '0.65rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '0 4px',
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="sidebar-bottom"
                    style={{
                        padding: '0.75rem'
                    }}>

                    {/* Switch to Mentor — STATIC above theme button, only for approved mentors */}
                    {isApprovedMentor && (
                        <button
                            className="nav-link"
                            style={{ width: '100%', marginBottom: '0.25rem', color: '#a78bfa' }}
                            onClick={() => { onClose(); setShowSwitch(true); }}
                        >
                            <span style={{ fontSize: '1.1rem' }}><RiExchangeLine /></span>
                            <span style={{ flex: 1 }}>Switch to Mentor</span>
                        </button>
                    )}

                    <button onClick={toggleTheme} className="nav-link" style={{ width: '100%', marginBottom: '0.25rem' }}>
                        {isDark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                        onClick={() => setShowLogout(true)}
                        className="nav-link"
                        style={{
                            width: '100%',
                            color: '#f87171'
                        }}
                    >
                        <RiLogoutBoxLine size={18} />
                        Logout
                    </button>

                </div>
            </aside>


        </>
    );
};

export default StudentSidebar;

