import React, { useEffect, useState } from "react";
import axios from "axios";

const SalesReport = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/sales-invoices",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched Invoices:", res.data); // Debug log
        setSales(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch sales invoices:", error);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sales Report</h2>
      <table className="w-full table-auto border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Invoice No</th>
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Item Count</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.length > 0 ? (
            sales.map((inv, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{inv.invoiceNumber || "N/A"}</td>
                <td className="p-2 border">{inv.client?.name || "N/A"}</td>
                <td className="p-2 border">{inv.items?.length ?? 0}</td>
                <td className="p-2 border">
                  ₹ {inv.totalAmount?.toFixed(2) || "0.00"}
                </td>
                <td className="p-2 border">
                  {inv.invoiceDate
                    ? new Date(inv.invoiceDate).toLocaleDateString("en-GB")
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No sales invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;
