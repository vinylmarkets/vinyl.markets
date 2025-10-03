import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useAdminUsers';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Download, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Users() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: users, isLoading } = useUsers({ 
    search: debouncedSearch 
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const exportUsers = () => {
    if (!users) return;
    
    const csv = [
      ['Email', 'Name', 'Joined', 'Active Amps', 'Paper Balance'].join(','),
      ...users.map(u => [
        u.email,
        u.full_name || '',
        new Date(u.created_at).toLocaleDateString(),
        u.ampCount || 0,
        u.paperBalance || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Users</h1>
          <p className="text-gray-400">Manage platform users and traders</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus size={16} className="mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Export */}
          <Button 
            variant="outline" 
            onClick={exportUsers}
            className="border-[#2A2A2A] text-white hover:bg-[#0A0A0A]"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => (
              <Skeleton key={i} className="h-16 bg-[#0A0A0A]" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-gray-400">User</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Active Amps</TableHead>
                <TableHead className="text-gray-400">Paper Balance</TableHead>
                <TableHead className="text-gray-400">Joined</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.full_name || 'No name'}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.ampCount > 0 ? "default" : "secondary"}>
                      {user.ampCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    ${(user.paperBalance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/users/${user.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye size={16} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-gray-500">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {users && users.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {users.length} users
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="border-[#2A2A2A] text-gray-500">
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled className="border-[#2A2A2A] text-gray-500">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
