const VehicleModel = require('../models/VehicleModel');
const VehicleVariant = require('../models/VehicleVariant');
const VehicleColor = require('../models/VehicleColor'); 

exports.getVehicles = async (req, res) => { 
    try{ 
        const variants = await VehicleVariant.find().populate('model'); 
        
        res.status(200).json({ 
            success: true, 
            count: variants.length, 
            data: variants 
        }) 
    } catch (error){ 
        res.status(500).json({message: error.message})
    }
}; 

exports.getVehicleById = async(req, res) => { 
    try{ 
        const {id} = req.params; 

        if(!id) return res.status(400).json({message: "Lack of information"});

        const variant = await VehicleVariant.findById(id).populate('model'); 
        
        if(!variant) return res.status(404).json({ message: "Vehicle variant not found"}); 
        
        res.status(200).json({ 
            success: true, 
            data: variant 
        }); 
    } catch (error) { 
        res.status(500).json({message: error.message}); 
    } 
}; 

exports.createVehicle = async (req, res) => { 
    try{ 
        const {model, trim, battery, range, motorPower, features, msrp, images, active} = req.body; 
        
        if (!model || !trim || !msrp) return res.status(400).json({message: "Lack of information"}); 
        
        const newVariant = { 
            model: model, 
            trim: trim, 
            battery: battery, 
            range: range, 
            motorPower: motorPower,
            features: features,
            msrp: msrp,
            images: images,
            active: active
        } 
        
        const createVariant = await VehicleVariant.create(newVariant); 
        
        res.status(201).json({ 
            message: "Create new vehicle variant successfully", 
            data: createVariant 
        }) 
    } catch (error){
         res.status(500).json({ message: error.message}); 
    }; 
} 
    
exports.updateVehicle = async (req, res) => { 
    try{ 
        const {id} = req.params; 

        const {model, trim, battery, range, motorPower, features, msrp, images, active} = req.body; 
        
        if(!id) return res.status(400).json({ message: "Lack of information"}); 
        
        const variantData = { 
            model, 
            trim, 
            battery, 
            range, 
            motorPower,
            features,
            msrp,
            images,
            active
        } 
            
        const updateVariant = await VehicleVariant.findByIdAndUpdate(id, variantData, {new: true}); 
        
        if(!updateVariant){ 
            return res.status(404).json({message: "Vehicle variant not found"}); 
        } 
        
        res.status(200).json({ 
            message: "Update vehicle variant successfully", 
            data: updateVariant 
        }) 
    } catch (error){ 
        res.status(500).json({message: error.message}); 
    } 
}; 

exports.deleteVehicle = async (req, res) => { 
    try{ 
        const {id} = req.params;
         
        const variant = await VehicleVariant.findByIdAndDelete(id); 
        
        if(!variant){ 
            return res.status(404).json({ message: "Vehicle variant not found"}); 
        }; 
        
        res.status(200).json({ message: "Delete vehicle variant successfully" }) 
    } catch (error){ 
        res.status(500).json({message: error.message}); 
    } 
}

// Compare multiple vehicle variants by ids
// Supports both GET (?ids=a,b,c) and POST (JSON body with {ids: [id1, id2, ...]})
exports.compareVehicles = async (req, res) => {
  try {
    let idList = [];
    
    // Check if request body has ids array (POST method)
    if (req.body && req.body.ids && Array.isArray(req.body.ids)) {
      idList = req.body.ids.map(id => String(id).trim()).filter(id => id);
    } 
    // Check if query parameter has ids (GET method - backward compatibility)
    else if (req.query.ids) {
      idList = String(req.query.ids)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
    }
    
    // Validate that we have at least 2 vehicles to compare
    if (idList.length < 2) {
      return res.status(400).json({ 
        message: 'Cần ít nhất 2 xe để so sánh. Vui lòng cung cấp danh sách IDs (tối thiểu 2, không giới hạn tối đa)' 
      });
    }

    // Find all variants
    const variants = await VehicleVariant.find({ _id: { $in: idList } })
      .populate('model')
      .sort({ 'model.name': 1, trim: 1 });
    
    if (variants.length !== idList.length) {
      const foundIds = variants.map(v => String(v._id));
      const missingIds = idList.filter(id => !foundIds.includes(id));
      return res.status(404).json({ 
        message: `Không tìm thấy một hoặc nhiều xe: ${missingIds.join(', ')}` 
      });
    }

    // Prepare comparison summary data
    const validRanges = variants.map(v => v.range).filter(r => r != null && r > 0);
    const validMotorPowers = variants.map(v => v.motorPower).filter(p => p != null && p > 0);
    
    // Structure the comparison data
    const comparisonData = {
      count: variants.length,
      vehicles: variants.map(variant => ({
        _id: variant._id,
        model: {
          _id: variant.model._id,
          name: variant.model.name,
          brand: variant.model.brand,
          segment: variant.model.segment,
          description: variant.model.description
        },
        trim: variant.trim,
        battery: variant.battery,
        range: variant.range,
        motorPower: variant.motorPower,
        features: variant.features || [],
        msrp: variant.msrp,
        images: variant.images || [],
        active: variant.active,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt
      })),
      // Summary comparison for easy viewing
      comparison: {
        models: variants.map(v => v.model.name),
        trims: variants.map(v => v.trim),
        priceRange: {
          min: Math.min(...variants.map(v => v.msrp || 0)),
          max: Math.max(...variants.map(v => v.msrp || 0))
        },
        rangeRange: validRanges.length > 0 ? {
          min: Math.min(...validRanges),
          max: Math.max(...validRanges)
        } : null,
        motorPowerRange: validMotorPowers.length > 0 ? {
          min: Math.min(...validMotorPowers),
          max: Math.max(...validMotorPowers)
        } : null
      }
    };

    res.status(200).json({ 
      success: true, 
      message: `So sánh ${variants.length} xe thành công`,
      data: comparisonData 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};