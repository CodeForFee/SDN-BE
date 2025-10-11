const Customer = require("../model/Customer");

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, feedback } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const newCustomer = await Customer.create({
      name,
      phone: phone || "",
      email: email || "",
      address: address || "",
      feedback: feedback || "",
    });

    res.status(201).json({
      message: "Create new customer successfully",
      data: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT - Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, feedback } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { name, phone, email, address, feedback },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Update customer successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE - Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delete customer successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
