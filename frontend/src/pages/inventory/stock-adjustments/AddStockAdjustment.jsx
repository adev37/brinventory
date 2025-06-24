// File: /src/pages/stock-adjustments/AddStockAdjustment.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddStockAdjustment = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("increase");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/items/with-stock",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const processed = res.data.map((item) => ({
        ...item,
        currentQty: item.currentQty ?? item.quantity ?? 0,
      }));

      setItems(processed);
    } catch (err) {
      toast.error("❌ Failed to fetch items");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity || !reason) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/stock-adjustments",
        {
          item: selectedItem,
          adjustmentType,
          quantity: Number(quantity),
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Stock adjusted successfully");
      setSelectedItem("");
      setQuantity("");
      setReason("");
    } catch (err) {
      toast.error("❌ Adjustment failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Stock Adjustment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Select */}
        <div>
          <label className="block font-medium">Item</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            required>
            <option value="">-- Select Item --</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.sku}) — Stock: {item.currentQty}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium">Adjustment Type</label>
          <select
            className="w-full border p-2 rounded"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value)}>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block font-medium">Quantity</label>
          <input
            type="number"
            min="1"
            className="w-full border p-2 rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block font-medium">Reason</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddStockAdjustment;
