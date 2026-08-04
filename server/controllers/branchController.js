const Branch = require("../models/Branch");

// Create Branch
exports.createBranch = async (req, res) => {
    try {
        const { branchName, address, phone } = req.body;

        const existing = await Branch.findOne({ branchName });
        if (existing)
            return res.status(400).json({ message: "Branch name already exists" });

        const branch = await Branch.create({ branchName, address, phone });
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Branches
exports.getBranches = async (req, res) => {
    try {
        const branches = await Branch.find();
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Branch
exports.updateBranch = async (req, res) => {
    try {
        const updated = await Branch.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated)
            return res.status(404).json({ message: "Branch not found" });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Branch
exports.deleteBranch = async (req, res) => {
    try {
        await Branch.findByIdAndDelete(req.params.id);
        res.json({ message: "Branch deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};