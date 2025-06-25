import React, { useEffect, useState } from "react";
import axios from "axios";

const StockLedgerReport = () => {
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/stock-ledger", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLedger(res.data);
      } catch (err) {
        console.error("Failed to fetch ledger:", err);
      }
    };
    fetchLedger();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-GB");

  const formatQty = (operation, qty) => {
    const outOps = ["Delivery Challan", "Transfer OUT", "Purchase Return"];
    const inOps = ["GRN", "Sales Return", "Transfer IN"];

    if (outOps.includes(operation)) return `-${qty}`;
    if (inOps.includes(operation)) return `+${qty}`;
    return qty; // fallback for unknown or manual
  };

  const isOutOperation = (operation) => {
    return ["Delivery Challan", "Transfer OUT", "Purchase Return"].includes(
      operation
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Stock Ledger Report</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300">
          <thead className="bg-gray-100 text-sm">
            <tr className="text-center">
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Item</th>
              <th className="border px-2 py-1">SKU</th>
              <th className="border px-2 py-1">Operation</th>
              <th className="border px-2 py-1">Qty (+/-)</th>
              <th className="border px-2 py-1">Ref No</th>
              <th className="border px-2 py-1">Warehouse</th>
              <th className="border px-2 py-1">Performed By</th>
              <th className="border px-2 py-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry, idx) => (
              <tr key={idx} className="text-sm text-center hover:bg-gray-50">
                <td className="border px-2 py-1">{formatDate(entry.date)}</td>
                <td className="border px-2 py-1">{entry.item?.name || "-"}</td>
                <td className="border px-2 py-1">{entry.item?.sku || "-"}</td>
                <td className="border px-2 py-1">{entry.operation}</td>
                <td
                  className={`border px-2 py-1 font-semibold ${
                    isOutOperation(entry.operation)
                      ? "text-red-600"
                      : "text-green-700"
                  }`}>
                  {formatQty(entry.operation, entry.quantity)}
                </td>
                <td className="border px-2 py-1">{entry.refNo || "-"}</td>
                <td className="border px-2 py-1">
                  {entry.warehouse?.name || "-"}
                </td>
                <td className="border px-2 py-1">
                  {entry.createdBy?.name || "System"}
                </td>
                <td className="border px-2 py-1">{entry.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLedgerReport;
