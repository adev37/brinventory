// File: /src/pages/stock-adjustments/StockAdjustmentList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const StockAdjustmentList = () => {
  const [adjustments, setAdjustments] = useState([]);

  useEffect(() => {
    const fetchAdjustments = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/stock-adjustments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAdjustments(res.data);
    };
    fetchAdjustments();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Stock Adjustments</h2>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Reason</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {adjustments.map((adj, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{adj.item?.name}</td>
              <td className="p-2 border">{adj.adjustmentType}</td>
              <td className="p-2 border">{adj.quantity}</td>
              <td className="p-2 border">{adj.reason}</td>
              <td className="p-2 border">
                {new Date(adj.adjustedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockAdjustmentList;
