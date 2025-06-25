import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    const res = await axios.get(
      "https://brinventorybackend.vercel.app/api/users",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (user) => {
    if (editing === user._id) {
      setEditForm((prev) => ({ ...prev, active: !prev.active }));
    } else {
      await axios.put(
        `https://brinventorybackend.vercel.app/api/users/${user._id}`,
        { active: !user.active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    }
  };

  const startEdit = (user) => {
    setEditing(user._id);
    setEditForm({
      name: user.name,
      role: user.role,
      password: "",
      active: user.active,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (userId) => {
    const res = await axios.put(
      `https://brinventorybackend.vercel.app/api/users/${userId}`,
      editForm,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, ...res.data } : u))
    );

    setEditing(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 User Management</h1>
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Password</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b">
              <td className="p-2">
                {editing === u._id ? (
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="border p-1"
                  />
                ) : (
                  u.name
                )}
              </td>

              <td className="p-2">{u.email}</td>

              <td className="p-2 text-xs text-gray-600">
                {editing === u._id ? (
                  <input
                    name="password"
                    type="text"
                    value={editForm.password}
                    onChange={handleEditChange}
                    placeholder="New Password (optional)"
                    className="border p-1"
                  />
                ) : u.plainPassword ? (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {u.plainPassword}
                  </span>
                ) : (
                  <span className="italic text-gray-400">Not Available</span>
                )}
              </td>

              <td className="p-2">
                {editing === u._id ? (
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="border p-1">
                    <option value="viewer">Viewer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>

              <td className="p-2">
                <button
                  onClick={() => handleToggle(u)}
                  className={`px-2 py-1 text-xs rounded ${
                    (editing === u._id ? editForm.active : u.active)
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {(editing === u._id ? editForm.active : u.active)
                    ? "Active"
                    : "Inactive"}
                </button>
              </td>

              <td className="p-2 space-x-2">
                {editing === u._id ? (
                  <button
                    onClick={() => saveEdit(u._id)}
                    className="text-blue-600 hover:underline">
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(u)}
                    className="text-blue-600 hover:underline">
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
