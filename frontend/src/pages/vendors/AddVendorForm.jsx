import React, { useState, useEffect } from "react";
import axios from "axios";

const AddVendorForm = ({
  fetchVendors,
  formData: initialData = null,
  editingId = null,
  closeModal,
}) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
  });

  // ✅ Pre-fill form in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        contactPerson: initialData.contactPerson || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        gstin: initialData.gstin || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `https://brinventorybackend.vercel.app/api/vendors/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("✅ Vendor updated successfully!");
      } else {
        await axios.post(
          "https://brinventorybackend.vercel.app/api/vendors",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("✅ Vendor added successfully!");
      }

      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
      });

      if (fetchVendors) fetchVendors();
      if (closeModal) closeModal();
    } catch (err) {
      alert("❌ Error saving vendor!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {editingId ? "✏️ Edit Vendor" : "➕ Add New Vendor"}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Vendor Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Contact Person"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="GSTIN"
          name="gstin"
          value={formData.gstin}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <div className="mt-6 text-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {editingId ? "Update Vendor" : "Add Vendor"}
        </button>
      </div>
    </form>
  );
};

export default AddVendorForm;
