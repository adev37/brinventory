import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchWarehouses } from "../../utils/fetchWarehouses"; // Adjust the import path as needed

const AddPurchaseOrder = () => {
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [poItems, setPoItems] = useState([
    { item: "", quantity: "", rate: "", gst: "", unit: "" },
  ]);
  const [vendorId, setVendorId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/vendors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVendors(Array.isArray(res.data) ? res.data : []))
      .catch(() => alert("Failed to load vendors"));

    axios
      .get("http://localhost:5000/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => alert("Failed to load items"));

    fetchWarehouses().then((data) => setWarehouses(data));
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;

    if (field === "item") {
      const selectedItem = items.find((i) => i._id === value);
      if (selectedItem) {
        updated[index].rate = selectedItem.pricePerUnit || "";
        updated[index].gst = selectedItem.gst || "";
        updated[index].unit = selectedItem.unit || "";
        updated[index].quantity = 1;
      }
    }

    setPoItems(updated);
  };

  const addItemRow = () => {
    setPoItems([
      ...poItems,
      { item: "", quantity: "", rate: "", gst: "", unit: "" },
    ]);
  };

  const removeItemRow = (index) => {
    const updated = [...poItems];
    updated.splice(index, 1);
    setPoItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const poData = {
      poNumber: "PO-" + Date.now(),
      vendor: vendorId,
      deliveryDate,
      warehouse: warehouseId,
      items: poItems.map((i) => ({
        item: i.item,
        quantity: Number(i.quantity),
        rate: Number(i.rate),
        gst: Number(i.gst),
        unit: i.unit,
      })),
    };

    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5000/api/purchase-orders", poData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Purchase Order Created!");

      setVendorId("");
      setDeliveryDate("");
      setWarehouseId("");
      setPoItems([{ item: "", quantity: "", rate: "", gst: "", unit: "" }]);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create Purchase Order.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">📝 Create Purchase Order</h2>

      <form onSubmit={handleSubmit}>
        {/* Vendor */}
        <label className="block mb-1 font-medium">Vendor:</label>
        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          className="border px-3 py-2 mb-4 rounded w-full"
          required>
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Delivery Date */}
        <label className="block mb-1 font-medium">Delivery Date:</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="border px-3 py-2 mb-4 rounded w-full"
          required
        />

        {/* Warehouse Dropdown */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Warehouse</label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
            required>
            <option value="">-- Select --</option>
            {warehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>

        {/* Items */}
        <h4 className="text-md font-semibold mb-2">Items:</h4>
        {poItems.map((poItem, idx) => (
          <div
            key={idx}
            className="border p-4 rounded mb-4 bg-gray-50 grid grid-cols-6 gap-2 items-center relative">
            <select
              className="border px-2 py-1 rounded"
              onChange={(e) => handleChange(idx, "item", e.target.value)}
              value={poItem.item}
              required>
              <option value="">Select Item</option>
              {items.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Qty"
              className="border px-2 py-1 rounded"
              value={poItem.quantity}
              onChange={(e) => handleChange(idx, "quantity", e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Rate"
              className="border px-2 py-1 rounded"
              value={poItem.rate}
              onChange={(e) => handleChange(idx, "rate", e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="GST %"
              className="border px-2 py-1 rounded"
              value={poItem.gst}
              onChange={(e) => handleChange(idx, "gst", e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Unit"
              className="border px-2 py-1 rounded bg-gray-100"
              value={poItem.unit || ""}
              readOnly
            />

            <button
              type="button"
              onClick={() => removeItemRow(idx)}
              className="text-red-500 font-bold hover:text-red-700 text-lg"
              title="Delete this item">
              ❌
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItemRow}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          ➕ Add Item
        </button>

        <br />
        <br />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create PO
        </button>
      </form>
    </div>
  );
};

export default AddPurchaseOrder;
