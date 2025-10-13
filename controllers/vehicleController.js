const Vehicle = require('../model/Vehicle'); 

exports.getVehicles = async (req, res) => { 
    try{ 
        const vehicles = await Vehicle.find(); 
        
        res.status(200).json({ 
            success: true, 
            count: vehicles.length, 
            data: vehicles 
        }) 
    } catch (error){ 
        res.status(500).json({message: error.message})
    }
}; 

exports.getVehicleById = async(req, res) => { 
    try{ 
        const {id} = req.params; 

        if(!id) return res.status(400).json({message: "Lack of information"});

        const vehicle = await Vehicle.findById(id); 
        
        if(!vehicle) return res.status(404).json({ message: "Vehicle not found"}); 
        
        res.status(200).json({ 
            success: true, 
            data: vehicle 
        }); 
    } catch (error) { 
        res.status(500).json({message: error.message}); 
    } 
}; 

exports.createVehicle = async (req, res) => { 
    try{ 
        const {model, version, color, price, features} = req.body; 
        
        if (!model || !price) return res.status(400).json({message: "Lack of information"}); 
        
        const newVehicle = { 
            model: model, 
            version: version, 
            color: color, 
            price: price, 
            features: features 
        } 
        
        const createVehicle = await Vehicle.create(newVehicle); 
        
        res.status(201).json({ 
            message: "Create new vehicle successfully", 
            data: createVehicle 
        }) 
    } catch (error){
         res.status(500).json({ message: error.message}); 
    }; 
} 
    
exports.updateVehicle = async (req, res) => { 
    try{ 
        const {id} = req.params; 

        const {model, version, color, price, features} = req.body; 
        
        if(!model || !price || !id) return res.status(400).json({ message: "Lack of information"}); 
        
        const vehicle = { 
            model: model, 
            version: version, 
            color: color, 
            price: price, 
            features: features
        } 
            
        const updateVehicle = await Vehicle.findByIdAndUpdate(id, vehicle, {new: true}); 
        
        if(!updateVehicle){ 
            return res.status(404).json({message: "Vehicle not found"}); 
        } 
        
        res.status(200).json({ 
            message: "Update vehicle successfully", 
            data: updateVehicle 
        }) 
    } catch (error){ 
        res.status(500).json({message: error.message}); 
    } 
}; 

exports.deleteVehicle = async (req, res) => { 
    try{ 
        const {id} = req.params;
         
        const vehicle = await Vehicle.findByIdAndDelete(id); 
        
        if(!vehicle){ 
            return res.status(404).json({ message: "Vehicle not found"}); 
        }; 
        
        res.status(200).json({ message: "Delete vehicle successfully" }) 
    } catch (error){ 
        res.status(500).json({message: error.message}); 
    } 
}