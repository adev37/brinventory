import React, { useEffect, useState } from "react";
import axios from "axios";

const AddUnitForm = () => {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const unitsPerPage = 10; // Change how many units you want per page

  const token = localStorage.getItem("token");

  const fetchUnits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/units", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(res.data);
    } catch (err) {
      alert("Failed to load units ❌");
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/units",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setShowModal(false);
      fetchUnits();
    } catch (err) {
      alert("❌ Failed to add unit");
    }
  };

  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = units.slice(indexOfFirstUnit, indexOfLastUnit);

  const totalPages = Math.ceil(units.length / unitsPerPage);

  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-7xl mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow">
          ➕ Create New Unit
        </button>
        <h2 className="text-2xl font-bold uppercase text-center flex-1 -ml-24">
          Units List
        </h2>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded w-full max-w-7xl overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-yellow-200 text-gray-800 font-semibold">
              <th className="py-3 px-6 border-b text-left">Unit Name</th>
            </tr>
          </thead>
          <tbody>
            {currentUnits.length > 0 ? (
              currentUnits.map((unit) => (
                <tr key={unit._id} className="hover:bg-gray-100">
                  <td className="py-3 px-6 border-b">{unit.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-10 text-center text-gray-500" colSpan="1">
                  No units found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
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
              className={`px-4 py-2 rounded ${
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
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}>
            Next ▶️
          </button>
        </div>
      )}

      {/* Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Add New Unit
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter Unit Name (e.g., pcs, kg, box)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded"
                required
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded">
                  ➕ Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUnitForm;
