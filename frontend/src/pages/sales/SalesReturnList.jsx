// File: /src/pages/sales/SalesReturnList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const SalesReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/sales-returns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReturns(res.data);
      } catch (err) {
        console.error("Error fetching sales returns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-green-800">
        🔁 Sales Return List
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading sales returns...</p>
      ) : returns.length === 0 ? (
        <p className="text-gray-600">No sales returns found.</p>
      ) : (
        <div className="overflow-x-auto shadow border rounded-lg">
          <table className="min-w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-green-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((entry) => (
                <tr key={entry._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {entry._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    {entry.referenceId?.invoiceNumber || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {entry.referenceId?.client?.name || "—"}
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    {entry.items.map((i, index) => (
                      <div key={index}>
                        {i.item?.name || i.item} — Qty: {i.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                        entry.reason?.toLowerCase().includes("damage")
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}>
                      {entry.reason || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesReturnList;
