import React, { useEffect, useState } from "react";
import axios from "axios";

const TransferStock = () => {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    item: "",
    quantity: "",
    fromWarehouse: "",
    toWarehouse: "",
    remarks: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, whRes] = await Promise.all([
          axios.get("http://localhost:5000/api/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/warehouses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setItems(itemRes.data);
        setWarehouses(whRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      itemId: form.item,
      fromWarehouseId: form.fromWarehouse,
      toWarehouseId: form.toWarehouse,
      quantity: Number(form.quantity), // Ensure numeric
      remarks: form.remarks,
    };

    try {
      await axios.post("http://localhost:5000/api/stocks/transfer", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Stock transferred successfully!");
      setForm({
        item: "",
        quantity: "",
        fromWarehouse: "",
        toWarehouse: "",
        remarks: "",
      });
    } catch (err) {
      console.error("❌ Transfer failed:", err);
      alert("❌ Error: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔄 Transfer Stock</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="item"
          value={form.item}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required>
          <option value="">-- Select Item --</option>
          {items.map((i) => (
            <option key={i._id} value={i._id}>
              {i.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          className="w-full border p-2 rounded"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <select
          name="fromWarehouse"
          value={form.fromWarehouse}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required>
          <option value="">-- From Warehouse --</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          name="toWarehouse"
          value={form.toWarehouse}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required>
          <option value="">-- To Warehouse --</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="remarks"
          placeholder="Remarks (optional)"
          className="w-full border p-2 rounded"
          value={form.remarks}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded">
          Transfer Stock
        </button>
      </form>
    </div>
  );
};

export default TransferStock;
