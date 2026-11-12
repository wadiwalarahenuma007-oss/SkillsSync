import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    RiExchangeLine,
    RiSearchLine,
    RiDeleteBinLine,
    RiLoader4Line,
} from "react-icons/ri";

import "../../styles/Admin/AdminSkillReq.css";

const AdminSkillRequests = () => {
    const [requests,     setRequests]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [search,       setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                "https://skillssync-a4r9.onrender.com/api/admin/requests",
                { withCredentials: true }
            );
            setRequests(data.requests || []);
        } catch (error) {
            console.error("Failed to load requests:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeRequest = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await axios.delete(`https://skillssync-a4r9.onrender.com/api/admin/requests/${id}`, {
                withCredentials: true,
            });
            setRequests((prev) => prev.filter((r) => r._id !== id));
        } catch (error) {
            console.error("Delete failed:", error.message);
        }
    };

    const filteredRequests = requests.filter((request) => {
        const searchText = search.toLowerCase();
        const matchesSearch =
            (request.student?.name || "").toLowerCase().includes(searchText) ||
            (request.mentor?.name  || "").toLowerCase().includes(searchText) ||
            (request.skill         || "").toLowerCase().includes(searchText);
        const matchesStatus =
            statusFilter === "all" || request.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const fmtDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    return (
        <div className="admin-requests-page">

            {/* Header */}
            <div className="requests-page-header">
                <div>
                    <h1><RiExchangeLine /> Skill Request Monitoring</h1>
                    <p>Monitor skill exchange requests across the platform.</p>
                </div>
                <div className="request-total">
                    {loading ? "..." : `${requests.length} Total Requests`}
                </div>
            </div>

            {/* Filters */}
            <div className="requests-toolbar">
                <div className="request-search">
                    <RiSearchLine />
                    <input
                        type="text"
                        placeholder="Search sender, receiver or skill..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="request-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Table */}
            <div className="requests-table-card">
                <div className="requests-table-wrapper">
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>FROM</th>
                                <th>TO</th>
                                <th>SKILL</th>
                                <th>DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="no-requests">
                                        <RiLoader4Line style={{ animation: "spin 1s linear infinite", fontSize: "1.5rem" }} />
                                        <strong>Loading requests...</strong>
                                    </td>
                                </tr>
                            ) : filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <tr key={request._id}>

                                        {/* Sender */}
                                        <td>
                                            <div className="request-user">
                                                <div className="request-avatar">
                                                    {request.student?.name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <strong>{request.student?.name || "Unknown"}</strong>
                                                    <span>{request.student?.email || ""}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Receiver */}
                                        <td>
                                            <div className="request-user">
                                                <div className="request-avatar receiver">
                                                    {request.mentor?.name?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <strong>{request.mentor?.name || "Unknown"}</strong>
                                                    <span>{request.mentor?.email || ""}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Skill */}
                                        <td>
                                            <span className="request-skill">
                                                {request.skill || "—"}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td>
                                            <span className="request-date">
                                                {fmtDate(request.createdAt)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span className={`request-status ${request.status}`}>
                                                {request.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td>
                                            <div className="request-actions">
                                                <button
                                                    type="button"
                                                    className="remove-request-btn"
                                                    onClick={() => removeRequest(request._id)}
                                                    title="Delete request"
                                                >
                                                    <RiDeleteBinLine />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="no-requests">
                                        <RiSearchLine />
                                        <strong>No requests found</strong>
                                        <span>Try changing your search or filter.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSkillRequests;
