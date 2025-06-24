import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("/api/sales-invoices"); // Adjust API path as needed
      setInvoices(response.data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">
        🧾 Sales Invoices
      </h2>
      <div className="overflow-x-auto shadow border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 border">Invoice No.</th>
              <th className="px-4 py-3 border">Client</th>
              <th className="px-4 py-3 border">Date</th>
              <th className="px-4 py-3 border">Total Amount</th>
              <th className="px-4 py-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="border-t">
                <td className="px-4 py-2 border">{invoice.invoiceNumber}</td>
                <td className="px-4 py-2 border">{invoice.clientName}</td>
                <td className="px-4 py-2 border">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">₹{invoice.totalAmount}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      invoice.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;
