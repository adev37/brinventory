import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddDeliveryChallan = () => {
  const navigate = useNavigate();
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSOId, setSelectedSOId] = useState("");
  const [items, setItems] = useState([]);
  const [transportDetails, setTransportDetails] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");

  // Fetch SOs and Warehouses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [soRes, whRes] = await Promise.all([
          axios.get(
            "https://brinventorybackend.vercel.app/api/sales-orders/undelivered",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get("https://brinventorybackend.vercel.app/api/warehouses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setSalesOrders(soRes.data || []);
        setWarehouses(whRes.data || []);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        alert("Failed to load sales orders or warehouses");
      }
    };

    fetchData();
  }, []);

  const handleSOChange = (e) => {
    const soId = e.target.value;
    setSelectedSOId(soId);

    const selected = salesOrders.find((so) => so._id === soId);
    if (selected) {
      const mappedItems = selected.items.map((i) => ({
        item: i.item._id,
        name: i.item.name,
        quantity: i.remaining,
      }));
      setItems(mappedItems);
    } else {
      setItems([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSOId || items.length === 0 || !warehouseId) {
      alert("❌ Please select Sales Order, items, and warehouse.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        salesOrderId: selectedSOId,
        warehouseId, // ✅ correct key here
        items: items.map(({ item, quantity }) => ({ item, quantity })),
        transportDetails,
      };

      await axios.post(
        "https://brinventorybackend.vercel.app/api/delivery-challans",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Delivery Challan Created");
      navigate("/delivery-challans");
    } catch (err) {
      console.error("❌ Error creating DC:", err.response?.data || err.message);
      alert("❌ Failed to create Delivery Challan");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🚚 Create Delivery Challan</h2>

      {/* Sales Order Dropdown */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Sales Order</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedSOId}
          onChange={handleSOChange}>
          <option value="">-- Select Sales Order --</option>
          {salesOrders.map((so) => (
            <option key={so._id} value={so._id}>
              {so.soNumber || so.orderNumber} – {so.client?.name}
            </option>
          ))}
        </select>
      </div>

      {/* Warehouse Dropdown */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Warehouse</label>
        <select
          className="w-full border p-2 rounded"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}>
          <option value="">-- Select Warehouse --</option>
          {warehouses.map((wh) => (
            <option key={wh._id} value={wh._id}>
              {wh.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Items to Deliver</h4>
          <ul className="list-disc pl-5">
            {items.map((i, index) => (
              <li key={index}>
                {i.name} – Qty: {i.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transport */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Transport Details</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={transportDetails}
          onChange={(e) => setTransportDetails(e.target.value)}
          placeholder="e.g., UP32-A-1234 / Blue Dart"
        />
      </div>

      <button
        className="bg-green-600 text-white px-6 py-2 rounded"
        onClick={handleSubmit}>
        Submit Delivery Challan
      </button>
    </div>
  );
};

export default AddDeliveryChallan;
