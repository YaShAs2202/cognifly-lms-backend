// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ✅ Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ✅ Signup (with role support)
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Create user with role (default = student)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ include role
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// ✅ Login (return role and token)
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // ✅ Role verification (optional but safer)
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Access denied. This account is registered as ${user.role}.`,
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ include role
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
