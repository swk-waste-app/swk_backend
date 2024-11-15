import { Router } from 'express';
import { schedulePickup, getPickupHistory, updatePickupStatus, getSchedule, countSchedules} from '../controllers/wasteCollection.js';
import { isAuthenticated } from '../middlewares/auth.js'; 

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', isAuthenticated, schedulePickup);
wasteCollectionRouter.get('/history', getPickupHistory);
wasteCollectionRouter.get('/schedule/:id', getSchedule);
wasteCollectionRouter.patch('/:id/status', isAuthenticated, updatePickupStatus);
wasteCollectionRouter.get('/schedules/count', countSchedules)

export default wasteCollectionRouter; 
