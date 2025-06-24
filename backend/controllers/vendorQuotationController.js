import VendorQuotation from "../models/vendorQuotationModel.js";

export const createVendorQuotation = async (req, res) => {
  try {
    const newQuotation = await VendorQuotation.create(req.body);
    res.status(201).json(newQuotation);
  } catch (error) {
    res.status(500).json({ message: "Error creating vendor quotation", error });
  }
};

export const getAllVendorQuotations = async (req, res) => {
  try {
    const quotations = await VendorQuotation.find()
      .populate("vendor")
      .populate("items.item");
    res.status(200).json(quotations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching vendor quotations", error });
  }
};

export const getVendorQuotationById = async (req, res) => {
  try {
    const quotation = await VendorQuotation.findById(req.params.id)
      .populate("vendor")
      .populate("items.item");

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    res.status(200).json(quotation);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving quotation", error });
  }
};

export const updateVendorQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await VendorQuotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};
