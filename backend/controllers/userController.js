import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("+plainPassword +active"); // ✅ fetch with plain password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "manager", "viewer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role", error });
  }
};

// (Optional) @desc    Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { name, role, password, active } = req.body;

    const user = await User.findById(req.params.id).select(
      "+password +plainPassword"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof active === "boolean") user.active = active; // ✅ add this

    if (password && password.trim() !== "") {
      user.password = password;
      user.plainPassword = password;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      plainPassword: user.plainPassword,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};
