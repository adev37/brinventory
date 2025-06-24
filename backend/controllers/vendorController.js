import Vendor from "../models/Vendor.js";

// Create Vendor
export const createVendor = async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (err) {
    res.status(500).json({ message: "Failed to create vendor", error: err });
  }
};

// Get All Vendors
export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vendors", error: err });
  }
};

// Update Vendor
export const updateVendor = async (req, res) => {
  try {
    const updated = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update vendor", error: err });
  }
};

// Delete Vendor
export const deleteVendor = async (req, res) => {
  try {
    await Vendor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete vendor", error: err });
  }
};
