import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Mentor/MentorSessions.css";
import {
  RiCalendarLine, RiAddLine, RiSearchLine, RiLoader4Line,
  RiTimeLine, RiVideoLine, RiCheckLine, RiCloseLine, RiLinksLine,
} from "react-icons/ri";

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_OPTS = ["All Status", "upcoming", "ongoing", "completed", "cancelled"];

export default function MentorSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showCreate, setShowCreate] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(null); // sessionId
  const [linkInput, setLinkInput] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── Create form state ── */
  const [form, setForm] = useState({
    studentId: "", skill: "", title: "", description: "",
    scheduledDate: "", startTime: "", duration: "60 min", meetingLink: "",
  });
  const [myStudents, setMyStudents] = useState([]);

  useEffect(() => { fetchSessions(); fetchStudents(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://skillssync-a4r9.onrender.com/api/sessions/mentor", { withCredentials: true });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Mentor sessions fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // const fetchStudents = async () => {
  //   try {
  //     const res = await axios.get("https://skillssync-a4r9.onrender.com/api/mentor/students", { withCredentials: true });
  //     setMyStudents(res.data.students || []);
  //   } catch (err) {
  //     // not critical
  //   }
  // };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("https://skillssync-a4r9.onrender.com/api/mentor/students", {
        withCredentials: true
      });

      const rows = res.data.students || [];

      const uniqueStudents = Array.from(
        new Map(
          rows
            .filter(item => item.student?._id)
            .map(item => [String(item.student._id), item.student])
        ).values()
      );

      setMyStudents(uniqueStudents);

    } catch (err) {
      console.error("Fetch Students Error:", err.response?.data || err.message);
      setMyStudents([]);
    }
  };

  const createSession = async () => {
    if (!form.title || !form.studentId) return alert("Title and student are required.");
    setSaving(true);
    try {
      await axios.post("https://skillssync-a4r9.onrender.com/api/sessions", form, { withCredentials: true });
      setShowCreate(false);
      setForm({ studentId: "", skill: "", title: "", description: "", scheduledDate: "", startTime: "", duration: "60 min", meetingLink: "" });
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create session.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`https://skillssync-a4r9.onrender.com/api/sessions/${id}/status`, { status }, { withCredentials: true });
      setSessions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const saveMeetingLink = async () => {
    if (!linkInput.trim()) return;
    setSaving(true);
    try {
      await axios.put(`https://skillssync-a4r9.onrender.com/api/sessions/${showLinkModal}/meeting-link`, { meetingLink: linkInput.trim() }, { withCredentials: true });
      setSessions(prev => prev.map(s => s._id === showLinkModal ? { ...s, meetingLink: linkInput.trim() } : s));
      setShowLinkModal(null);
      setLinkInput("");
    } catch (err) {
      alert("Failed to save meeting link.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Filtered ── */
  const filtered = sessions.filter(s => {
    const matchStatus = statusFilter === "All Status" || s.status === statusFilter;
    const student = s.student || {};
    const matchSearch = (student.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.skill || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.title || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    upcoming: sessions.filter(s => s.status === "upcoming").length,
    completed: sessions.filter(s => s.status === "completed").length,
    cancelled: sessions.filter(s => s.status === "cancelled").length,
  };

  return (
    <div className="mentor-sessions-page">

      {/* Header */}
      <div className="sessions-topbar">
        <div>
          <h1><RiCalendarLine /> Session <span>Management</span></h1>
          <p>{loading ? "Loading..." : `${sessions.length} total session${sessions.length !== 1 ? "s" : ""}`}</p>
        </div>
        <button className="create-session-btn" onClick={() => setShowCreate(true)}>
          <RiAddLine /> Create Session
        </button>
      </div>

      {/* Filters */}
      <div className="sessions-filters">
        <div className="search-box">
          <RiSearchLine />
          <input type="text" placeholder="Search sessions..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="sessions-stats">
        <div className="stat-card scheduled">
          <h2>{loading ? "..." : stats.upcoming}</h2>
          <p>Upcoming</p>
        </div>
        <div className="stat-card completed">
          <h2>{loading ? "..." : stats.completed}</h2>
          <p>Completed</p>
        </div>
        <div className="stat-card cancelled">
          <h2>{loading ? "..." : stats.cancelled}</h2>
          <p>Cancelled</p>
        </div>
      </div>

      {/* Session List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <RiLoader4Line style={{ fontSize: "2rem", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "0.5rem" }}>Loading sessions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sessions-empty">
          <div className="empty-icon"><RiCalendarLine /></div>
          <h3>No sessions found</h3>
          <p>{search || statusFilter !== "All Status" ? "Try adjusting your filters." : "Create your first session to get started."}</p>
          <button className="create-session-btn" onClick={() => setShowCreate(true)}>
            <RiAddLine /> Create Session
          </button>
        </div>
      ) : (
        <div className="sessions-list-cards" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {filtered.map(session => {
            const student = session.student || {};
            const initials = getInitials(student.name || "S");
            return (
              <div key={session._id} style={{
                background: "var(--card-bg, rgba(255,255,255,0.04))",
                border: "1px solid rgba(139,92,246,0.15)",
                borderRadius: "14px", padding: "1.2rem 1.5rem",
                display: "flex", alignItems: "center", gap: "1rem",
                flexWrap: "wrap",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0,
                }}>
                  {student.profilePicture
                    ? <img src={student.profilePicture.startsWith("http") ? student.profilePicture : `https://skillssync-a4r9.onrender.com/${student.profilePicture.replace(/^\//, "")}`} alt={student.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    : initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{student.name || "Student"}</span>
                    {session.skill && <span style={{ fontSize: "0.78rem", background: "rgba(139,92,246,0.15)", color: "#a78bfa", padding: "2px 8px", borderRadius: "20px" }}>{session.skill}</span>}
                    <span style={{
                      fontSize: "0.75rem", padding: "2px 8px", borderRadius: "20px", fontWeight: 600,
                      background: session.status === "completed" ? "rgba(34,197,94,0.15)" : session.status === "upcoming" ? "rgba(59,130,246,0.15)" : session.status === "cancelled" ? "rgba(239,68,68,0.15)" : "rgba(250,204,21,0.15)",
                      color: session.status === "completed" ? "#22c55e" : session.status === "upcoming" ? "#3b82f6" : session.status === "cancelled" ? "#ef4444" : "#facc15",
                    }}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "4px" }}>{session.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span><RiCalendarLine style={{ verticalAlign: "middle" }} /> {session.scheduledDate || fmtDate(session.createdAt)}</span>
                    {session.startTime && <span><RiTimeLine style={{ verticalAlign: "middle" }} /> {session.startTime}</span>}
                    <span><RiTimeLine style={{ verticalAlign: "middle" }} /> {session.duration}</span>
                  </div>
                  {session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "#06b6d4", marginTop: "4px", display: "block" }}>
                      <RiVideoLine style={{ verticalAlign: "middle" }} /> {session.meetingLink}
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end" }}>
                  {!session.meetingLink && session.status !== "cancelled" && session.status !== "completed" && (
                    <button onClick={() => { setShowLinkModal(session._id); setLinkInput(""); }}
                      style={{ fontSize: "0.78rem", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(139,92,246,0.3)", background: "transparent", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                      <RiLinksLine /> Add Meet Link
                    </button>
                  )}
                  {session.status === "upcoming" && (
                    <button onClick={() => updateStatus(session._id, "ongoing")}
                      style={{ fontSize: "0.78rem", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(34,197,94,0.3)", background: "transparent", color: "#22c55e", cursor: "pointer" }}>
                      Mark Ongoing
                    </button>
                  )}
                  {session.status === "ongoing" && (
                    <button onClick={() => updateStatus(session._id, "completed")}
                      style={{ fontSize: "0.78rem", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)", color: "#22c55e", cursor: "pointer" }}>
                      <RiCheckLine /> Mark Complete
                    </button>
                  )}
                  {(session.status === "upcoming" || session.status === "ongoing") && (
                    <button onClick={() => updateStatus(session._id, "cancelled")}
                      style={{ fontSize: "0.78rem", padding: "5px 12px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", cursor: "pointer" }}>
                      <RiCloseLine /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE SESSION MODAL ── */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000,
          overflowY: "auto", padding: "1.5rem 1rem",
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            background: "#1e1e2e", borderRadius: "18px", padding: "2rem",
            width: "100%", maxWidth: "500px", boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
            margin: "auto", position: "relative",
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "1.5rem", fontWeight: 700 }}>
              <RiCalendarLine style={{ marginRight: 8 }} /> Create Session
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Student select */}
              <div>
                <label style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Student *</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "inherit", marginTop: "4px" }}>
                  <option value="">Select a student</option>
                  {/* {myStudents.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                  ))} */}
                  {myStudents.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              {[
                { label: "Title *", key: "title", placeholder: "e.g. React Hooks Deep Dive" },
                { label: "Skill / Topic", key: "skill", placeholder: "e.g. React.js" },
                { label: "Description", key: "description", placeholder: "What will be covered?" },
                { label: "Date", key: "scheduledDate", type: "date", placeholder: "" },
                { label: "Start Time", key: "startTime", type: "time", placeholder: "" },
                { label: "Duration (minutes)", key: "duration", type: "number", placeholder: "60" },
                { label: "Meeting Link (optional)", key: "meetingLink", placeholder: "https://meet.google.com/..." },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{label}</label>
                  <input type={type || "text"} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "inherit", marginTop: "4px", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreate(false)}
                style={{ padding: "0.6rem 1.2rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "inherit", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={createSession} disabled={saving}
                style={{ padding: "0.6rem 1.5rem", borderRadius: "10px", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MEETING LINK MODAL ── */}
      {showLinkModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }} onClick={() => setShowLinkModal(null)}>
          <div style={{
            background: "#1e1e2e", borderRadius: "18px", padding: "1.8rem",
            width: "100%", maxWidth: "420px",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}><RiLinksLine /> Add Google Meet Link</h3>
            <input type="text" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              style={{ width: "100%", padding: "0.7rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "inherit", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowLinkModal(null)}
                style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "inherit", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={saveMeetingLink} disabled={saving}
                style={{ padding: "0.5rem 1.2rem", borderRadius: "8px", background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
                {saving ? "Saving..." : "Save Link"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
