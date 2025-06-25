import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddSalesOrder = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [salesItems, setSalesItems] = useState([
    { item: "", quantity: 1, rate: 0, gst: 0 },
  ]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [remarks, setRemarks] = useState("");

  // Fetch Clients and Items
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [clientRes, itemRes] = await Promise.all([
          axios.get("https://brinventorybackend.vercel.app/api/clients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://brinventorybackend.vercel.app/api/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setClients(clientRes.data);
        setItems(itemRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
        alert("❌ Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    setSalesItems([...salesItems, { item: "", quantity: 1, rate: 0, gst: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...salesItems];
    if (field === "item") {
      const selected = items.find((i) => i._id === value);
      updated[index].item = value;
      updated[index].rate = selected?.pricePerUnit || 0;
      updated[index].gst = selected?.gst || 0;
    } else {
      updated[index][field] = ["quantity", "rate", "gst"].includes(field)
        ? parseFloat(value) || 0
        : value;
    }
    setSalesItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...salesItems];
    updated.splice(index, 1);
    setSalesItems(updated);
  };

  const generateSONumber = () => "SO" + Date.now();

  const handleSubmit = async () => {
    const soNumber = generateSONumber();
    const createdBy = JSON.parse(localStorage.getItem("user"))?._id;

    const cleanedItems = salesItems.map((i) => {
      const quantity = parseFloat(i.quantity) || 0;
      const rate = parseFloat(i.rate) || 0;
      const gst = parseFloat(i.gst) || 0;
      return {
        item: i.item,
        quantity,
        rate,
        gst,
        total: quantity * rate + (quantity * rate * gst) / 100,
      };
    });

    const hasInvalid = cleanedItems.some(
      (i) => !i.item || i.quantity <= 0 || isNaN(i.total)
    );

    if (!selectedClient || !deliveryDate || hasInvalid) {
      alert("❌ Please fill all fields correctly.");
      return;
    }

    const payload = {
      soNumber,
      client: selectedClient,
      items: cleanedItems,
      deliveryDate,
      remarks,
      createdBy,
    };

    try {
      await axios.post(
        "https://brinventorybackend.vercel.app/api/sales-orders",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("✅ Sales Order Created");
      navigate("/sales-orders");
    } catch (err) {
      console.error("❌ Error creating sales order:", err);
      alert("❌ Failed to create Sales Order");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">➕ Create Sales Order</h2>

      {/* Client */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Client:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}>
          <option value="">-- Select Client --</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Delivery Date */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Delivery Date:</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />
      </div>

      {/* Items */}
      <div>
        <h4 className="font-semibold mb-2">Items</h4>
        {salesItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
            <select
              className="flex-1 border p-2 rounded"
              value={item.item}
              onChange={(e) => handleItemChange(index, "item", e.target.value)}>
              <option value="">-- Select Item --</option>
              {items.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="w-20 border p-2 rounded"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
            />
            <input
              type="number"
              className="w-24 border p-2 rounded"
              value={item.rate}
              onChange={(e) => handleItemChange(index, "rate", e.target.value)}
            />
            <input
              type="number"
              className="w-20 border p-2 rounded"
              value={item.gst}
              onChange={(e) => handleItemChange(index, "gst", e.target.value)}
            />
            <button
              className="text-red-600"
              onClick={() => handleRemoveItem(index)}>
              ❌
            </button>
          </div>
        ))}
        <button
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
          onClick={handleAddItem}>
          + Add Item
        </button>
      </div>

      {/* Remarks */}
      <div className="mt-4">
        <label className="block font-semibold mb-1">Remarks:</label>
        <textarea
          rows={3}
          className="w-full border p-2 rounded"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
        onClick={handleSubmit}>
        Submit Sales Order
      </button>
    </div>
  );
};

export default AddSalesOrder;
