import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Clock, Settings, PlayCircle, PauseCircle, Calendar, ArrowLeft } from 'lucide-react'

interface CronJob {
  id: string
  name: string
  description: string
  schedule: string
  function_name: string
  last_run: string | null
  next_run: string | null
  status: 'active' | 'paused' | 'error'
  created_at: string
}

export default function CronJobsManagement() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [editingJob, setEditingJob] = useState<CronJob | null>(null)
  const [newSchedule, setNewSchedule] = useState('')
  const { toast } = useToast()

  // Mock data for demonstration - in real implementation, this would come from database
  const mockCronJobs: CronJob[] = [
    {
      id: '1',
      name: 'Morning Market Analysis',
      description: 'Generates market analysis and predictions before market open',
      schedule: '0 8 * * 1-5', // 8:00 AM weekdays
      function_name: 'morning-market-analysis',
      last_run: '2025-09-27T08:00:00Z',
      next_run: '2025-09-28T08:00:00Z',
      status: 'active',
      created_at: '2025-09-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Post Market Analysis',
      description: 'Validates predictions and updates performance metrics after market close',
      schedule: '0 17 * * 1-5', // 5:00 PM weekdays
      function_name: 'post-market-analysis',
      last_run: '2025-09-26T17:00:00Z',
      next_run: '2025-09-27T17:00:00Z',
      status: 'active',
      created_at: '2025-09-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Options Analysis Pipeline',
      description: 'Analyzes options flow and generates opportunities',
      schedule: '0 9,15 * * 1-5', // 9:00 AM and 3:00 PM weekdays
      function_name: 'options-analysis-pipeline',
      last_run: '2025-09-26T15:00:00Z',
      next_run: '2025-09-27T09:00:00Z',
      status: 'active',
      created_at: '2025-09-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Knowledge Graph Daily Update',
      description: 'Updates pattern accuracy and stock correlations in knowledge graph',
      schedule: '0 6 * * 1-5', // 6:00 AM weekdays
      function_name: 'kg-daily-update',
      last_run: '2025-09-27T06:00:00Z',
      next_run: '2025-09-28T06:00:00Z',
      status: 'active',
      created_at: '2025-09-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Briefing Content Generation',
      description: 'Generates daily intelligence briefings for users',
      schedule: '0 7 * * 1-5', // 7:00 AM weekdays
      function_name: 'generate-briefing-content',
      last_run: '2025-09-27T07:00:00Z',
      next_run: '2025-09-28T07:00:00Z',
      status: 'active',
      created_at: '2025-09-01T00:00:00Z'
    }
  ]

  useEffect(() => {
    loadCronJobs()
  }, [])

  const loadCronJobs = async () => {
    try {
      // In a real implementation, you would query your cron jobs table
      // For now, using mock data
      setCronJobs(mockCronJobs)
    } catch (error) {
      toast({
        title: "Error loading cron jobs",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCronSchedule = async (jobId: string, newSchedule: string) => {
    try {
      // In a real implementation, you would update the database and cron configuration
      setCronJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, schedule: newSchedule } : job
      ))
      
      toast({
        title: "Schedule Updated",
        description: "Cron job schedule has been updated successfully"
      })
      
      setEditingJob(null)
      setNewSchedule('')
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    }
  }

  const toggleJobStatus = async (jobId: string) => {
    try {
      setCronJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: job.status === 'active' ? 'paused' : 'active' } 
          : job
      ))
      
      toast({
        title: "Status Updated",
        description: "Cron job status has been updated"
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    }
  }

  const runJobManually = async (jobId: string, functionName: string) => {
    try {
      const { error } = await supabase.functions.invoke(functionName)
      
      if (error) throw error
      
      toast({
        title: "Job Executed",
        description: "Cron job has been executed manually"
      })
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const parseCronSchedule = (schedule: string) => {
    // Simple cron parser for display purposes
    const parts = schedule.split(' ')
    if (parts.length === 5) {
      const [minute, hour, day, month, dayOfWeek] = parts
      if (dayOfWeek === '1-5') {
        return `${hour}:${minute.padStart(2, '0')} on weekdays`
      }
      return `${hour}:${minute.padStart(2, '0')} daily`
    }
    return schedule
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      error: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cron Jobs Management</h1>
          <p className="text-muted-foreground">
            Manage automated tasks and their schedules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {cronJobs.filter(j => j.status === 'active').length} active jobs
            </span>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cronJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cronJobs.filter(j => j.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Jobs</CardTitle>
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cronJobs.filter(j => j.status === 'paused').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cronJobs.filter(j => j.status === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cronJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-muted-foreground">{job.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {job.function_name}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-mono text-xs">{job.schedule}</div>
                      <div className="text-xs text-muted-foreground">
                        {parseCronSchedule(job.schedule)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTime(job.last_run)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTime(job.next_run)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleJobStatus(job.id)}
                      >
                        {job.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runJobManually(job.id, job.function_name)}
                      >
                        Run Now
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingJob(job)
                              setNewSchedule(job.schedule)
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Cron Schedule</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="schedule">Cron Schedule</Label>
                              <Input
                                id="schedule"
                                value={newSchedule}
                                onChange={(e) => setNewSchedule(e.target.value)}
                                placeholder="0 8 * * 1-5"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Format: minute hour day month day-of-week
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingJob(null)
                                  setNewSchedule('')
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => editingJob && updateCronSchedule(editingJob.id, newSchedule)}
                              >
                                Update Schedule
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}