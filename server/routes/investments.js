const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');

// Get all investments
router.get('/', auth, async (req, res) => {
    try {
        const investments = await Investment.find({ user: req.user.id });
        res.json(investments);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching investments' });
    }
});

// Create investment
router.post('/', auth, async (req, res) => {
    try {
        const { name, type, amount, purchaseDate, notes } = req.body;
        const investment = new Investment({
            user: req.user.id,
            name,
            type,
            amount,
            purchaseDate,
            notes,
            currentValue: amount, // Initial value same as purchase amount
            returnRate: 0 // Initial return rate
        });
        await investment.save();
        res.status(201).json(investment);
    } catch (err) {
        res.status(400).json({ message: 'Error creating investment' });
    }
});

// Update investment
router.patch('/:id', auth, async (req, res) => {
    try {
        const investment = await Investment.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $set: req.body },
            { new: true }
        );
        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }
        res.json(investment);
    } catch (err) {
        res.status(400).json({ message: 'Error updating investment' });
    }
});

// Delete investment
router.delete('/:id', auth, async (req, res) => {
    try {
        const investment = await Investment.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }
        res.json({ message: 'Investment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting investment' });
    }
});

module.exports = router;
