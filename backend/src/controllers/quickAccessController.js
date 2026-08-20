const QuickAccessEntry = require('../models/QuickAccessEntry');
const { getQuickAccessEntries, getQuickAccessFacets, ensureQuickAccessSeedData } = require('../services/quickAccessService');

const listEntries = async (req, res, next) => {
  try { res.json({ success: true, entries: await getQuickAccessEntries(req.query) }); } catch (error) { next(error); }
};
const getFacets = async (req, res, next) => {
  try { res.json({ success: true, filters: await getQuickAccessFacets() }); } catch (error) { next(error); }
};
const getEntry = async (req, res, next) => {
  try {
    await ensureQuickAccessSeedData();
    const entry = await QuickAccessEntry.findOne({ _id: req.params.id, isActive: true });
    if (!entry) return res.status(404).json({ success: false, message: 'Quick Access entry not found.' });
    res.json({ success: true, entry });
  } catch (error) { next(error); }
};
module.exports = { listEntries, getFacets, getEntry };
