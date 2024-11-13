import { Router } from 'express';
import { schedulePickup, getPickupHistory, updatePickupStatus } from '../controllers/wasteCollection.js';
import { verifyToken } from '../middlewares/auth.js'; 

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', verifyToken, schedulePickup);
wasteCollectionRouter.get('/history', verifyToken, getPickupHistory);
wasteCollectionRouter.patch('/:id/status', verifyToken, updatePickupStatus);

export default wasteCollectionRouter; 
