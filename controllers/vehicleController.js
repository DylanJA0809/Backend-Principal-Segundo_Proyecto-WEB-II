const Vehicle = require('../models/vehicle');
const User = require('../models/user');

const vehiclePost = async (req, res) => {
  try {
    let imagePath = null;

    if (req.file) {
      imagePath = req.file.path; 
    }

    let vehicle = new Vehicle({
        brand: req.body.brand,
        model: req.body.model,
        description: req.body.description,
        year: req.body.year,
        price: req.body.price,
        image_path: imagePath,
        id_user: req.body.id_user,
        status: req.body.status
    });

    const savedVehicle = await vehicle.save();

    res.status(201).json(savedVehicle);

  } catch (err) {
    console.log('error while saving vehicle', err);
    res.status(422); // Unprocessable Entity
  }
};

const vehicleGet = async (req, res) => {
  try {
    // 1. Buscar por id
    if (req.query.id) {
      const vehicle = await Vehicle.findById(req.query.id);

      if (!vehicle) {
        return res.status(404); // Not Found
      }

      const owner = await User.findById(vehicle.id_user).select("name last_name email id_number");

      return res.status(200).json({
        vehicle: vehicle,
        owner: owner
      });
    }

    // 2. Buscar todos o filtrar
    const filters = {};

    if (req.query.brand) {
      filters.brand = req.query.brand;
    }

    if (req.query.model) {
      filters.model = req.query.model;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.minYear || req.query.maxYear) {
      filters.year = {};

      if (req.query.minYear) {
        filters.year.$gte = parseInt(req.query.minYear);
      }

      if (req.query.maxYear) {
        filters.year.$lte = parseInt(req.query.maxYear);
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};

      if (req.query.minPrice) {
        filters.price.$gte = parseFloat(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        filters.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // 3. Paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Vehicle.countDocuments(filters);

    const vehicles = await Vehicle.find(filters)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages,
      results: vehicles
    });

  } catch (error) {
    console.error(error);
    res.status(500); // Internal Server Error
  }
};

const vehiclePut = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400); // Bad Request
    }

    const updateData = {};

    if (req.body.brand !== undefined) updateData.brand = req.body.brand;
    if (req.body.model !== undefined) updateData.model = req.body.model;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.year !== undefined) updateData.year = req.body.year;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.image_path !== undefined) updateData.image_path = req.body.image_path;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.body.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404); // Not Found
    }

    res.status(200).json(updatedVehicle);

  } catch (error) {
    console.error(error);
    res.status(422); // Unprocessable Entity
  }
};

const vehicleDelete = async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.query.id);

    if (!deletedVehicle) {
      return res.status(404).end(); // Not Found
    }

    return res.status(200).end();

  } catch (error) {
    console.error(error);
    return res.status(500).end(); // Internal Server Error
  }
};

module.exports = {
  vehiclePost,
  vehicleGet,
  vehiclePut,
  vehicleDelete
};