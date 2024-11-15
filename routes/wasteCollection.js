import { Router } from 'express';
import { schedulePickup, getPickupHistory, updatePickupStatus } from '../controllers/wasteCollection.js';
import { isAuthenticated } from '../middlewares/auth.js'; 

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', isAuthenticated, schedulePickup);
wasteCollectionRouter.get('/history', isAuthenticated, getPickupHistory);
wasteCollectionRouter.get('/schedule/:id', getProduct)
wasteCollectionRouter.patch('/:id/status', isAuthenticated, updatePickupStatus);

export default wasteCollectionRouter; 
