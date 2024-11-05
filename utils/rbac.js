// rbac.js - Role-Based Access Control for Advertisement App
export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'view_adverts',        
            'contact_vendor'       
        ]
    },
    {
        role: 'vendor',
        actions: [
            'get_profile',
            'update_profile',
            'add_advert',           
            'update_advert',        
            'delete_advert',        
            'view_adverts',         
            'manage_own_adverts'    
        ]
    }
]
