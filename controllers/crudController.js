// Simple CRUD controller factory for Mongoose models
module.exports = function createCrudController(Model) {
  return {
    async list(req, res) {
      try {
        const { page = 1, limit = 50, q } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = q
          ? { $or: Object.entries(Model.schema.paths)
              .filter(([, v]) => v.instance === 'String')
              .map(([k]) => ({ [k]: { $regex: q, $options: 'i' } })) }
          : {};
        const [items, total] = await Promise.all([
          Model.find(filter).skip(skip).limit(Number(limit)),
          Model.countDocuments(filter),
        ]);
        res.json({ items, total, page: Number(page), limit: Number(limit) });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    async get(req, res) {
      try {
        const item = await Model.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    async create(req, res) {
      try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json(item);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
    async update(req, res) {
      try {
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
    async remove(req, res) {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  };
};

