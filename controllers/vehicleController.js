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