// File: /src/pages/reports/SalesReturnReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const SalesReturnReport = () => {
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://brinventorybackend.vercel.app/api/sales-returns",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReturns(res.data);
      } catch (err) {
        console.error("Error fetching sales returns:", err);
      }
    };

    fetchReturns();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sales Return Report</h2>
      <table className="w-full table-auto border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Return ID</th>
            <th className="p-2 border">Invoice</th>
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Item Count</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((ret, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{ret._id}</td>
              <td className="p-2 border">
                {ret.referenceId?.invoiceNumber || ret.referenceId?._id || "-"}
              </td>
              <td className="p-2 border">
                {ret.referenceId?.client?.name || "-"}
              </td>
              <td className="p-2 border">{ret.items?.length || 0}</td>
              <td className="p-2 border">
                <span
                  className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                    ret.reason?.toLowerCase().includes("damage")
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}>
                  {ret.reason}
                </span>
              </td>
              <td className="p-2 border">
                {new Date(ret.createdAt).toLocaleDateString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReturnReport;
