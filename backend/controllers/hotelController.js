const Hotel = require("../models/Hotel");

/**
 * CREATE HOTEL
 * Client / Admin
 */
exports.createHotel = async (req, res) => {
  try {
    const { name, location, description, pricePerNight } = req.body;

    const images = req.files.map((file) => file.path);

    const hotel = await Hotel.create({
      name,
      location,
      description,
      pricePerNight,
      images,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Hotel created successfully",
      hotel,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL HOTELS (PUBLIC)
 */
exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE HOTEL
 */
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!hotel)
      return res.status(404).json({ message: "Hotel not found" });

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE HOTEL
 * Owner / Admin
 */
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel)
      return res.status(404).json({ message: "Hotel not found" });

    // Ownership check
    if (
      req.user.role !== "admin" &&
      hotel.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const images =
      req.files?.length > 0
        ? req.files.map((file) => file.path)
        : hotel.images;

    hotel.name = req.body.name || hotel.name;
    hotel.location = req.body.location || hotel.location;
    hotel.description = req.body.description || hotel.description;
    hotel.pricePerNight =
      req.body.pricePerNight || hotel.pricePerNight;
    hotel.images = images;

    await hotel.save();

    res.json({ message: "Hotel updated", hotel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE HOTEL
 * Owner / Admin
 */
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel)
      return res.status(404).json({ message: "Hotel not found" });

    if (
      req.user.role !== "admin" &&
      hotel.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await hotel.deleteOne();
    res.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
