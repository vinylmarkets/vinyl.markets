import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { useForensicData, SearchResult } from "@/hooks/useForensicData";

export default function SemanticSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const { searchDocuments, evidence } = useForensicData();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const searchResults = await searchDocuments(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

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
                <h1 className="text-2xl font-bold">Semantic Search</h1>
                <p className="text-sm text-muted-foreground">
                  Vector-based search across all collected intelligence
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search Intelligence Database</CardTitle>
                  <CardDescription>
                    Use natural language to search across all documents, filings, and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., 'What evidence supports NOL preservation timing?'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      disabled={searching}
                    />
                    <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                      {searching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>

                  {results.length > 0 && (
                    <div className="pt-4">
                      <div className="text-sm text-muted-foreground mb-3">
                        Found {results.length} relevant results
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="space-y-4">
                  {results.map((result, idx) => (
                    <Card key={idx} className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {result.date}
                              </span>
                            </div>
                            <CardTitle className="text-lg">{result.title}</CardTitle>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{result.relevance}%</div>
                            <div className="text-xs text-muted-foreground">Relevance</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{result.excerpt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {searching && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Searching through documents and analysis...
                    </p>
                  </CardContent>
                </Card>
              )}

              {!searching && results.length === 0 && searchQuery && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Enter a search query to find relevant documents
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Searches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['NOL', 'Section 382', 'DK-Butterfly', 'timeline'].map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch();
                      }}
                      className="w-full text-left p-2 rounded-lg border border-border hover:border-primary/50 transition-colors text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Natural Language:</strong> Ask questions in plain English
                  </div>
                  <div>
                    <strong className="text-foreground">Specific Terms:</strong> Use technical terms for precise results
                  </div>
                  <div>
                    <strong className="text-foreground">Concepts:</strong> Search for concepts, not just keywords
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Database Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Evidence Categories:</span>
                    <span className="font-semibold">{evidence.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Findings:</span>
                    <span className="font-semibold">
                      {evidence.reduce((sum, e) => sum + e.items.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Source:</span>
                    <span className="font-semibold">Live</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TraderProtection>
  );
}
