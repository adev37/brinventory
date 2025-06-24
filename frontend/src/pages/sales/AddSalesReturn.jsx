import React, { useState, useEffect } from "react";
import axios from "axios";

const AddSalesReturn = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");

  const token = localStorage.getItem("token");

  // ✅ Load eligible invoices for return
  useEffect(() => {
    const fetchEligibleInvoices = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/sales-returns/eligible-invoices",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInvoices(res.data || []);
      } catch (err) {
        console.error("❌ Error loading eligible invoices:", err);
      }
    };

    const fetchWarehouses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/warehouses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWarehouses(res.data || []);
      } catch (err) {
        console.error("❌ Error loading warehouses:", err);
      }
    };

    fetchEligibleInvoices();
    fetchWarehouses();
  }, [token]);

  const handleInvoiceSelect = (e) => {
    const invoiceId = e.target.value;
    setSelectedInvoiceId(invoiceId);

    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (invoice) {
      const itemsToSet = invoice.items.map((i) => ({
        item: typeof i.item === "object" ? i.item._id : i.item,
        name: typeof i.item === "object" ? i.item.name : "Unnamed Item",
        quantity: i.quantity,
      }));
      setSelectedItems(itemsToSet);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInvoiceId || !warehouseId || selectedItems.length === 0) {
      alert("❌ Please select invoice, warehouse, and confirm items.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/sales-returns",
        {
          referenceId: selectedInvoiceId,
          items: selectedItems.map(({ item, quantity }) => ({
            item,
            quantity,
          })),
          reason,
          warehouseId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Sales return submitted");
      setSelectedInvoiceId("");
      setSelectedItems([]);
      setReason("");
      setWarehouseId("");
    } catch (err) {
      console.error("❌ Submit failed:", err?.response?.data || err.message);
      alert("❌ Failed to submit return");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">🔄 Create Sales Return</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Invoice Dropdown */}
        <select
          className="w-full border p-2 rounded"
          value={selectedInvoiceId}
          onChange={handleInvoiceSelect}
          required>
          <option value="">-- Select Invoice --</option>
          {invoices.map((inv) => (
            <option key={inv._id} value={inv._id}>
              {inv.invoiceNumber} — {inv.client?.name || "Unnamed"}
            </option>
          ))}
        </select>

        {/* Warehouse Dropdown */}
        <select
          className="w-full border p-2 rounded"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          required>
          <option value="">-- Select Warehouse --</option>
          {warehouses.map((wh) => (
            <option key={wh._id} value={wh._id}>
              {wh.name}
            </option>
          ))}
        </select>

        {/* Items Preview */}
        {selectedItems.length > 0 && (
          <ul className="bg-gray-50 border rounded p-2 text-sm">
            {selectedItems.map((item, idx) => (
              <li key={idx}>
                {item.name} — Qty: {item.quantity}
              </li>
            ))}
          </ul>
        )}

        {/* Reason Field */}
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Return Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Return
        </button>
      </form>
    </div>
  );
};

export default AddSalesReturn;
