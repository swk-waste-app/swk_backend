import { Router } from 'express';
import { schedulePickup, getPickupHistory, getPickupSummary, updatePickupStatus, getSchedule, countSchedules, deleteSchedule, updatePickup, cancelPickup } from '../controllers/wasteCollection.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';

const wasteCollectionRouter = Router();

wasteCollectionRouter.post('/schedule', isAuthenticated, schedulePickup);

// Fixed paths come before any path with an :id segment so they are never
// mistaken for an id.
wasteCollectionRouter.get('/history', isAuthenticated, hasPermission('view_all_pickups'), getPickupHistory);
wasteCollectionRouter.get('/summary', isAuthenticated, hasPermission('view_all_pickups'), getPickupSummary);
wasteCollectionRouter.get('/schedules/count', isAuthenticated, hasPermission('view_all_pickups'), countSchedules);

wasteCollectionRouter.get('/schedule/:id', isAuthenticated, hasPermission('get_schedule'), getSchedule);
wasteCollectionRouter.patch('/:id/status', isAuthenticated, hasPermission('update_pickup_status'), updatePickupStatus);
wasteCollectionRouter.patch('/schedules/:id/cancel', isAuthenticated, hasPermission('update_pickup'), cancelPickup);
wasteCollectionRouter.patch('/schedules/:id', isAuthenticated, hasPermission('update_pickup'), updatePickup);
wasteCollectionRouter.delete('/schedules/:id', isAuthenticated, hasPermission('delete_schedule'), deleteSchedule);

export default wasteCollectionRouter;
