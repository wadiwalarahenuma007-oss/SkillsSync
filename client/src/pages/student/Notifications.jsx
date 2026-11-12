import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  RiHandHeartLine,
  RiChat3Line,
  RiCalendarEventLine,
  RiTrophyLine,
  RiCheckLine,
  RiMegaphoneLine,
  RiNotification3Line,
  RiSearchLine,
  RiMoreLine,
  RiArrowDownSLine,
  RiLoader4Line,
} from "react-icons/ri";
import "../../styles/Student/Notifications.css";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

/* ── Type config — keys match Notification.type in DB ── */
const typeConfig = {
  Requests:     { icon: <RiHandHeartLine />,    color: "purple" },
  Messages:     { icon: <RiChat3Line />,         color: "indigo" },
  Sessions:     { icon: <RiCalendarEventLine />, color: "cyan"   },
  Achievements: { icon: <RiTrophyLine />,        color: "amber"  },
  Accepted:     { icon: <RiCheckLine />,         color: "green"  },
  System:       { icon: <RiMegaphoneLine />,     color: "orange" },
};

/* ── Color palettes for DARK theme ── */
const darkPalette = {
  purple: { dot: "#a855f7", boxBg: "rgba(88,28,135,0.25)", boxBorder: "rgba(147,51,234,0.5)", text: "#c4b5fd", btnBorder: "#a855f7", btnText: "#c4b5fd" },
  indigo: { dot: "#6366f1", boxBg: "rgba(49,46,129,0.25)", boxBorder: "rgba(99,102,241,0.5)", text: "#a5b4fc", btnBorder: "#6366f1", btnText: "#a5b4fc" },
  cyan:   { dot: "#22d3ee", boxBg: "rgba(8,145,178,0.15)", boxBorder: "rgba(34,211,238,0.5)", text: "#67e8f9", btnBorder: "#22d3ee", btnText: "#67e8f9" },
  amber:  { dot: "#fbbf24", boxBg: "rgba(120,53,15,0.2)",  boxBorder: "rgba(245,158,11,0.5)", text: "#fcd34d", btnBorder: "#fbbf24", btnText: "#fcd34d" },
  green:  { dot: "#34d399", boxBg: "rgba(6,78,59,0.2)",    boxBorder: "rgba(52,211,153,0.5)", text: "#6ee7b7", btnBorder: "#34d399", btnText: "#6ee7b7" },
  orange: { dot: "#fb923c", boxBg: "rgba(124,45,18,0.2)",  boxBorder: "rgba(251,146,60,0.5)", text: "#fdba74", btnBorder: "#fb923c", btnText: "#fdba74" },
};

/* ── Color palettes for LIGHT theme ── */
const lightPalette = {
  purple: { dot: "#7c3aed", boxBg: "rgba(124,58,237,0.08)", boxBorder: "rgba(124,58,237,0.3)", text: "#5b21b6", btnBorder: "#7c3aed", btnText: "#5b21b6" },
  indigo: { dot: "#4f46e5", boxBg: "rgba(79,70,229,0.08)",  boxBorder: "rgba(79,70,229,0.3)",  text: "#3730a3", btnBorder: "#4f46e5", btnText: "#3730a3" },
  cyan:   { dot: "#0891b2", boxBg: "rgba(8,145,178,0.08)",  boxBorder: "rgba(8,145,178,0.3)",  text: "#0e7490", btnBorder: "#0891b2", btnText: "#0e7490" },
  amber:  { dot: "#d97706", boxBg: "rgba(217,119,6,0.08)",  boxBorder: "rgba(217,119,6,0.3)",  text: "#92400e", btnBorder: "#d97706", btnText: "#92400e" },
  green:  { dot: "#059669", boxBg: "rgba(5,150,105,0.08)",  boxBorder: "rgba(5,150,105,0.3)",  text: "#065f46", btnBorder: "#059669", btnText: "#065f46" },
  orange: { dot: "#ea580c", boxBg: "rgba(234,88,12,0.08)",  boxBorder: "rgba(234,88,12,0.3)",  text: "#9a3412", btnBorder: "#ea580c", btnText: "#9a3412" },
};


/* ── Group notifications by date label ── */
const getGroup = (dateStr) => {
  const d     = new Date(dateStr);
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest  = new Date(today); yest.setDate(today.getDate() - 1);
  const nDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (nDate.getTime() === today.getTime()) return "Today";
  if (nDate.getTime() === yest.getTime())  return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

/* ── Time ago helper ── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins} min${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const TABS = ["All", "Requests", "Accepted", "Messages", "Sessions", "Achievements", "System"];

const Notifications = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const colorPalette = isDark ? darkPalette : lightPalette;

  /* ── Determine current role context ─────────────────────────────
     admin  → always "admin"
     dual-role user who chose mentor → "mentor"
     everyone else → "student"
  ────────────────────────────────────────────────────────────────── */
  const currentRole = useMemo(() => {
    if (!user) return "student";
    if (user.role === "admin") return "admin";
    const stored = localStorage.getItem("activeRole"); // "mentor" | "student" | null
    if (stored === "mentor" && user.isMentor) return "mentor";
    return "student";
  }, [user]);

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]        = useState(true);
  const [activeTab,     setActiveTab]      = useState("All");
  const [menuOpen,      setMenuOpen]       = useState(false);
  const [search,        setSearch]         = useState("");
  const [readFilter,    setReadFilter]     = useState("all");   // "all" | "unread" | "read"
  const [dropdownOpen,  setDropdownOpen]   = useState(false);   // "All Notifications" dropdown
  const dropdownRef = useRef(null);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch from real API — pass role for server-side filtering ── */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://skillssync-a4r9.onrender.com/api/notifications?role=${currentRole}`,
        { withCredentials: true }
      );
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [currentRole]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Mark all read via API ── */
  const markAllRead = async () => {
    setMenuOpen(false);
    try {
      await axios.put(
        `https://skillssync-a4r9.onrender.com/api/notifications/read-all?role=${currentRole}`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  /* ── Mark one read + navigate (role-safe) ── */
  const handleAction = async (n) => {
    try {
      await axios.put(
        `https://skillssync-a4r9.onrender.com/api/notifications/${n._id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((item) => item._id === n._id ? { ...item, isRead: true } : item)
      );
    } catch (err) { console.error(err); }
    if (n.link) navigate(n.link);
  };

  /* ── Delete one notification ── */
  const deleteNotif = async (id) => {
    try {
      await axios.delete(
        `https://skillssync-a4r9.onrender.com/api/notifications/${id}`,
        { withCredentials: true }
      );
      setNotifications((prev) => prev.filter(n => n._id !== id));
    } catch (err) { console.error("Delete notification error:", err); }
  };

  /* ── Filter: tab + search + readFilter + targetRole safety-net ─────────────── */
  const filtered = useMemo(() =>
    notifications
      // Client-side role safety net: show only targetRole matching or legacy null
      .filter((n) => !n.targetRole || n.targetRole === currentRole)
      .filter((n) => activeTab === "All" ? true : n.type === activeTab)
      .filter((n) => readFilter === "all" ? true : readFilter === "unread" ? !n.isRead : n.isRead)
      .filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
      ),
  [notifications, activeTab, search, currentRole, readFilter]);


  /* ── Group by date ── */
  const grouped = useMemo(() =>
    filtered.reduce((acc, n) => {
      const g = getGroup(n.createdAt);
      acc[g] = acc[g] || [];
      acc[g].push(n);
      return acc;
    }, {}),
  [filtered]);

  return (
    <div className="notifications-page">

      {/* ── HEADER ── */}
      <div className="notif-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h1>Notifications</h1>
          <button
            onClick={markAllRead}
            title="Mark all as read"
            style={{
              position: "relative", width: 36, height: 36, borderRadius: "9999px",
              border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8",
            }}
          >
            <RiNotification3Line size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                width: 20, height: 20, borderRadius: "9999px",
                background: "#7c3aed", color: "#fff",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="notif-search">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
          />
          <RiSearchLine style={{ color: "#94a3b8", flexShrink: 0 }} size={18} />
        </div>
      </div>

      {/* ── TABS + ACTIONS ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="notif-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`notif-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", position: "relative" }}>
          {/* ── All Notifications read-filter dropdown ── */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 1rem", borderRadius: "0.75rem",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
                background: isDark ? "#1a1a2e" : "#ffffff",
                color: isDark ? "#94a3b8" : "#6b7280",
                fontSize: "0.875rem", cursor: "pointer",
              }}
            >
              {readFilter === "all" ? "All Notifications" : readFilter === "unread" ? "Unread" : "Read"}
              <RiArrowDownSLine size={16} style={{ transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
                background: isDark ? "#1a1a2e" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                borderRadius: "0.75rem", minWidth: 160,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)", overflow: "hidden",
              }}>
                {[
                  { value: "all",    label: "All Notifications" },
                  { value: "unread", label: "Unread" },
                  { value: "read",   label: "Read" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setReadFilter(opt.value); setDropdownOpen(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "0.6rem 1rem", background: "transparent",
                      border: "none", cursor: "pointer",
                      color: readFilter === opt.value
                        ? "#a78bfa"
                        : isDark ? "#94a3b8" : "#6b7280",
                      fontWeight: readFilter === opt.value ? 700 : 400,
                      fontSize: "0.875rem",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.color = "#a78bfa"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = readFilter === opt.value ? "#a78bfa" : isDark ? "#94a3b8" : "#6b7280"; }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── More menu (⋯) ── */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                width: 36, height: 36, borderRadius: "0.75rem",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
                background: isDark ? "#1a1a2e" : "#ffffff",
                color: isDark ? "#94a3b8" : "#6b7280",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <RiMoreLine size={18} />
            </button>
            {menuOpen && (
              <div className="notif-more-menu">
                <button onClick={markAllRead} style={{ color: "#94a3b8" }} onMouseOver={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.color = "#a78bfa"; }} onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>

      {/* ── NOTIFICATION LIST ── */}
      <div className="notif-list-card">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: "1rem", color: "#94a3b8" }}>
            <RiLoader4Line size={36} style={{ animation: "spin 1s linear infinite" }} />
            <p>Loading notifications...</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="notif-empty">No notifications found.</div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} style={{ marginBottom: "1.5rem" }}>
              <h2 className="notif-group-heading">{group}</h2>

              <div style={{ position: "relative" }}>
                {items.map((n, idx) => {
                  const cfg   = typeConfig[n.type] || typeConfig.System;
                  const pal   = colorPalette[cfg.color];
                  const isLast = idx === items.length - 1;
                  const clock  = new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div key={n._id} style={{ display: "flex", gap: "1.25rem" }}>
                      {/* Timeline dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24, flexShrink: 0 }}>
                        <span
                          className="notif-timeline-dot"
                          style={{ background: pal.dot, marginTop: "1.75rem" }}
                        />
                        {!isLast && (
                          <span style={{ position: "absolute", top: "1.75rem", bottom: "-2.5rem", width: 1, background: "rgba(255,255,255,0.08)" }} />
                        )}
                      </div>

                      {/* Card */}
                      <div className="notif-card" style={{ flex: 1, marginBottom: "1rem" }}>
                        <div
                          className="notif-icon-box"
                          style={{ background: pal.boxBg, borderColor: pal.boxBorder, color: pal.text }}
                        >
                          {cfg.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                            <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0" }}>{n.title}</h3>
                            {!n.isRead && <span className="notif-new-badge">New</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>{n.message}</p>
                          <p style={{ margin: "0.375rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>{clock}</p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", flexShrink: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{timeAgo(n.createdAt)}</span>
                            <button
                              title="Delete notification"
                              onClick={() => deleteNotif(n._id)}
                              style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, padding: "2px 4px", borderRadius: "4px" }}
                              onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
                              onMouseOut={e => e.currentTarget.style.color = "#64748b"}
                            >✕</button>
                          </div>
                          {n.button && (
                            <button
                              className="notif-action-btn"
                              style={{ borderColor: pal.btnBorder, color: pal.btnText }}
                              onClick={() => handleAction(n)}
                              onMouseOver={(e) => { e.currentTarget.style.background = pal.btnBorder; e.currentTarget.style.color = "#fff"; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = pal.btnText; }}
                            >
                              {n.button}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {!loading && filtered.length > 0 && (
          <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
            Showing 1 to {filtered.length} of {notifications.length} notifications
          </p>
        )}
      </div>
    </div>
  );
};

export default Notifications;

