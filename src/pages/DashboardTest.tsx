import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardTest() {
  console.log('DashboardTest: Component is rendering!');
  
  const { user, loading } = useAuth();
  
  console.log('DashboardTest: Auth state:', { user: !!user, loading });
  
  return (
    <div className="min-h-screen bg-red-100 p-8">
      <h1 className="text-4xl font-bold text-black">Dashboard Test Page</h1>
      <div className="mt-4 space-y-2 text-black">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
        <p>Environment URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
      
      {loading && (
        <div className="mt-8 p-4 bg-yellow-200 border border-yellow-400 rounded">
          <p className="text-black">Loading state is active...</p>
        </div>
      )}
      
      {!loading && !user && (
        <div className="mt-8 p-4 bg-red-200 border border-red-400 rounded">
          <p className="text-black">No user found after loading!</p>
        </div>
      )}
      
      {!loading && user && (
        <div className="mt-8 p-4 bg-green-200 border border-green-400 rounded">
          <p className="text-black">User authenticated successfully!</p>
          <p className="text-black">Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}