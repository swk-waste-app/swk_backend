// rbac.js - Role-Based Access Control for Advertisement App
export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'view_products',        
            'contact_vendor'       
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
            'manage_own_products'    
        ]
    }
]
