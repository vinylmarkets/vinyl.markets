import { useState } from 'react';
import { useAuditLogs, useAuditLogStats } from '@/hooks/useAuditLogs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: logs, isLoading } = useAuditLogs({
    startDate,
    endDate,
    action: searchQuery,
    resourceType: resourceTypeFilter !== 'all' ? resourceTypeFilter : undefined
  });

  const { data: stats, isLoading: statsLoading } = useAuditLogStats();

  const exportLogs = () => {
    if (!logs) return;
    
    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Resource Type', 'Resource ID'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toISOString(),
        log.admin_email || 'Unknown',
        log.action,
        log.resource_type,
        log.resource_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Audit Logs</h1>
          <p className="text-gray-400">Complete history of admin actions for compliance</p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportLogs}
          className="border-[#2A2A2A] text-white hover:bg-[#0A0A0A]"
        >
          <Download size={16} className="mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <p className="text-sm text-gray-400 mb-2">Actions (24h)</p>
          {statsLoading ? (
            <Skeleton className="h-10 w-20 bg-[#0A0A0A]" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {stats?.totalActions24h || 0}
            </p>
          )}
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <p className="text-sm text-gray-400 mb-2">Active Admins (7d)</p>
          {statsLoading ? (
            <Skeleton className="h-10 w-20 bg-[#0A0A0A]" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {stats?.activeAdmins || 0}
            </p>
          )}
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
          <p className="text-sm text-gray-400 mb-2">Total Logged</p>
          {isLoading ? (
            <Skeleton className="h-10 w-20 bg-[#0A0A0A]" />
          ) : (
            <p className="text-3xl font-bold text-white">
              {logs?.length || 0}
            </p>
          )}
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action..."
              className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
            />
          </div>

          {/* Resource Type Filter */}
          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="amp">Amp</SelectItem>
              <SelectItem value="content">Content</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Pickers */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[200px] justify-start text-left bg-[#0A0A0A] border-[#2A2A2A] text-white"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'MMM dd, yyyy') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#2A2A2A]">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[200px] justify-start text-left bg-[#0A0A0A] border-[#2A2A2A] text-white"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'MMM dd, yyyy') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#2A2A2A]">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {(startDate || endDate || searchQuery || resourceTypeFilter !== 'all') && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
                setSearchQuery('');
                setResourceTypeFilter('all');
              }}
              className="text-gray-400"
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5,6,7,8].map(i => (
              <Skeleton key={i} className="h-16 bg-[#0A0A0A]" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-gray-400">Timestamp</TableHead>
                <TableHead className="text-gray-400">Admin</TableHead>
                <TableHead className="text-gray-400">Action</TableHead>
                <TableHead className="text-gray-400">Resource</TableHead>
                <TableHead className="text-gray-400">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow 
                  key={log.id} 
                  className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition-colors"
                >
                  <TableCell className="text-gray-300 font-mono text-xs">
                    {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-white">
                        {log.admin_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.admin_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-white capitalize">{log.resource_type}</p>
                      {log.resource_id && (
                        <p className="text-xs text-gray-500 font-mono">
                          {log.resource_id.slice(0, 8)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.changes && (
                      <LogChanges changes={log.changes} />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {logs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-gray-500">No audit logs found</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Try adjusting your filters
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Compliance Note */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4">
        <p className="text-xs text-gray-500">
          <strong className="text-gray-400">Compliance:</strong> All administrator actions are logged automatically. 
          Logs are retained for 7 years to comply with financial regulations. 
          Export logs regularly for backup and external audit purposes.
        </p>
      </Card>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const variants: Record<string, string> = {
    'login': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'create': 'bg-green-500/10 text-green-400 border-green-500/20',
    'update': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'delete': 'bg-red-500/10 text-red-400 border-red-500/20',
    'suspend': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const getVariant = (action: string) => {
    const key = action.split('.')[1] || action.split('.')[0];
    return variants[key] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-mono text-xs border",
        getVariant(action)
      )}
    >
      {action}
    </Badge>
  );
}

function LogChanges({ changes }: { changes: any }) {
  const changesObj = typeof changes === 'string' ? JSON.parse(changes) : changes;
  const entries = Object.entries(changesObj).slice(0, 2);

  if (entries.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs text-gray-400 hover:text-white"
        >
          View changes
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1A1A1A] border-[#2A2A2A]">
        <div className="space-y-2">
          <h4 className="font-semibold text-white text-sm">Changes Made</h4>
          {entries.map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="text-gray-400">{key}:</span>{' '}
              <span className="text-white font-mono">
                {JSON.stringify(value)}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
