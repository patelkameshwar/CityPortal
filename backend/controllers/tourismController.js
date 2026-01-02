const Tourism = require("../models/Tourism");

/**
 * CREATE TOURISM PLACE
 * Client / Admin
 */
exports.createTourism = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      entryFee,
      openTime,
      closeTime,
    } = req.body;

    const images = req.files.map((file) => file.path);

    const tourism = await Tourism.create({
      name,
      location,
      description,
      entryFee,
      openTime,
      closeTime,
      images,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Tourism place created successfully",
      tourism,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL TOURISM PLACES (PUBLIC)
 */
exports.getAllTourism = async (req, res) => {
  try {
    const tourismPlaces = await Tourism.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(tourismPlaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE TOURISM PLACE
 */
exports.getTourismById = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!tourism)
      return res
        .status(404)
        .json({ message: "Tourism place not found" });

    res.json(tourism);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE TOURISM PLACE
 * Owner / Admin
 */
exports.updateTourism = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id);
    if (!tourism)
      return res
        .status(404)
        .json({ message: "Tourism place not found" });

    // Ownership check
    if (
      req.user.role !== "admin" &&
      tourism.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const images =
      req.files?.length > 0
        ? req.files.map((file) => file.path)
        : tourism.images;

    tourism.name = req.body.name || tourism.name;
    tourism.location = req.body.location || tourism.location;
    tourism.description =
      req.body.description || tourism.description;
    tourism.entryFee =
      req.body.entryFee || tourism.entryFee;
    tourism.openTime = req.body.openTime || tourism.openTime;
    tourism.closeTime =
      req.body.closeTime || tourism.closeTime;
    tourism.images = images;

    await tourism.save();

    res.json({
      message: "Tourism place updated successfully",
      tourism,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE TOURISM PLACE
 * Owner / Admin
 */
exports.deleteTourism = async (req, res) => {
  try {
    const tourism = await Tourism.findById(req.params.id);
    if (!tourism)
      return res
        .status(404)
        .json({ message: "Tourism place not found" });

    if (
      req.user.role !== "admin" &&
      tourism.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await tourism.deleteOne();

    res.json({
      message: "Tourism place deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
