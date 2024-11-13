// rbac.js - Role-Based Access Control for Advertisement App
export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'view_products',
            'contact_vendor',
            'schedule_pickup',       // New: Allow users to schedule waste pickups
            'view_pickup_history',   // New: Allow users to view their waste pickup history
            'access_education',      // New: Access educational content, blogs, news
            'send_message_to_admin'  // New: Send messages or contact the admin
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
            'manage_waste_pickups',  // New: Manage their own waste pickups (e.g., update status)
            'view_pickup_history',   // New: Vendors can also view pickup history if needed
            'access_education',      // New: Access educational content
            'send_message_to_admin'  // New: Send messages or contact the admin
        ]
    },
    {
        role: 'admin',
        actions: [
            'get_all_profiles',       // New: Access all user and vendor profiles
            'manage_all_products',    // New: Add, update, or delete any product
            'manage_users',           // New: Manage user accounts (e.g., suspend, delete)
            'view_all_pickups',       // New: View all waste pickups
            'update_pickup_status',   // New: Update the status of any waste pickup
            'manage_education',       // New: Manage educational content (add, update, delete)
            'receive_messages'        // New: Receive and respond to messages from users/vendors
        ]
    }
];
