import axios from "axios";
import React, { useEffect, useState } from "react";
import AddClientForm from "./AddClientForm"; // ✅ Import your client form

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 13;

  const [editClient, setEditClient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchClients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      alert("Failed to load clients ❌");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this client?")) {
      await axios.delete(`http://localhost:5000/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
    }
  };

  const handleEdit = (client) => {
    setEditClient(client);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditClient(null);
    setShowModal(false);
  };

  const handleUpdateComplete = () => {
    closeModal();
    fetchClients();
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div className="p-4 min-h-screen flex flex-col relative overflow-y-hidden">
      <h2 className="text-2xl font-bold mb-4">👥 Client Management</h2>

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

        {/* Table */}
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left w-[20%]">Client Name</th>
              <th className="p-2 text-left w-[20%]">Email</th>
              <th className="p-2 text-left w-[10%]">GSTIN</th>
              <th className="p-2 text-left w-[35%]">Address</th>
              <th className="p-2 text-left w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentClients.length > 0 ? (
              currentClients.map((client) => (
                <tr key={client._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{client.name}</td>
                  <td className="p-2">{client.email}</td>
                  <td className="p-2">{client.gstin || "-"}</td>
                  <td className="p-2">{client.address}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEdit(client)}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client._id)}
                      className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No clients found.
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

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-red-500">
              &times;
            </button>
            <AddClientForm
              fetchClients={handleUpdateComplete}
              formData={editClient}
              setFormData={() => {}}
              editingId={editClient._id}
              setEditingId={() => {}}
              isModal={true}
              closeModal={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
