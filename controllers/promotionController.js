const Promotion = require("../model/Promotion");
require("../model/Dealer");

// Lấy tất cả khuyến mãi
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().populate("dealer");
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo khuyến mãi mới
exports.createPromotion = async (req, res) => {
  try {
    const { title, description, discountPercent, startDate, endDate, dealer } = req.body;

    const newPromotion = new Promotion({
      title,
      description,
      discountPercent,
      startDate,
      endDate,
      dealer,
    });

    await newPromotion.save();
    res.status(201).json(newPromotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật khuyến mãi
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!promotion) {
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    }
    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa khuyến mãi
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    }
    res.status(200).json({ message: "Xoá khuyến mãi thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
