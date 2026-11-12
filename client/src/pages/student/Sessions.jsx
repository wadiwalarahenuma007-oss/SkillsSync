import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Student/Sessions.css";

import {
  RiCalendarLine, RiSearchLine, RiTimeLine, RiVideoLine, RiCheckLine,
  RiCloseLine, RiExternalLinkLine, RiFileTextLine, RiTeamLine, RiClockwiseLine,
  RiLoader4Line,
} from "react-icons/ri";

const TABS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

const statusLabel = {
  upcoming:  "Upcoming",
  ongoing:   "Live Now",
  completed: "Completed",
  cancelled: "Cancelled",
};

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const StudentSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch]       = useState("");

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://skillssync-a4r9.onrender.com/api/sessions/mine", { withCredentials: true });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Sessions fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtered ── */
  const filtered = sessions.filter((s) => {
    const matchTab = activeTab === "All" || s.status === activeTab.toLowerCase();
    const mentorName = s.mentor?.name || "";
    const matchSearch = mentorName.toLowerCase().includes(search.toLowerCase()) ||
      s.skill?.toLowerCase().includes(search.toLowerCase()) ||
      s.title?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  /* ── Stats ── */
  const total     = sessions.length;
  const upcoming  = sessions.filter(s => s.status === "upcoming").length;
  const completed = sessions.filter(s => s.status === "completed").length;
  const hours     = sessions.filter(s => s.status === "completed")
    .reduce((sum, s) => sum + (parseInt(s.duration) || 60) / 60, 0)
    .toFixed(1);

  return (
    <div className="sessions-page">

      {/* HERO HEADER */}
      <section className="sessions-hero">
        <div className="sessions-hero-icon"><RiCalendarLine /></div>
        <div className="sessions-hero-content">
          <h1>My <span>Sessions</span></h1>
          <p>View and manage all your learning sessions with mentors.</p>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="sessions-stats-grid">
        <div className="session-stat-card">
          <div className="session-stat-icon purple"><RiCalendarLine /></div>
          <div className="session-stat-info">
            <strong>{loading ? "..." : total}</strong>
            <span>Total Sessions</span>
          </div>
        </div>
        <div className="session-stat-card">
          <div className="session-stat-icon cyan"><RiClockwiseLine /></div>
          <div className="session-stat-info">
            <strong>{loading ? "..." : upcoming}</strong>
            <span>Upcoming</span>
          </div>
        </div>
        <div className="session-stat-card">
          <div className="session-stat-icon green"><RiCheckLine /></div>
          <div className="session-stat-info">
            <strong>{loading ? "..." : completed}</strong>
            <span>Completed</span>
          </div>
        </div>
        <div className="session-stat-card">
          <div className="session-stat-icon gold"><RiTimeLine /></div>
          <div className="session-stat-info">
            <strong>{loading ? "..." : `${hours}h`}</strong>
            <span>Hours Learned</span>
          </div>
        </div>
      </div>

      {/* SESSIONS LIST CARD */}
      <div className="sessions-card">
        {/* Toolbar */}
        <div className="sessions-toolbar">
          <h2 className="sessions-card-title">
            <RiCalendarLine />
            {activeTab === "All" ? "All Sessions" : `${activeTab} Sessions`}
          </h2>
          <div className="sessions-toolbar-right">
            <div className="sessions-search-box">
              <RiSearchLine />
              <input type="text" placeholder="Search mentor or topic..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="sessions-filter-tabs">
              {TABS.map((tab) => (
                <button key={tab} type="button"
                  className={`sessions-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => setActiveTab(tab)}>{tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session list */}
        <div className="sessions-list">
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <RiLoader4Line style={{ fontSize: "2rem", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: "0.5rem" }}>Loading sessions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="sessions-empty">
              <div className="sessions-empty-icon"><RiCalendarLine /></div>
              <h3>No sessions found</h3>
              <p>
                {search ? "Try adjusting your search." :
                  activeTab === "Upcoming" ? "You have no upcoming sessions. Find a mentor to book one!" :
                  "No sessions in this category yet."}
              </p>
              {activeTab === "Upcoming" && (
                <Link to="/find-mentors" style={{
                  display: "inline-block", marginTop: "1rem", padding: "8px 20px",
                  borderRadius: "9px", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                  color: "#fff", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
                }}>
                  <RiTeamLine style={{ marginRight: 6 }} /> Find Mentors
                </Link>
              )}
            </div>
          ) : (
            filtered.map((session) => {
              const mentor = session.mentor || {};
              const initials = getInitials(mentor.name || "M");
              const picUrl = mentor.profilePicture
                ? (mentor.profilePicture.startsWith("http") ? mentor.profilePicture : `https://skillssync-a4r9.onrender.com/${mentor.profilePicture.replace(/^\//, "")}`)
                : null;

              return (
                <div key={session._id}
                  className={`session-item${session.status === "cancelled" ? " is-cancelled" : ""}`}>

                  {/* Avatar */}
                  <div className="session-mentor-avatar">
                    {picUrl ? <img src={picUrl} alt={mentor.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
                  </div>

                  {/* Info */}
                  <div className="session-info">
                    <div className="session-info-top">
                      <span className="session-mentor-name">{mentor.name || "Mentor"}</span>
                      <span className="session-topic-tag">{session.skill || session.title}</span>
                      <span className={`session-status-badge ${session.status}`}>
                        {statusLabel[session.status] || session.status}
                      </span>
                    </div>
                    <div className="session-info-bottom">
                      <span className="session-meta-item">
                        <RiCalendarLine /> {session.scheduledDate || fmtDate(session.createdAt)}
                      </span>
                      {session.startTime && (
                        <span className="session-meta-item"><RiTimeLine /> {session.startTime}</span>
                      )}
                      <span className="session-meta-item"><RiClockwiseLine /> {session.duration || "60 min"}</span>
                      <span className="session-meta-item"><RiVideoLine /> Online</span>
                    </div>
                    {session.title && (
                      <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px" }}>
                        {session.title}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="session-actions">
                    {(session.status === "upcoming" || session.status === "ongoing") && session.meetingLink ? (
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="session-join-btn">
                        <RiVideoLine style={{ marginRight: 4 }} />
                        {session.status === "ongoing" ? "Join Live" : "Join Now"}
                      </a>
                    ) : (session.status === "upcoming" || session.status === "ongoing") ? (
                      <button className="session-join-btn" disabled style={{ opacity: 0.6 }}>
                        <RiVideoLine style={{ marginRight: 4 }} /> Awaiting Link
                      </button>
                    ) : session.status === "completed" ? (
                      <button className="session-view-btn">
                        <RiFileTextLine style={{ marginRight: 4 }} /> View Notes
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#f87171" }}>
                        <RiCloseLine /> Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* BOTTOM TIP */}
      <div className="sessions-info-box">
        <div className="sessions-info-icon">💡</div>
        <div>
          <strong>Earn Skill Coins from sessions!</strong>
          Every completed session earns you +30 Skill Coins. Find a mentor and start learning today.{" "}
          <Link to="/find-mentors" style={{ color: "#06b6d4", fontWeight: 600 }}>Browse Mentors →</Link>
        </div>
      </div>

    </div>
  );
};

export default StudentSessions;

