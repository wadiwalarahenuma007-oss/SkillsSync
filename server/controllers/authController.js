const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const MentorApplication = require("../models/MentorApplication");

// ── Register ────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      qualification,
      experience,
      skills,
      bio,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "mentor" ? "mentor" : "student",
      mentorApplicationStatus: role === "mentor" ? "pending" : "none",
      isMentor: false,
      canTeach: false,
    });

    if (role === "mentor") {
      await MentorApplication.create({
        user: user._id,
        qualification,
        experience,
        skills,
        bio,
        status: "pending",
      });
      return res.status(201).json({
        success: true,
        mentorPending: true,
        message:
          "Mentor application submitted successfully. Waiting for admin approval.",
      });
    }

    generateToken(res, user._id);
    res
      .status(201)
      .json({ success: true, message: "Account Created Successfully", user });
  } catch (error) {
    console.log("ERROR =>", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// ── Login ────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.role === "mentor" && user.mentorApplicationStatus === "pending") {
      return res.status(403).json({
        success: false,
        pending: true,
        message:
          "Your mentor application is under review. Please wait for admin approval.",
      });
    }

    if (user.role === "mentor" && user.mentorApplicationStatus === "rejected") {
      return res.status(403).json({
        success: false,
        rejected: true,
        message: "Your mentor application was rejected by admin.",
      });
    }

    generateToken(res, user._id);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isMentor: user.isMentor,
      mentorApplicationStatus: user.mentorApplicationStatus,
      avatar: user.avatar,
      profilePicture: user.profilePicture,
      skillCoins: user.skillCoins,
      completionPercentage: user.completionPercentage,
    };

    return res
      .status(200)
      .json({ success: true, message: "Login Successful", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Logout ───────────────────────────────────────────────────
const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// ── Get Profile ──────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update Profile ───────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      location,
      availability,
      experienceLevel,
      skills_offered,
      skills_wanted,
      socialLinks,
    } = req.body || {};

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (availability !== undefined) user.availability = availability;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (skills_offered !== undefined)
      user.skills_offered = JSON.parse(skills_offered);
    if (skills_wanted !== undefined)
      user.skills_wanted = JSON.parse(skills_wanted);
    if (socialLinks !== undefined) user.socialLinks = JSON.parse(socialLinks);

    if (req.file) {
      console.log("UPLOADED FILE:", req.file);
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    let completion = 0;
    if (user.name) completion += 10;
    if (user.bio) completion += 15;
    if (user.location) completion += 10;
    if (user.skills_offered?.length > 0) completion += 15;
    if (user.skills_wanted?.length > 0) completion += 10;
    if (user.experienceLevel) completion += 10;
    if (user.availability) completion += 5;
    if (user.profilePicture) completion += 15;
    if (user.socialLinks && Object.values(user.socialLinks).some((l) => l))
      completion += 10;

    user.completionPercentage = completion;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR =>", error);
    next(error);
  }
};

// ── Forgot Password ──────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // 1. All fields required
    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields." });
    }

    // 2. Basic email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please enter a valid email address.",
        });
    }

    // 3. Minimum length (matches model: minlength 6)
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
    }

    // 4. Passwords must match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    // 5. Find user — select +password so the pre-save hook doesn't skip hashing
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });
    }

    // 6. Assign new password — the existing pre('save') bcrypt hook hashes it at salt 12
    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR =>", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  logoutUser,
  forgotPassword,
};
