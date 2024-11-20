import { Router } from 'express';
import { schedulePickup, getPickupHistory, updatePickupStatus, getSchedule, countSchedules, deleteSchedule, updatePickup} from '../controllers/wasteCollection.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { hasPermission } from '../middlewares/auth.js'; 

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', isAuthenticated, schedulePickup);
wasteCollectionRouter.get('/history', isAuthenticated, hasPermission('get_history'), getPickupHistory);
wasteCollectionRouter.get('/schedule/:id', isAuthenticated, hasPermission('get_schedule'), getSchedule);
wasteCollectionRouter.patch('/:id/status', isAuthenticated, hasPermission('update_pickup_status'), updatePickupStatus);
wasteCollectionRouter.patch('/schedules/:id', isAuthenticated, hasPermission('update_pickup'), updatePickup )
wasteCollectionRouter.get('/schedules/count', countSchedules)
wasteCollectionRouter.delete('/schedules/:id', isAuthenticated, hasPermission('delete_schedule'), deleteSchedule)

export default wasteCollectionRouter; 
