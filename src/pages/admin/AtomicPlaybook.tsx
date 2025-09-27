import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function AtomicPlaybook() {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="outline" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Link>
            </Button>
            <div className="h-6 border-l border-border" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Atomic Playbook</h1>
              <p className="text-sm text-muted-foreground">Company Operations Intelligence System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Atomic Playbook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Welcome to Atomic Playbook</h2>
              <p className="text-muted-foreground">
                Your company operations intelligence system is being built.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}