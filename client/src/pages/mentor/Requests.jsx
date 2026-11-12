import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Mentor/Requests.css";

import {
    RiExchangeLine,
    RiSearchLine,
    RiCheckLine,
    RiCloseLine,
    RiTimeLine,
    RiUserLine,
    RiLoader4Line,
    RiRefreshLine,
} from "react-icons/ri";

const TABS = ["All", "Pending", "Accepted", "Rejected"];

const MentorRequests = () => {
    const [requests,  setRequests]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState("");
    const [search,    setSearch]    = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [acting,    setActing]    = useState(null); // id of request being accepted/rejected

    /* ── Fetch incoming requests ── */
    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("https://skillssync-a4r9.onrender.com/api/mentor/requests/list", {
                withCredentials: true,
            });
            setRequests(res.data.requests || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    /* ── Accept / Reject ── */
    const handleAction = async (id, action) => {
        setActing(id);
        try {
            await axios.put(
                `https://skillssync-a4r9.onrender.com/api/mentor/requests/${id}/${action}`,
                {},
                { withCredentials: true }
            );
            // Optimistically update status in UI
            setRequests((prev) =>
                prev.map((r) => r._id === id ? { ...r, status: action === "accept" ? "accepted" : "rejected" } : r)
            );
        } catch (err) {
            console.error("Action failed:", err.response?.data?.message);
        } finally {
            setActing(null);
        }
    };

    /* ── Filter ── */
    const counts = {
        All:      requests.length,
        Pending:  requests.filter((r) => r.status === "pending").length,
        Accepted: requests.filter((r) => r.status === "accepted").length,
        Rejected: requests.filter((r) => r.status === "rejected").length,
    };

    const filtered = requests.filter((r) => {
        const matchTab    = activeTab === "All" || r.status === activeTab.toLowerCase();
        const studentName = r.student?.name || "";
        const matchSearch =
            studentName.toLowerCase().includes(search.toLowerCase()) ||
            (r.skill || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.message || "").toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const cardClass = (status) => {
        if (status === "accepted") return "request-item-card card-accepted";
        if (status === "rejected") return "request-item-card card-rejected";
        return "request-item-card";
    };

    /* ── Avatar helper ── */
    const avatarSrc = (pic) => {
        if (!pic) return null;
        return pic.startsWith("http") ? pic : `https://skillssync-a4r9.onrender.com${pic}`;
    };

    return (
        <div className="mentor-requests-page">

            {/* HEADER */}
            <div className="requests-topbar">
                <div>
                    <div className="requests-title-group">
                        <h1>
                            <RiExchangeLine />
                            Student <span>Requests</span>
                        </h1>
                        {counts.Pending > 0 && (
                            <span className="pending-count-badge">{counts.Pending} Pending</span>
                        )}
                    </div>
                    <p>Manage incoming mentoring requests from students</p>
                </div>
                <button
                    onClick={fetchRequests}
                    title="Refresh"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#a78bfa", display: "flex", alignItems: "center", gap: ".4rem", marginLeft: "auto" }}
                >
                    <RiRefreshLine size={20} />
                    Refresh
                </button>
            </div>

            {/* STATS */}
            <div className="requests-stats">
                <div className="req-stat-card all">
                    <h2>{counts.All}</h2>
                    <p>Total Requests</p>
                </div>
                <div className="req-stat-card pending-s">
                    <h2>{counts.Pending}</h2>
                    <p>Pending</p>
                </div>
                <div className="req-stat-card accepted">
                    <h2>{counts.Accepted}</h2>
                    <p>Accepted</p>
                </div>
                <div className="req-stat-card rejected">
                    <h2>{counts.Rejected}</h2>
                    <p>Rejected</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="requests-filters-bar">
                <div className="requests-search-box">
                    <RiSearchLine />
                    <input
                        type="text"
                        placeholder="Search requests by name, skill..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="requests-filter-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`filter-tab${activeTab === tab ? " active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab} ({counts[tab]})
                        </button>
                    ))}
                </div>
            </div>

            {/* LIST */}
            <div className="requests-list-card">
                <div className="requests-list-header">
                    <div className="requests-list-title">
                        <RiUserLine />
                        {activeTab === "All" ? "All Requests" : `${activeTab} Requests`}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{filtered.length} results</span>
                </div>

                <div className="requests-list">
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: "1rem", color: "#94a3b8" }}>
                            <RiLoader4Line size={36} style={{ animation: "spin 1s linear infinite" }} />
                            <p>Loading requests...</p>
                        </div>
                    ) : error ? (
                        <div className="requests-empty">
                            <div className="requests-empty-icon"><RiExchangeLine /></div>
                            <h3>Could not load requests</h3>
                            <p>{error}</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="requests-empty">
                            <div className="requests-empty-icon"><RiExchangeLine /></div>
                            <h3>No requests found</h3>
                            <p>{search ? "Try adjusting your search." : "No requests in this category yet."}</p>
                        </div>
                    ) : (
                        filtered.map((req) => {
                            const student = req.student;
                            const src     = student?.profilePicture ? avatarSrc(student.profilePicture) : null;
                            const initials = (student?.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                            const date = new Date(req.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                            });

                            return (
                                <div key={req._id} className={cardClass(req.status)}>

                                    {/* Avatar */}
                                    <div className="req-avatar" style={{ overflow: "hidden" }}>
                                        {src
                                            ? <img src={src} alt={student?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : initials
                                        }
                                    </div>

                                    {/* Info */}
                                    <div className="req-info">
                                        <h4>{student?.name || "Student"}</h4>
                                        <p style={{ fontSize: ".78rem", color: "#94a3b8", margin: "2px 0" }}>{student?.email}</p>
                                        {req.skill && (
                                            <span className="req-skill-tag">{req.skill}</span>
                                        )}
                                        {req.message && (
                                            <p className="req-message">"{req.message}"</p>
                                        )}
                                    </div>

                                    {/* Meta + Actions */}
                                    <div className="req-meta">
                                        <span className="req-date">{date}</span>

                                        {req.status !== "pending" && (
                                            <span className={`req-status-badge ${req.status}`}>
                                                {req.status === "accepted" ? "Accepted" : "Rejected"}
                                            </span>
                                        )}

                                        {req.status === "pending" && (
                                            <div className="req-actions">
                                                <button
                                                    className="req-accept-btn"
                                                    type="button"
                                                    disabled={acting === req._id}
                                                    onClick={() => handleAction(req._id, "accept")}
                                                >
                                                    {acting === req._id ? "..." : "✓ Accept"}
                                                </button>
                                                <button
                                                    className="req-reject-btn"
                                                    type="button"
                                                    disabled={acting === req._id}
                                                    onClick={() => handleAction(req._id, "reject")}
                                                >
                                                    {acting === req._id ? "..." : "✕ Reject"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorRequests;

