// rbac.js - Role-Based Access Control for SWK Waste App
export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'view_product',
            'view_products',
            'contact_vendor',
            'schedule_pickup',
            'update_pickup',      
            'get_history',       
            'send_message_to_admin',
            'delete_schedule' 
        ]
    },
    {
        role: 'vendor',
        actions: [
            'get_profile',
            'update_profile',
            'add_products',
            'view_product',
            'view_products',
            'update_product',
            'delete_product',
            'manage_own_products',
            'manage_waste_pickups', 
            'get_history',  

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
            'get_history' ,      
            'update_pickup_status',         
            'receive_messages', 
            'delete_schedule',
            'update_product',
            'delete_product',
            'get_profile',
            'update_profile',
            'add_products',
            'view_product',
            'view_products'
           
        ]
    }
];
