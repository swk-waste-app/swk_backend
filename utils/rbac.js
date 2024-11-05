// rbac.js - Role-Based Access Control for Advertisement App
export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'view_product',        
            'contact_vendor'       
        ]
    },
    {
        role: 'vendor',
        actions: [
            'get_profile',
            'update_profile',
            'add_product',           
            'update_product',        
            'delete_product',        
            'view_productss',         
            'manage_own_products'    
        ]
    }
]
