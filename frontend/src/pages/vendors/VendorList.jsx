import axios from "axios";
import React, { useEffect, useState } from "react";
import AddVendorForm from "./AddVendorForm"; // ✅ import the form

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 13;

  const [editVendor, setEditVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchVendors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data);
    } catch (err) {
      alert("Failed to load vendors ❌");
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleEdit = (vendor) => {
    setEditVendor(vendor);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditVendor(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this vendor?")) {
      await axios.delete(`http://localhost:5000/api/vendors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendors();
    }
  };

  const handleUpdateComplete = () => {
    closeModal();
    fetchVendors();
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchText.toLowerCase()) ||
      v.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(
    indexOfFirstVendor,
    indexOfLastVendor
  );

  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);

  return (
    <div className="p-4 min-h-screen flex flex-col relative overflow-y-hidden">
      <h2 className="text-2xl font-bold mb-4">💼 Vendor Management</h2>

      <div className="bg-white p-4 rounded shadow">
        {/* Search */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="🔍 Search Name or Email"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-2 rounded w-64"
          />
        </div>

        {/* Vendor Table */}
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left w-[20%]">Vendor Name</th>
              <th className="p-2 text-left w-[20%]">Email</th>
              <th className="p-2 text-left w-[10%]">GSTIN</th>
              <th className="p-2 text-left w-[35%]">Address</th>
              <th className="p-2 text-left w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVendors.length > 0 ? (
              currentVendors.map((vendor) => (
                <tr key={vendor._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{vendor.name}</td>
                  <td className="p-2">{vendor.email}</td>
                  <td className="p-2">{vendor.gstin || "-"}</td>
                  <td className="p-2">{vendor.address}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
                      className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fixed bottom-4 right-1/2 transform translate-x-1/2 flex gap-2 z-50">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}>
            ◀️ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}>
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}>
            Next ▶️
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-red-500">
              &times;
            </button>
            <AddVendorForm
              fetchVendors={handleUpdateComplete}
              formData={editVendor}
              editingId={editVendor._id}
              closeModal={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;
