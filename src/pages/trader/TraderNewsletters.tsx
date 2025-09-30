import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Mail,
  Sparkles,
  Save,
  Send,
  Loader2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Eye,
} from "lucide-react";

const TraderNewsletters = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for AI generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-newsletter-content", {
        body: { prompt: aiPrompt },
      });

      if (error) throw error;

      if (data?.title && data?.content) {
        setTitle(data.title);
        setContent(data.content);
        toast({
          title: "Newsletter Generated",
          description: "AI has generated your newsletter content",
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate newsletter",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("briefings").insert({
        title,
        academic_content: content,
        plain_speak_content: content,
        executive_summary: content.substring(0, 200) + "...",
        category: "manual",
        publication_date: new Date().toISOString(),
        published: false,
      });

      if (error) throw error;

      toast({
        title: "Newsletter Saved",
        description: "Your newsletter has been saved as a draft",
      });
      
      // Clear form
      setTitle("");
      setContent("");
      setAiPrompt("");
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save newsletter",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const insertFormatting = (tag: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = "";
    switch (tag) {
      case "bold":
        newText = `**${selectedText}**`;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        break;
      case "list":
        newText = `\n- ${selectedText}`;
        break;
      case "link":
        newText = `[${selectedText}](url)`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
  };

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/trader" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Newsletter Editor</h1>
            </div>
          </div>

          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
            </TabsList>

            {/* Manual Write Tab */}
            <TabsContent value="write" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Write Newsletter</CardTitle>
                  <CardDescription>Create a custom newsletter manually</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("bold")}
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("italic")}
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("list")}
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting("link")}
                      title="Insert Link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <div className="ml-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreview(!preview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {preview ? "Edit" : "Preview"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Newsletter Title</label>
                    <Input
                      placeholder="Enter newsletter title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    {preview ? (
                      <div className="border rounded-md p-4 min-h-[400px] prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ 
                          __html: content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                            .replace(/\n/g, '<br/>')
                        }} />
                      </div>
                    ) : (
                      <Textarea
                        name="content"
                        placeholder="Write your newsletter content here... Use markdown formatting (** for bold, * for italic, etc.)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving || !title || !content}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Generate Tab */}
            <TabsContent value="ai-generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Newsletter Generator
                  </CardTitle>
                  <CardDescription>
                    Describe what you want the newsletter to be about, and AI will generate it in
                    the AtomicMarket voice
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Prompt
                      <Badge variant="secondary" className="ml-2">
                        AI Powered
                      </Badge>
                    </label>
                    <Textarea
                      placeholder='Example: "Write a newsletter article based on the earnings of GME that came out after hours, focusing on the impact to retail traders and options market"'
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button onClick={handleAIGenerate} disabled={isGenerating || !aiPrompt.trim()}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Newsletter
                      </>
                    )}
                  </Button>

                  {(title || content) && (
                    <>
                      <div className="border-t pt-4 mt-6">
                        <h3 className="text-sm font-semibold mb-3">Generated Newsletter</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Title</label>
                            <Input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="text-lg"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Content</label>
                            <Textarea
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              className="min-h-[400px] font-mono text-sm"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={isSaving}>
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Draft
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TraderProtection>
  );
};

export default TraderNewsletters;
