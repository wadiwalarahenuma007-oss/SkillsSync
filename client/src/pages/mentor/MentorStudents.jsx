import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Mentor/MentorStudents.css";
import {
  RiTeamFill,
  RiSearchLine,
  RiAddLine,
  RiLoader4Line,
  RiRefreshLine,
  RiMailLine,
  RiTimeLine,
} from "react-icons/ri";

export default function MyStudents() {
  const [students,  setStudents]  = useState([]);
  const [stats,     setStats]     = useState({ total: 0, uniqueSkills: 0, newThisWeek: 0 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");

  /* ── Fetch accepted students ── */
  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("https://skillssync-a4r9.onrender.com/api/mentor/students", {
        withCredentials: true,
      });
      setStudents(res.data.students  || []);
      setStats(res.data.stats || { total: 0, uniqueSkills: 0, newThisWeek: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  /* ── Search filter ── */
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.student?.name  || "").toLowerCase().includes(q) ||
      (s.student?.email || "").toLowerCase().includes(q) ||
      (s.skill          || "").toLowerCase().includes(q)
    );
  });

  /* ── Avatar helper ── */
  const avatarSrc = (pic) => {
    if (!pic) return null;
    return pic.startsWith("http") ? pic : `https://skillssync-a4r9.onrender.com${pic}`;
  };

  /* ── Date formatter ── */
  const fmtDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  return (
    <div className="my-students-page">

      {/* Header */}
      <div className="students-header">
        <div>
          <h1>
            <RiTeamFill />
            My Students
          </h1>
          <p>{stats.total} accepted student{stats.total !== 1 ? "s" : ""}</p>
        </div>

        <div style={{ display: "flex", gap: ".75rem" }}>
          <button
            className="create-session-btn"
            onClick={fetchStudents}
            title="Refresh"
            style={{ gap: ".4rem" }}
          >
            <RiRefreshLine />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="students-search">
        <RiSearchLine />
        <input
          type="text"
          placeholder="Search students or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats — from real database */}
      <div className="students-stats">
        <div className="student-stat-card purple">
          <h2>{stats.total}</h2>
          <p>Total Students</p>
        </div>

        <div className="student-stat-card cyan">
          <h2>{stats.uniqueSkills}</h2>
          <p>Unique Skills</p>
        </div>

        <div className="student-stat-card green">
          <h2>{stats.newThisWeek}</h2>
          <p>New This Week</p>
        </div>
      </div>

      {/* Students Grid */}
      <div className="students-list-section">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: "1rem", color: "#94a3b8" }}>
            <RiLoader4Line size={36} style={{ animation: "spin 1s linear infinite" }} />
            <p>Loading students...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#f87171" }}>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            <RiTeamFill size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <h3 style={{ margin: "0 0 .5rem" }}>
              {search ? "No students match your search" : "No accepted students yet"}
            </h3>
            <p style={{ margin: 0, fontSize: ".875rem" }}>
              {search
                ? "Try a different search term."
                : "When you accept a mentorship request, students will appear here."}
            </p>
          </div>
        ) : (
          <div className="students-grid">
            {filtered.map((item) => {
              const student = item.student;
              const src     = student?.profilePicture ? avatarSrc(student.profilePicture) : null;
              const initial = student?.name?.charAt(0)?.toUpperCase() || "S";

              return (
                <div key={item._id} className="student-card">

                  <div className="student-top">
                    <div className="student-avatar" style={{ overflow: "hidden" }}>
                      {src
                        ? <img src={src} alt={student?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : initial
                      }
                    </div>

                    <div>
                      <h3>{student?.name || "Student"}</h3>
                      <span style={{ fontSize: ".8rem", color: "#a78bfa" }}>
                        {item.skill || "Mentorship"}
                      </span>
                    </div>
                  </div>

                  <div className="student-info">
                    <div>
                      <RiMailLine />
                      <span style={{ fontSize: ".78rem", wordBreak: "break-all" }}>
                        {student?.email || "—"}
                      </span>
                    </div>

                    <div>
                      <RiTimeLine />
                      <span style={{ fontSize: ".78rem" }}>
                        {item.acceptedAt ? fmtDate(item.acceptedAt) : "—"}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
