import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const name = searchParams.get('name');

        if (token && role) {
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'admin') {
                navigate('/customerDashboard/adminoverview');
            } else if (role === 'vendor') {
                navigate('/customerDashboard/vendoroverview');
            } else {
                navigate('/customerDashboard/overview');
            }
        } else {
            navigate('/signin?error=google_failed');
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Signing you in with Google...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;