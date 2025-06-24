import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddGRN = () => {
  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivedItems, setReceivedItems] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Load POs and Warehouses on mount
  useEffect(() => {
    loadPurchaseOrders();
    loadWarehouses();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/purchase-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const poList = Array.isArray(res.data)
        ? res.data
        : res.data?.poList || [];

      const eligiblePOs = poList.filter(
        (po) => po.status === "Pending" || po.status === "Partially Received"
      );

      setPOs(eligiblePOs);
    } catch (err) {
      console.error("❌ Error loading POs:", err);
      toast.error("❌ Failed to load purchase orders.");
    }
  };

  const loadWarehouses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWarehouses(res.data);
    } catch (err) {
      console.error("❌ Warehouse fetch error:", err);
      toast.error("❌ Failed to load warehouses.");
    }
  };

  const handleSelectPO = (poId) => {
    const po = pos.find((p) => p._id === poId);
    if (!po) return;

    setSelectedPO(po);
    setRemarks("");

    const itemsToReceive = po.items.map((i) => ({
      item: typeof i.item === "object" ? i.item._id : i.item,
      receivedQty: i.quantity,
    }));

    setReceivedItems(itemsToReceive);
  };

  const handleQtyChange = (index, value) => {
    const updated = [...receivedItems];
    updated[index].receivedQty = Number(value);
    setReceivedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPO) return toast.warn("⚠️ Please select a Purchase Order.");
    if (!warehouseId) return toast.warn("⚠️ Please select a warehouse.");

    setSubmitting(true);

    try {
      await axios.post(
        "http://localhost:5000/api/goods-receipts",
        {
          purchaseOrder: selectedPO._id,
          receivedItems,
          remarks,
          warehouseId,
          createdBy: userId || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✅ GRN created successfully");

      setSelectedPO(null);
      setReceivedItems([]);
      setRemarks("");
      setWarehouseId("");
    } catch (err) {
      console.error("❌ GRN error:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to submit GRN";
      toast.error("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">📥 Goods Receipt Note</h2>

      {/* Select PO */}
      <label className="block mb-2 font-medium">Select Purchase Order:</label>
      <select
        onChange={(e) => handleSelectPO(e.target.value)}
        className="border px-4 py-2 rounded w-full mb-4"
        value={selectedPO?._id || ""}
        required>
        <option value="">-- Select PO --</option>
        {pos.map((po) => (
          <option key={po._id} value={po._id}>
            {po.poNumber}
          </option>
        ))}
      </select>

      {/* Select Warehouse */}
      <label className="block mb-2 font-medium">Select Warehouse:</label>
      <select
        value={warehouseId}
        onChange={(e) => setWarehouseId(e.target.value)}
        className="border px-4 py-2 rounded w-full mb-4"
        required>
        <option value="">-- Select Warehouse --</option>
        {warehouses.map((wh) => (
          <option key={wh._id} value={wh._id}>
            {wh.name} ({wh.location})
          </option>
        ))}
      </select>

      {/* Items */}
      {selectedPO && (
        <form onSubmit={handleSubmit}>
          <h4 className="text-md font-medium mb-2">Items to Receive:</h4>

          {selectedPO.items.map((i, idx) => (
            <div key={idx} className="flex items-center mb-3">
              <span className="w-1/3">{i.item?.name || "Item"}</span>
              <input
                type="number"
                value={receivedItems[idx]?.receivedQty || 0}
                onChange={(e) => handleQtyChange(idx, e.target.value)}
                className="border px-2 py-1 rounded w-1/3 ml-4"
                min="0"
                max={i.quantity}
                required
              />
              <span className="ml-2 text-sm text-gray-500">
                / {i.quantity} ordered
              </span>
            </div>
          ))}

          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="border p-2 rounded w-full mt-4"
            rows="2"
            placeholder="Any remarks (optional)"
          />

          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={submitting}>
            {submitting ? "Submitting..." : "Submit GRN"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddGRN;
