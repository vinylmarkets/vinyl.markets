import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Search, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: string;
  severity: string;
  algorithm_name: string;
  message: string;
  details: any;
  stack_trace?: string;
  resolved: boolean;
}

export function ErrorLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string[]>(['error', 'warning', 'info']);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, severityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('diagnostics', {
        body: { action: 'get_logs', limit: 100 }
      });

      if (error) throw error;
      setLogs(data.logs || []);
    } catch (error: any) {
      toast({
        title: "Error fetching logs",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Apply severity filter
    filtered = filtered.filter(log => severityFilter.includes(log.severity));

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.algorithm_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-destructive/10 text-destructive';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'info':
        return 'bg-blue-500/10 text-blue-500';
      case 'debug':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Severity', 'Algorithm', 'Message'],
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.severity,
        log.algorithm_name || 'N/A',
        log.message
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {['error', 'warning', 'info', 'debug'].map(severity => (
            <label key={severity} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={severityFilter.includes(severity)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSeverityFilter([...severityFilter, severity]);
                  } else {
                    setSeverityFilter(severityFilter.filter(s => s !== severity));
                  }
                }}
              />
              <span className="text-sm capitalize">{severity}</span>
            </label>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div>Total: <span className="font-semibold">{filteredLogs.length}</span></div>
        <div>Errors: <span className="font-semibold text-destructive">
          {filteredLogs.filter(l => l.severity === 'error').length}
        </span></div>
        <div>Warnings: <span className="font-semibold text-warning">
          {filteredLogs.filter(l => l.severity === 'warning').length}
        </span></div>
      </div>

      {/* Logs Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Algorithm</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <>
                  <TableRow key={log.id} className="cursor-pointer" onClick={() => toggleRow(log.id)}>
                    <TableCell>
                      {expandedRows.has(log.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), 'MM/dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                    </TableCell>
                    <TableCell>{log.algorithm_name || '-'}</TableCell>
                    <TableCell className="max-w-md truncate">{log.message}</TableCell>
                  </TableRow>
                  {expandedRows.has(log.id) && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/50">
                        <div className="space-y-2 p-4">
                          <div><strong>Full Message:</strong> {log.message}</div>
                          {log.details && (
                            <div>
                              <strong>Details:</strong>
                              <pre className="text-xs mt-1 p-2 bg-background rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.stack_trace && (
                            <div>
                              <strong>Stack Trace:</strong>
                              <pre className="text-xs mt-1 p-2 bg-background rounded overflow-x-auto">
                                {log.stack_trace}
                              </pre>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}