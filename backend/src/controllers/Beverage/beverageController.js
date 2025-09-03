import Beverage from "../../models/Beverage/Beverage.js";

export const createBeverage = async (req, res) => {
    try {
        const bev = await  Beverage.find( {beverageName: new RegExp(`^${req.body.beverageName}$`, "i") })
        if(bev){
            res.status(400).json({error: 'Already exist beverage'});
        }
        const beverage = await Beverage.create(req.body);
        res.status(201).json(beverage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateBeverage = async (req, res) => {
    try {
        const beverage = await Beverage.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(beverage);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteBeverage = async (req, res) => {
    try {
        const beverage = await Beverage.findByIdAndUpdate(
            req.params.id,
            { isVisible: false },
            { new: true }
        );
        res.json({ message: "Beverage soft deleted", beverage });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export class beverageController {
}