import React, { useState, useEffect } from "react";
import axios from "axios"
import {
    RiVipCrownLine,
    RiUserLine,
    RiGroupLine,
    RiEditLine,
    RiToggleLine,
    RiCheckLine,
} from "react-icons/ri";

import "../../styles/Admin/AdminMembership.css";

const initialPlans = [
    {
        id: 1,
        name: "Free",
        price: 0,
        period: "month",
        description: "Basic access for students getting started.",
        features: [
            "Browse skills",
            "Send skill requests",
            "Basic skill tests",
            "Basic profile",
        ],
        members: 82,
        active: true,
    },
    {
        id: 2,
        name: "Premium",
        price: 199,
        period: "month",
        description: "Unlock more features and benefits.",
        features: [
            "Everything in Free",
            "More skill coins",
            "Premium tests",
            "Priority profile visibility",
            "Premium badge",
        ],
        members: 38,
        active: true,
    },
];

const AdminMembership = () => {
    const [plans, setPlans] = useState(initialPlans)
    const [stats, setStats] = useState({
        totalMembers: 0,
        premiumMembers: 0,
        freeMembers: 0,
    });

    const fetchMembershipStats = async () => {
        try {
            const res = await axios.get(
                "https://skillssync-a4r9.onrender.com/api/admin/membership"
            );

            setStats(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchMembershipStats();
    }, []);

    // const togglePlan = (id) => {
    //     setPlans((prev) =>
    //         prev.map((plan) =>
    //             plan.id === id
    //                 ? { ...plan, active: !plan.active }
    //                 : plan
    //         )
    //     );
    // };


    const handleAddPlan = () => {
        alert("Add Membership Plan feature will be connected later.");
    };


    return (
        <div className="admin-membership-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="membership-page-header">

                <div>

                    <h1>
                        <RiVipCrownLine />
                        Membership Management
                    </h1>

                    <p>
                        Manage membership plans and subscriptions.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-plan-btn"
                    onClick={handleAddPlan}
                >
                    <span>+</span>
                    Add Plan
                </button>

            </div>


            {/* =================================================
                OVERVIEW
            ================================================= */}

            <div className="membership-overview">

                <div className="membership-stat-card">

                    <div className="membership-stat-icon total">
                        <RiGroupLine />
                    </div>

                    <div>
                        <span>Total Members</span>
                        <strong>{stats.totalMembers}</strong>
                    </div>

                </div>


                <div className="membership-stat-card">

                    <div className="membership-stat-icon premium">
                        <RiVipCrownLine />
                    </div>

                    <div>
                        <span>Premium Members</span>
                        <strong>{stats.premiumMembers}</strong>
                    </div>

                </div>


                <div className="membership-stat-card">

                    <div className="membership-stat-icon free">
                        <RiUserLine />
                    </div>

                    <div>
                        <span>Free Members</span>
                        <strong>{stats.freeMembers}</strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                PLANS
            ================================================= */}

            <div className="membership-section-header">

                <div>
                    <h2>Membership Plans</h2>

                    <p>
                        Configure the available plans for students.
                    </p>
                </div>

            </div>


            <div className="membership-plans-grid">

                {plans.map((plan) => (

                    <div
                        className={`membership-plan-card ${plan.name === "Premium"
                            ? "premium-plan"
                            : ""
                            } ${!plan.active
                                ? "plan-disabled"
                                : ""
                            }`}
                        key={plan.id}
                    >

                        {/* Plan Header */}
                        <div className="plan-top">

                            <div className="plan-icon">

                                {plan.name === "Premium" ? (
                                    <RiVipCrownLine />
                                ) : (
                                    <RiUserLine />
                                )}

                            </div>


                            {plan.name === "Premium" && (
                                <span className="popular-badge">
                                    Popular
                                </span>
                            )}

                        </div>


                        <h3>{plan.name}</h3>

                        <p className="plan-description">
                            {plan.description}
                        </p>


                        {/* Price */}
                        <div className="plan-price">

                            <strong>
                                ₹{plan.price}
                            </strong>

                            <span>
                                / {plan.period}
                            </span>

                        </div>


                        {/* Features */}
                        <div className="plan-features">

                            {plan.features.map((feature) => (

                                <div
                                    className="plan-feature"
                                    key={feature}
                                >
                                    <RiCheckLine />

                                    <span>
                                        {feature}
                                    </span>
                                </div>

                            ))}

                        </div>


                        {/* Plan Footer */}
                        <div className="plan-footer">

                            <div className="plan-members">

                                <RiGroupLine />

                                <span>
                                    {plan.name === "Premium"
                                        ? stats.premiumMembers
                                        : stats.freeMembers} members
                                </span>

                            </div>


                            <span
                                className={
                                    plan.active
                                        ? "plan-status active"
                                        : "plan-status inactive"
                                }
                            >
                                {plan.active
                                    ? "Active"
                                    : "Inactive"}
                            </span>

                        </div>


                        {/* Actions */}
                        <div className="plan-actions">

                            <button
                                type="button"
                                className="edit-plan-btn"
                                onClick={() =>
                                    handleEdit(plan)
                                }
                            >
                                <RiEditLine />
                                Edit
                            </button>


                            <button
                                type="button"
                                className={
                                    plan.active
                                        ? "disable-plan-btn"
                                        : "enable-plan-btn"
                                }
                                onClick={() =>
                                    togglePlan(plan.id)
                                }
                            >
                                <RiToggleLine />

                                {plan.active
                                    ? "Disable"
                                    : "Enable"}
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
};

export default AdminMembership;
