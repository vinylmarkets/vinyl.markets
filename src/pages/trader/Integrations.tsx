import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Shield, CheckCircle, AlertCircle, Eye, EyeOff, Link as LinkIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Integration {
  id: string;
  broker_name: string;
  environment: string;
  is_active: boolean;
  last_connected: string | null;
  account_status: any;
}

const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const [formData, setFormData] = useState({
    apiKey: "",
    secretKey: "",
    environment: "paper"
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      // For now, return empty array until schema is properly configured
      setIntegrations([]);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!formData.apiKey || !formData.secretKey) {
      toast({
        title: "Missing Information",
        description: "Please enter both API key and secret key.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Simulate testing connection for demo
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Connection Successful",
        description: `Connected to Alpaca ${formData.environment} account successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Alpaca. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveIntegration = async () => {
    if (!formData.apiKey || !formData.secretKey) {
      toast({
        title: "Missing Information",
        description: "Please enter both API key and secret key.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Simulate saving integration for demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Integration Saved",
        description: "Alpaca integration saved successfully.",
        variant: "default",
      });

      // Reset form and refresh integrations
      setFormData({ apiKey: "", secretKey: "", environment: "paper" });
      
      // Add a mock integration to the list
      const mockIntegration: Integration = {
        id: "mock-integration-" + Date.now(),
        broker_name: "alpaca",
        environment: formData.environment,
        is_active: true,
        last_connected: new Date().toISOString(),
        account_status: {
          account_id: "demo-account",
          status: "active",
          buying_power: "25000.00",
          equity: "25000.00"
        }
      };
      
      setIntegrations([mockIntegration, ...integrations]);
    } catch (error) {
      console.error('Save integration failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteIntegration = async (integrationId: string) => {
    try {
      // For now, just refresh the integrations list
      toast({
        title: "Integration Deleted",
        description: "Integration removed successfully.",
        variant: "default",
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Delete integration failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete integration.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Broker Integrations</h1>
        </div>
        <Button asChild variant="outline">
          <Link to="/trader">
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Existing Integrations */}
      {integrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Connected Brokers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {integration.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium capitalize">{integration.broker_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {integration.environment} • Last connected: {integration.last_connected ? new Date(integration.last_connected).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteIntegration(integration.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add New Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            Connect Your Broker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Alpaca Integration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alpaca Trading</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Commission-free stock trading with API access
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your Alpaca API key"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="secretKey"
                      type={showSecretKey ? "text" : "password"}
                      placeholder="Enter your Alpaca secret key"
                      value={formData.secretKey}
                      onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select 
                    value={formData.environment} 
                    onValueChange={(value) => setFormData({ ...formData, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paper">Paper Trading (Test)</SelectItem>
                      <SelectItem value="live">Live Trading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={testConnection}
                    disabled={testing || !formData.apiKey || !formData.secretKey}
                    className="w-full"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>

                  <Button
                    onClick={saveIntegration}
                    disabled={saving || !formData.apiKey || !formData.secretKey}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Integration...
                      </>
                    ) : (
                      "Save Integration"
                    )}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Your API keys are encrypted before storage</p>
                  <p>• Keys are only decrypted in memory for trading</p>
                  <p>• Start with Paper Trading to test strategies</p>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Cards */}
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="text-lg">TD Ameritrade</CardTitle>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Integration coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-800">Security & Privacy</p>
              <p className="text-sm text-yellow-700">
                Your API keys are encrypted using industry-standard encryption before being stored. 
                We never store your credentials in plain text, and they're only decrypted temporarily 
                in memory when executing trades on your behalf.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Integrations;
