import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { ForensicAIAssistant } from "@/components/forensics/ForensicAIAssistant";

export default function AIAssistant() {
  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/trader/forensics">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forensics
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Ask questions and brainstorm theories with AI
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <ForensicAIAssistant />
        </div>
      </div>
    </TraderProtection>
  );
}
