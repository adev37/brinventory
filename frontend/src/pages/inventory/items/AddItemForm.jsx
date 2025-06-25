import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
}

const AddItemForm = ({ fetchItems, editItem, setEditItem }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    unit: "",
    category: "",
    warehouse: "",
    description: "",
    pricePerUnit: "",
    gst: "",
    lowStockThreshold: 5,
  });

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchWarehouses();

    if (editItem) {
      setFormData({
        ...editItem,
        category: editItem?.category?._id || "",
        unit: editItem.unit || "",
        gst: editItem.gst || "",
        warehouse: editItem.warehouse || "", // For edit mode (optional)
      });
    } else {
      resetForm();
    }
  }, [editItem]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://brinventorybackend.vercel.app/api/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(res.data);
    } catch {
      toast.error("❌ Failed to load categories");
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get(
        "https://brinventorybackend.vercel.app/api/units",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnits(res.data);
    } catch {
      toast.error("❌ Failed to load units");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(
        "https://brinventorybackend.vercel.app/api/warehouses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWarehouses(res.data);
    } catch {
      toast.error("❌ Failed to load warehouses");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      unit: "",
      category: "",
      warehouse: "",
      description: "",
      pricePerUnit: "",
      gst: "",
      lowStockThreshold: 5,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = getUserFromToken();

    const payload = {
      ...formData,
      gst: Number(formData.gst),
      pricePerUnit: Number(formData.pricePerUnit),
      lowStockThreshold: Number(formData.lowStockThreshold),
      updatedBy: user?.name || "Unknown",
    };

    try {
      if (editItem) {
        await axios.put(
          `https://brinventorybackend.vercel.app/api/items/${editItem._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("✅ Item updated successfully");
        setEditItem(null);
      } else {
        await axios.post(
          "https://brinventorybackend.vercel.app/api/items",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("✅ Item added successfully");
      }

      if (typeof fetchItems === "function") fetchItems();
      resetForm();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error("❌ " + message);
      console.error("Error saving item:", message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editItem ? "✏️ Edit Item" : "➕ Add New Item"}
      </h2>

      <div className="mb-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Item Name"
          className="border p-3 rounded w-full focus:ring-2 focus:ring-blue-300 outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Enter SKU"
          className="border p-3 rounded w-full"
          required
        />
        <input
          name="pricePerUnit"
          type="number"
          value={formData.pricePerUnit}
          onChange={handleChange}
          placeholder="Price per Unit (₹)"
          className="border p-3 rounded w-full"
          required
        />
        <select
          name="gst"
          value={formData.gst}
          onChange={handleChange}
          className="border p-3 rounded w-full bg-white"
          required>
          <option value="">Select GST %</option>
          {[0, 5, 12, 18, 28].map((rate) => (
            <option key={rate} value={rate}>
              {rate}%
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <select
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required>
          <option value="">📏 Select Unit</option>
          {units.map((unit) => (
            <option key={unit._id} value={unit.name}>
              {unit.name}
            </option>
          ))}
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-3 rounded w-full">
          <option value="">📂 Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="warehouse"
          value={formData.warehouse}
          onChange={handleChange}
          className="border p-3 rounded w-full"
          required>
          <option value="">🏬 Select Warehouse</option>
          {warehouses.map((wh) => (
            <option key={wh._id} value={wh._id}>
              {wh.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <input
          name="lowStockThreshold"
          type="number"
          value={formData.lowStockThreshold}
          onChange={handleChange}
          placeholder="Low Stock Threshold"
          className="border p-3 rounded w-full"
        />
      </div>

      <div className="mt-4">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-3 rounded w-full"
          rows="3"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg">
          {editItem ? "Update Item" : "Add Item"}
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </form>
  );
};

export default AddItemForm;
