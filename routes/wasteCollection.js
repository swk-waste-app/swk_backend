import { Router } from 'express';
import { schedulePickup, getPickupHistory, updatePickupStatus, getSchedule, countSchedules, deleteSchedule} from '../controllers/wasteCollection.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { hasPermission } from '../middlewares/auth.js'; 

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', isAuthenticated, schedulePickup);
wasteCollectionRouter.get('/history', isAuthenticated, hasPermission('get_history'), getPickupHistory);
wasteCollectionRouter.get('/schedule/:id', isAuthenticated, hasPermission('get_schedule'), getSchedule);
wasteCollectionRouter.patch('/:id/status', isAuthenticated, hasPermission('update_pickup'), updatePickupStatus);
wasteCollectionRouter.get('/schedules/count', countSchedules)
wasteCollectionRouter.delete('/delete', isAuthenticated, hasPermission('delete_schedule'), deleteSchedule)

export default wasteCollectionRouter; 
