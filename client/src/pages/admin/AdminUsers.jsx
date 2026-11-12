import React, { useState, useEffect } from "react";
import {
    RiTeamLine,
    RiSearchLine,
    RiDeleteBinLine,
} from "react-icons/ri";

import "../../styles/Admin/AdminUsers.css";
import axios from "axios";
// const demoUsers = [
//     {
//         id: 1,
//         name: "rajesh",
//         email: "rajesh12@gmail.com",
//         role: "student",
//         membership: "free",
//         coins: 200,
//         active: true,
//         joined: "8/7/2026",
//     },
//     {
//         id: 2,
//         name: "Vansh",
//         email: "vansh@gmail.com",
//         role: "student",
//         membership: "free",
//         coins: 100,
//         active: true,
//         joined: "8/4/2026",
//     },
//     {
//         id: 3,
//         name: "Arjun Sharma",
//         email: "mentor@demo.com",
//         role: "mentor",
//         membership: "premium",
//         coins: 1250,
//         active: true,
//         joined: "7/22/2026",
//     },
//     {
//         id: 4,
//         name: "Priya Patel",
//         email: "mentor2@demo.com",
//         role: "mentor",
//         membership: "free",
//         coins: 980,
//         active: true,
//         joined: "7/22/2026",
//     },
//     {
//         id: 5,
//         name: "Rohit Kumar",
//         email: "mentor3@demo.com",
//         role: "mentor",
//         membership: "free",
//         coins: 450,
//         active: true,
//         joined: "7/22/2026",
//     },
//     {
//         id: 6,
//         name: "Demo Student",
//         email: "student@demo.com",
//         role: "student",
//         membership: "premium",
//         coins: 250,
//         active: false,
//         joined: "7/20/2026",
//     },
// ];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // fetch user
    const fetchUsers = async () => {
        try {
            const response = await axios.get(
                "https://skillssync-a4r9.onrender.com/api/admin/users"
            );

            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);
    // delete
    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(
                `https://skillssync-a4r9.onrender.com/api/admin/users/${id}`
            );

            fetchUsers();
        } catch (error) {
            console.log(error);
        }
    };
    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            user.name?.toLowerCase().includes(searchText) ||
            user.email?.toLowerCase().includes(searchText);

        const matchesRole =
            roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const toggleStatus = (id) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === id
                    ? { ...user, active: !user.active }
                    : user
            )
        );
    };

    // const deleteUser = (id) => {
    //     const confirmDelete = window.confirm(
    //         "Are you sure you want to delete this user?"
    //     );

    //     if (!confirmDelete) return;

    //     setUsers((prevUsers) =>
    //         prevUsers.filter((user) => user.id !== id)
    //     );
    // };

    return (
        <div className="admin-users-page">

            {/* Header */}
            <div className="admin-users-header">

                <div>
                    <h1>
                        <RiTeamLine />
                        User Management
                    </h1>

                    <p>
                        {users.length} total users
                    </p>
                </div>

            </div>


            {/* Search + Filter */}
            <div className="users-toolbar">

                <div className="users-search">
                    <RiSearchLine />

                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="users-role-filter"
                >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="mentor">Mentors</option>
                </select>

            </div>


            {/* Users Table */}
            <div className="users-table-card">

                <div className="users-table-wrapper">

                    <table className="users-table">

                        <thead>
                            <tr>
                                <th>USER</th>
                                <th>ROLE</th>
                                <th>MEMBERSHIP</th>
                                {/* <th>COINS</th> */}
                                {/* <th>STATUS</th> */}
                                <th>JOINED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredUsers.map((user) => (

                                <tr key={user.id}>

                                    {/* User */}
                                    <td>

                                        <div className="user-info">

                                            <div className="user-avatar">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>
                                                    {user.name}
                                                </strong>

                                                <span>
                                                    {user.email}
                                                </span>
                                            </div>

                                        </div>

                                    </td>


                                    {/* Role */}
                                    <td>
                                        <span
                                            className={`user-role ${user.role}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>


                                    {/* Membership */}
                                    <td>
                                        <span
                                            className={`user-membership ${user.membership}`}
                                        >
                                            {user.membership}
                                        </span>
                                    </td>


                                    {/* Coins */}
                                    {/* <td>
                                        <span className="user-coins">
                                            🪙 {user.coins}
                                        </span>
                                    </td> */}


                                    {/* Status */}
                                    {/* <td>

                                        <button
                                            type="button"
                                            className={`status-toggle ${user.active
                                                ? "active"
                                                : "inactive"
                                                }`}
                                            onClick={() =>
                                                toggleStatus(user.id)
                                            }
                                            aria-label="Toggle user status"
                                        >
                                            <span />
                                        </button>

                                    </td> */}


                                    {/* Joined */}
                                    <td>
                                        <span className="joined-date">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : "-"}
                                        </span>
                                    </td>


                                    {/* Delete */}
                                    <td>

                                        <button
                                            type="button"
                                            className="delete-user-btn"
                                            onClick={() => handleDelete(user._id)}
                                            title="Delete user"
                                        >
                                            <RiDeleteBinLine />
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>


                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <div className="users-empty">
                            <RiSearchLine />

                            <h3>No users found</h3>

                            <p>
                                Try changing your search or role filter.
                            </p>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default AdminUsers;
