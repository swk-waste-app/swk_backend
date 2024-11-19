import { Router } from 'express';
import { schedulePickup, getPickupHistory, updatePickupStatus, getSchedule, countSchedules, deleteSchedule} from '../controllers/wasteCollection.js';
import { isAuthenticated } from '../middlewares/auth.js'; 

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', isAuthenticated, schedulePickup);
wasteCollectionRouter.get('/history', isAuthenticated, getPickupHistory);
wasteCollectionRouter.get('/schedule/:id', isAuthenticated, getSchedule);
wasteCollectionRouter.patch('/:id/status', isAuthenticated, updatePickupStatus);
wasteCollectionRouter.get('/schedules/count', countSchedules)
wasteCollectionRouter.delete('/delete', isAuthenticated, deleteSchedule)

export default wasteCollectionRouter; 
