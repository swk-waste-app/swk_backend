// rbac.js - Role-Based Access Control for Advertisement App
export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'view_products',
            'contact_vendor',
            'schedule_pickup',       
            'view_pickup_history',       
            'send_message_to_admin' 
        ]
    },
    {
        role: 'vendor',
        actions: [
            'get_profile',
            'update_profile',
            'add_products',
            'update_products',
            'delete_products',
            'view_products',
            'manage_own_products',
            'manage_waste_pickups', 
            'view_pickup_history',      
            'send_message_to_admin' 
        ]
    },
    {
        role: 'admin',
        actions: [
            'get_all_profiles',       
            'manage_all_products',    
            'manage_users',           
            'view_all_pickups',
            'view_history' ,      
            'update_pickup_status',         
            'receive_messages'        
        ]
    }
];
