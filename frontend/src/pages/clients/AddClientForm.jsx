import React, { useState, useEffect } from "react";
import axios from "axios";

const AddClientForm = ({
  fetchClients,
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

  // ✅ Prefill on edit mode
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
        // 🔁 Update
        await axios.put(
          `https://brinventorybackend.vercel.app/api/clients/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("✅ Client updated successfully!");
      } else {
        // ➕ Create
        await axios.post(
          "https://brinventorybackend.vercel.app/api/clients",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("✅ Client added successfully!");
      }

      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
      });

      if (fetchClients) fetchClients();
      if (closeModal) closeModal();
    } catch (error) {
      console.error(error);
      alert("❌ Error occurred while saving client!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded shadow mb-8 max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingId ? "✏️ Edit Client" : "➕ Add New Client"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Client Name"
          className="border p-3 rounded w-full"
          required
        />
        <input
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          placeholder="Contact Person"
          className="border p-3 rounded w-full"
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-3 rounded w-full"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-3 rounded w-full"
        />
        <input
          name="gstin"
          value={formData.gstin}
          onChange={handleChange}
          placeholder="GSTIN"
          className="border p-3 rounded w-full"
        />
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="border p-3 rounded w-full col-span-2"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg">
          {editingId ? "Update Client" : "Add Client"}
        </button>
      </div>
    </form>
  );
};

export default AddClientForm;
