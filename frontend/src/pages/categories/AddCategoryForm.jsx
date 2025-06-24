import React, { useState, useEffect } from "react";
import axios from "axios";

const AddCategoryForm = () => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      alert("❌ Failed to load categories");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/categories",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      fetchCategories();
    } catch (err) {
      alert("❌ Failed to add category");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 min-h-screen flex flex-col md:flex-row gap-6">
      {/* Left: Add New Category Form */}
      <div className="bg-white p-6 shadow rounded w-full md:w-2/3">
        <h2 className="text-2xl font-bold mb-6">🗂️ Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter Category Name (e.g., Electronics, Grocery)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded">
            ➕ Add Category
          </button>
        </form>
      </div>

      {/* Right: Existing Categories */}
      <div className="bg-white p-6 shadow rounded w-full md:w-1/3">
        <h2 className="text-2xl font-bold mb-4">📋 Existing Categories</h2>
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="px-4 py-2 border rounded text-gray-700 font-medium">
                {cat.name}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No categories added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCategoryForm;
