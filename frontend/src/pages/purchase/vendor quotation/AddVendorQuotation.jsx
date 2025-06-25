import React, { useEffect, useState } from "react";
import axios from "axios";

const AddVendorQuotation = () => {
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [quotation, setQuotation] = useState({
    vendor: "",
    validUntil: "",
    terms: "",
    items: [{ item: "", quantity: 1, price: 0, remarks: "" }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [vendorRes, itemRes] = await Promise.all([
          axios.get("https://brinventorybackend.vercel.app/api/vendors", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://brinventorybackend.vercel.app/api/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setVendors(vendorRes.data);
        setItems(itemRes.data);
      } catch (error) {
        alert("❌ Failed to load vendor or item data.");
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...quotation.items];
    updatedItems[index][field] = value;

    if (field === "item") {
      const selectedItem = items.find((i) => i._id === value);
      if (selectedItem) {
        updatedItems[index].price = selectedItem.pricePerUnit || 0;
        updatedItems[index].remarks = selectedItem.description || "";
        updatedItems[index].quantity = 1;
      }
    }

    setQuotation({ ...quotation, items: updatedItems });
  };

  const addItemRow = () => {
    setQuotation({
      ...quotation,
      items: [
        ...quotation.items,
        { item: "", quantity: 1, price: 0, remarks: "" },
      ],
    });
  };

  const removeItemRow = (index) => {
    const updatedItems = [...quotation.items];
    updatedItems.splice(index, 1);
    setQuotation({ ...quotation, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://brinventorybackend.vercel.app/api/vendor-quotations",
        quotation,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Quotation submitted successfully!");
      // Reset form
      setQuotation({
        vendor: "",
        validUntil: "",
        terms: "",
        items: [{ item: "", quantity: 1, price: 0, remarks: "" }],
      });
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Failed to submit quotation.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">📄 Add Vendor Quotation</h2>

      <form onSubmit={handleSubmit}>
        <label className="block mb-1 font-medium">Vendor:</label>
        <select
          value={quotation.vendor}
          onChange={(e) =>
            setQuotation({ ...quotation, vendor: e.target.value })
          }
          className="border px-3 py-2 mb-4 rounded w-full"
          required>
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>

        <label className="block mb-1 font-medium">Valid Until:</label>
        <input
          type="date"
          value={quotation.validUntil}
          onChange={(e) =>
            setQuotation({ ...quotation, validUntil: e.target.value })
          }
          className="border px-3 py-2 mb-4 rounded w-full"
          required
        />

        <label className="block mb-1 font-medium">Terms:</label>
        <textarea
          className="border px-3 py-2 mb-4 rounded w-full"
          value={quotation.terms}
          onChange={(e) =>
            setQuotation({ ...quotation, terms: e.target.value })
          }
        />

        <h4 className="text-md font-semibold mb-2">Items:</h4>
        {quotation.items.map((row, i) => (
          <div
            key={i}
            className="border p-4 rounded mb-4 bg-gray-50 grid grid-cols-6 gap-2 items-center relative">
            <select
              className="border px-2 py-1 rounded"
              value={row.item}
              onChange={(e) => handleItemChange(i, "item", e.target.value)}
              required>
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Qty"
              className="border px-2 py-1 rounded"
              value={row.quantity}
              onChange={(e) => handleItemChange(i, "quantity", e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Price"
              className="border px-2 py-1 rounded"
              value={row.price}
              onChange={(e) => handleItemChange(i, "price", e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Remarks"
              className="border px-2 py-1 rounded col-span-2"
              value={row.remarks}
              onChange={(e) => handleItemChange(i, "remarks", e.target.value)}
            />

            <button
              type="button"
              onClick={() => removeItemRow(i)}
              className="text-red-500 font-bold hover:text-red-700 text-lg"
              title="Delete this item">
              ❌
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItemRow}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          ➕ Add Item
        </button>

        <br />
        <br />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Quotation
        </button>
      </form>
    </div>
  );
};

export default AddVendorQuotation;
