const User = require("../models/user");
const MentorApplication = require("../models/MentorApplication");
const Request = require("../models/Request");
const { createNotification } = require("./notificationController");

/* ============================================================
   Existing — apply to become a mentor (do NOT modify)
   ============================================================ */
const applyMentor = async (req, res) => {
  try {
    const {
      skills,
      experience,
      qualification,
      bio,
      teachingMode,
      language,
      portfolio,
      linkedin,
    } = req.body;

    // ── Prevent duplicate applications ──────────────────────────
    const existing = await MentorApplication.findOne({
      user: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.status === "approved"
            ? "You are already an approved mentor."
            : "You already have a pending application.",
      });
    }

    const application = await MentorApplication.create({
      user: req.user._id,
      skills,
      experience,
      qualification,
      bio,
      teachingMode,
      language,
      portfolio,
      linkedin,
    });

    // Update user record — mark as pending + copy skills to skills_offered
    await User.findByIdAndUpdate(req.user._id, {
      mentorApplicationStatus: "pending",
      $addToSet: { skills_offered: { $each: skills || [] } },
    });

    // ── Notify ALL admin users ──────────────────────────────────
    const admins = await User.find({ role: "admin" }).select("_id name");
    console.log(
      `[applyMentor] Found ${admins.length} admin(s) to notify for user ${req.user.name}`,
    );

    const appliedAt = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: "New Mentor Application",
        message: `${req.user.name} has applied to become a mentor (applied: ${appliedAt}). Click to review.`,
        type: "System",
        targetRole: "admin",
        link: "/admin/mentors",
        button: "Review Application",
      });
    }

    if (admins.length === 0) {
      console.warn(
        "[applyMentor] WARNING: No admin users found in DB — mentor application notification NOT sent.",
      );
    }

    res.status(201).json({
      success: true,
      message: "Mentor application submitted",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ── Shared skill normalizer — same logic as skillController.js ── */
const normSkill = (s) => (s || "").toLowerCase().replace(/[\s.\-\/\\]+/g, "");
const skillsMatch = (a, b) => {
  const na = normSkill(a);
  const nb = normSkill(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.startsWith(nb) || nb.startsWith(na)) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
};

/* ============================================================
   GET /api/mentors
   Returns all approved mentors.
   ?skill=React   → filter by skill (same logic as Browse Skills)
   ?search=name   → filter by name
   Excludes the currently logged-in user (if authenticated).
   ============================================================ */
const getApprovedMentors = async (req, res) => {
  try {
    const { skill, search } = req.query;

    // Base filter — only approved mentors
    const baseFilter = {
      isMentor: true,
      mentorApplicationStatus: "approved",
    };

    // Exclude the current user so they don't see themselves as a mentor
    if (req.user?._id) {
      baseFilter._id = { $ne: req.user._id };
    }

    // Name search filter
    if (search && search.trim()) {
      baseFilter.name = { $regex: search.trim(), $options: "i" };
    }

    const allMentors = await User.find(baseFilter).select(
      "name email profilePicture bio skills_offered experienceLevel availability rating totalRatings location isMentor isVerified",
    );

    // Enrich with MentorApplication data (skills fallback, qualification, experience)
    const enriched = await Promise.all(
      allMentors.map(async (mentor) => {
        const app = await MentorApplication.findOne({ user: mentor._id });

        // Merge skills from both sources, deduplicated
        const userSkills = mentor.skills_offered || [];
        let appSkills = [];
        if (app?.skills) {
          appSkills =
            typeof app.skills === "string"
              ? app.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : app.skills || [];
        }

        // Combine: start with user skills, add app skills not already included
        const skillSet = [...userSkills];
        for (const s of appSkills) {
          if (!skillSet.some((existing) => skillsMatch(existing, s))) {
            skillSet.push(s);
          }
        }

        // Profile picture: ensure it has proper server prefix
        let profilePicture = mentor.profilePicture || "";
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

        if (profilePicture) {
          if (profilePicture.startsWith("http://localhost:3000")) {
            profilePicture = profilePicture.replace(
              "http://localhost:3000",
              backendUrl,
            );
          } else if (!profilePicture.startsWith("http")) {
            profilePicture = `${backendUrl}/${profilePicture.replace(/^\//, "")}`;
          }
        }
        return {
          _id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          profilePicture,
          bio: mentor.bio || app?.bio || "",
          skills: skillSet,
          experienceLevel: mentor.experienceLevel,
          experience: app?.experience || "",
          qualification: app?.qualification || "",
          availability: mentor.availability,
          rating: mentor.rating,
          totalRatings: mentor.totalRatings,
          location: mentor.location,
          isVerified: mentor.isVerified,
        };
      }),
    );

    // Skill filter — applied after enrichment (same normSkill logic as Browse Skills)
    let result = enriched;
    if (skill && skill.trim()) {
      result = enriched.filter((m) =>
        (m.skills || []).some((s) => skillsMatch(s, skill.trim())),
      );
    }

    res.status(200).json({
      success: true,
      mentors: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================================================
   GET /api/mentors/:id
   Returns a single mentor's full profile
   ============================================================ */
const getMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findOne({
      _id: req.params.id,
      isMentor: true,
      mentorApplicationStatus: "approved",
    }).select("-password");

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    const app = await MentorApplication.findOne({ user: mentor._id });

    res.status(200).json({
      success: true,
      mentor: {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        profilePicture: mentor.profilePicture,
        bio: mentor.bio || app?.bio || "",
        skills: mentor.skills_offered,
        experienceLevel: mentor.experienceLevel,
        experience: app?.experience || "",
        qualification: app?.qualification || "",
        availability: mentor.availability,
        rating: mentor.rating,
        totalRatings: mentor.totalRatings,
        location: mentor.location,
        isVerified: mentor.isVerified,
        socialLinks: mentor.socialLinks,
        teachingMode: app?.teachingMode || "",
        language: app?.language || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================================================
   GET /api/mentor/requests
   Mentor sees all incoming requests
   ============================================================ */
const getMentorRequests = async (req, res) => {
  try {
    const requests = await Request.find({ mentor: req.user._id })
      .populate("student", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================================================
   PUT /api/mentor/requests/:id/accept
   ============================================================ */
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      mentor: req.user._id,
    }).populate("student", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "accepted";
    await request.save();

    const { ensureConversation } = require("./chatController");
    await ensureConversation(request.student._id, request.mentor, request._id);

    // Notify the STUDENT that their request was accepted
    await createNotification({
      userId: request.student._id,
      title: "Mentorship Request Accepted! 🎉",
      message: `Your mentorship request has been accepted by ${req.user.name}. You can now chat and schedule sessions.`,
      type: "Accepted",
      targetRole: "student",
      link: "/requests",
      button: "View Request",
    });

    res.status(200).json({
      success: true,
      message: "Request accepted",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================================================
   PUT /api/mentor/requests/:id/reject
   ============================================================ */
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      mentor: req.user._id,
    }).populate("student", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "rejected";
    await request.save();

    // Notify the STUDENT that their request was rejected
    await createNotification({
      userId: request.student._id,
      title: "Mentorship Request Update",
      message: `Your mentorship request to ${req.user.name} was not accepted at this time.`,
      type: "System",
      targetRole: "student",
      link: "/requests",
      button: "View Request",
    });

    res.status(200).json({
      success: true,
      message: "Request rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================================================
   GET /api/mentor/students
   Returns all students whose requests were ACCEPTED by this mentor
   ============================================================ */
const getMyStudents = async (req, res) => {
  try {
    const acceptedRequests = await Request.find({
      mentor: req.user._id,
      status: "accepted",
    })
      .populate("student", "name email profilePicture")
      .sort({ updatedAt: -1 });

    // Unique skills from accepted requests
    const uniqueSkills = [
      ...new Set(acceptedRequests.map((r) => r.skill).filter(Boolean)),
    ];

    // New this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = acceptedRequests.filter(
      (r) => new Date(r.updatedAt) >= oneWeekAgo,
    ).length;

    const students = acceptedRequests.map((r) => ({
      _id: r._id,
      requestId: r._id,
      student: r.student,
      skill: r.skill,
      acceptedAt: r.updatedAt,
    }));

    res.status(200).json({
      success: true,
      students,
      stats: {
        total: acceptedRequests.length,
        uniqueSkills: uniqueSkills.length,
        newThisWeek,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  applyMentor,
  getApprovedMentors,
  getMentorProfile,
  getMentorRequests,
  acceptRequest,
  rejectRequest,
  getMyStudents,
};
