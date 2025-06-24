import React, { useEffect, useState } from "react";
import axios from "axios";
import AddItemForm from "./AddItemForm";
import { toast } from "react-hot-toast";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
      setFilteredItems(res.data);
    } catch (err) {
      toast.error("Failed to load items ❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories ❌");
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/units", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(res.data);
    } catch (err) {
      toast.error("Failed to load units ❌");
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (searchText.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.sku?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.category?._id === selectedCategory
      );
    }

    if (selectedUnit) {
      filtered = filtered.filter((item) => item.unit === selectedUnit);
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (err) {
      toast.error("Delete failed ❌");
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleRowDoubleClick = (item) => {
    setViewItem(item);
  };

  const closeModal = () => {
    setEditItem(null);
    setShowModal(false);
  };

  const handleUpdateComplete = () => {
    closeModal();
    fetchItems();
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSelectedUnit("");
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUnits();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedCategory, selectedUnit, items]);

  return (
    <div className="p-4 min-h-screen flex flex-col relative overflow-y-hidden">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 justify-between items-center">
        <input
          type="text"
          placeholder="🔎 Search Name or SKU"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded w-60"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded w-60">
          <option value="">📂 All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="border p-2 rounded w-60">
          <option value="">📏 All Units</option>
          {units.map((unit) => (
            <option key={unit._id} value={unit.name}>
              {unit.name}
            </option>
          ))}
        </select>
        <button
          onClick={resetFilters}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
          🔄 Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto min-h-[600px]">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 text-left w-[25%]">Name</th>
                <th className="p-2 text-left w-[25%]">SKU</th>
                <th className="p-2 text-left w-[20%]">Unit</th>
                <th className="p-2 text-left w-[20%]">Price</th>
                <th className="p-2 text-left w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onDoubleClick={() => handleRowDoubleClick(item)}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.sku}</td>
                    <td className="p-2">{item.unit}</td>
                    <td className="p-2">₹{item.pricePerUnit}</td>
                    <td className="p-2 flex gap-2">
                      {user?.role !== "viewer" && (
                        <>
                          <button
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                            onClick={() => handleEdit(item)}>
                            Edit
                          </button>
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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
    </div>
  );
};

export default ItemList;
