import React, { useEffect, useState } from "react";
import axios from "axios";

const SalesInvoiceList = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://brinventorybackend.vercel.app/api/sales-invoices",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoices(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch invoices:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📄 Sales Invoice List</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Invoice No</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Items</th>
            <th className="border p-2">Transport</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id} className="border-t">
              <td className="border p-2">{inv.invoiceNumber}</td>
              <td className="border p-2">{inv.client?.name}</td>
              <td className="border p-2">
                <ul className="list-disc pl-4">
                  {inv.items.map((i, idx) => (
                    <li key={idx}>
                      {i.item?.name} – Qty: {i.quantity}, ₹{i.price}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border p-2">
                {inv.deliveryChallan?.transportDetails || "-"}
              </td>
              <td className="border p-2">
                {new Date(inv.deliveryChallan?.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesInvoiceList;
