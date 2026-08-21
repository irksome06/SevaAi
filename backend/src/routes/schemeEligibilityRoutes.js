const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/schemeEligibilityController');
router.use(protect); router.get('/', c.listSchemes); router.get('/profile', c.getProfile); router.put('/profile', c.saveProfile); router.get('/recommendations', c.recommend); router.post('/:schemeId/start', c.startApplication);
module.exports = router;
