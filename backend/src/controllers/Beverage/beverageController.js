import Beverage from "../../models/Beverage/beverage.js";

export const createBeverage = async (req, res) => {
    try {
        const { beverageName, category } = req.body;

        const bev = await Beverage.findOne({
            beverageName: new RegExp(`^${beverageName}$`, "i")
        });

        if (bev) {
            if (bev.category === category) {
                return res.status(400).json({ error: 'Beverage with this name and category already exists' });
            }
        }

        const beverage = await Beverage.create(req.body);
        return res.status(201).json(beverage);

    } catch (err) {
        return res.status(400).json({ error: err.message });
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