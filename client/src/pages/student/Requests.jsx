import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    RiTimeLine,
    RiCheckLine,
    RiCloseLine,
    RiSendPlaneLine,
    RiInboxLine,
    RiSearchLine,
    RiLoader4Line,
    RiRefreshLine,
} from "react-icons/ri";

import "../../styles/Student/Requests.css";

/* ── Status badge styles ── */
const statusClass = (status) => {
    if (status === "accepted")  return "request-status accepted";
    if (status === "rejected")  return "request-status rejected";
    if (status === "completed") return "request-status completed";
    return "request-status pending";
};

const statusLabel = (status) => {
    const map = { pending: "Pending", accepted: "Accepted", rejected: "Rejected", completed: "Completed" };
    return map[status] || status;
};

const Requests = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");

    /* ── Fetch student's own requests ── */
    const fetchRequests = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("https://skillssync-a4r9.onrender.com/api/requests/mine", {
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

    /* ── Stats computed from real data ── */
    const pendingCount   = requests.filter((r) => r.status === "pending").length;
    const acceptedCount  = requests.filter((r) => r.status === "accepted").length;
    const rejectedCount  = requests.filter((r) => r.status === "rejected").length;

    /* ── Avatar helper ── */
    const avatarSrc = (pic) => {
        if (!pic) return null;
        return pic.startsWith("http") ? pic : `https://skillssync-a4r9.onrender.com${pic}`;
    };

    return (
        <div className="requests-page">

            {/* HEADER */}
            <section className="requests-hero">
                <div className="requests-hero-content">
                    <h1>My <span>Requests</span></h1>
                    <p>Track your mentorship requests and their current status.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    title="Refresh"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#a78bfa", display: "flex", alignItems: "center", gap: ".4rem" }}
                >
                    <RiRefreshLine size={20} />
                </button>
            </section>

            {/* STATS */}
            <section className="requests-stats">
                <div className="request-stat-card pending">
                    <div className="request-stat-title">
                        <RiTimeLine />
                        <span>Pending</span>
                    </div>
                    <strong>{pendingCount}</strong>
                </div>

                <div className="request-stat-card accepted">
                    <div className="request-stat-title">
                        <RiCheckLine />
                        <span>Accepted</span>
                    </div>
                    <strong>{acceptedCount}</strong>
                </div>

                <div className="request-stat-card rejected">
                    <div className="request-stat-title">
                        <RiCloseLine />
                        <span>Rejected</span>
                    </div>
                    <strong>{rejectedCount}</strong>
                </div>
            </section>

            {/* CONTENT */}
            <section className="requests-content">
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 240, gap: "1rem", color: "#94a3b8" }}>
                        <RiLoader4Line size={36} style={{ animation: "spin 1s linear infinite" }} />
                        <p>Loading requests...</p>
                    </div>
                ) : error ? (
                    <div className="requests-empty">
                        <div className="requests-empty-icon"><RiInboxLine /></div>
                        <h2>Could not load requests</h2>
                        <p>{error}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="requests-empty">
                        <div className="requests-empty-icon"><RiSendPlaneLine /></div>
                        <h2>No requests yet</h2>
                        <p>Start learning by sending a request to a mentor!</p>
                        <button
                            type="button"
                            className="requests-primary-btn"
                            onClick={() => navigate("/find-mentors")}
                        >
                            <RiSearchLine />
                            Find Mentors
                        </button>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => {
                            const mentor = request.mentor;
                            const src    = mentor?.profilePicture ? avatarSrc(mentor.profilePicture) : null;
                            const initial = mentor?.name?.charAt(0)?.toUpperCase() || "M";
                            const date = new Date(request.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                            });

                            return (
                                <div className="request-card" key={request._id}>

                                    {/* Mentor info */}
                                    <div className="request-user">
                                        <div className="request-avatar" style={{ overflow: "hidden" }}>
                                            {src
                                                ? <img src={src} alt={mentor?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                : initial
                                            }
                                        </div>
                                        <div>
                                            <h3>{mentor?.name || "Mentor"}</h3>
                                            <p style={{ fontSize: ".8rem", color: "#94a3b8" }}>
                                                {request.skill || (mentor?.skills_offered?.[0]) || "Mentorship"}
                                            </p>
                                            <p style={{ fontSize: ".75rem", color: "#64748b" }}>{date}</p>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    {request.message && (
                                        <div className="request-message">
                                            "{request.message}"
                                        </div>
                                    )}

                                    {/* Status */}
                                    <div className="request-actions">
                                        <span className={statusClass(request.status)}>
                                            {statusLabel(request.status)}
                                        </span>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Requests;
