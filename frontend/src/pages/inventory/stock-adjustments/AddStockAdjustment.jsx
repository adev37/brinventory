import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddStockAdjustment = () => {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("increase");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchItemsAndWarehouses = async () => {
    try {
      const [stockRes, warehouseRes] = await Promise.all([
        axios.get("http://localhost:5000/api/stocks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/warehouses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setItems(stockRes.data);
      setWarehouses(warehouseRes.data);
    } catch (err) {
      toast.error("❌ Failed to fetch data");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItemsAndWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem || !selectedWarehouse || !quantity || !reason) {
      toast.error("⚠️ Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/stock-adjustments",
        {
          item: selectedItem,
          adjustmentType,
          quantity: Number(quantity),
          reason,
          warehouse: selectedWarehouse,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("✅ Stock adjusted successfully");
      setSelectedItem("");
      setSelectedWarehouse("");
      setQuantity("");
      setReason("");
      setAdjustmentType("increase");

      fetchItemsAndWarehouses(); // Refresh stock
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "❌ Adjustment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Stock Adjustment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item */}
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
                {item.name} ({item.sku}) — Stock: {item.quantity}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse */}
        <div>
          <label className="block font-medium">Warehouse</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            required>
            <option value="">-- Select Warehouse --</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Adjustment Type */}
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
