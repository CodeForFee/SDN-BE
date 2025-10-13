const Dealer = require("../model/Dealer");

exports.getDealers = async (req, res) => {
  try {
    const dealers = await Dealer.find();

    res.status(200).json({
      success: true,
      count: dealers.length,
      data: dealers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDealer = async (req, res) => {
  try {
    const { name, location, contactInfo, salesTarget, debt } = req.body;

    if (!name || !location || !contactInfo || !salesTarget) {
      return res.status(400).json({ message: "Lack of information" });
    }

    const newDealer = {
      name,
      location,
      contactInfo,
      salesTarget,
      debt: debt || 0,
    };

    const createDealer = await Dealer.create(newDealer);

    res.status(201).json({
      message: "Create new dealer successfully",
      data: createDealer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contactInfo, salesTarget, debt } = req.body;

    // Kiểm tra dealer có tồn tại không
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    // Cập nhật thông tin
    const updatedDealer = await Dealer.findByIdAndUpdate(
      id,
      { name, location, contactInfo, salesTarget, debt },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Update dealer successfully",
      data: updatedDealer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDealer = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra dealer có tồn tại không
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({ message: "Dealer not found" });
    }

    await Dealer.findByIdAndDelete(id);

    res.status(200).json({
      message: "Delete dealer successfully",
      data: dealer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
