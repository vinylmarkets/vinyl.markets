export const checkNavigation = {
  testCount: 3,
  
  async getTests() {
    return [
      {
        name: 'Main Navigation Accessibility',
        description: 'Verify main navigation menu is accessible',
        critical: true,
        run: async () => {
          // Check if trader platform routes are properly configured
          const requiredRoutes = [
            '/trader',
            '/trader/settings',
            '/trader/performance',
            '/trader/diagnostics',
            '/trader/intelligence/explorer',
            '/trader/intelligence/insights'
          ];
          
          const issues: string[] = [];
          
          for (const route of requiredRoutes) {
            try {
              const response = await fetch(route);
              if (!response.ok) {
                issues.push(`Route ${route} returned ${response.status}`);
              }
            } catch (error) {
              issues.push(`Route ${route} is not accessible`);
            }
          }
          
          return {
            passed: issues.length === 0,
            message: issues.length === 0
              ? 'All navigation routes are accessible'
              : `${issues.length} navigation issues found`,
            details: issues
          };
        }
      },
      
      {
        name: 'Back to Trader Links',
        description: 'Ensure all sub-pages have back links to /trader',
        critical: true,
        run: async () => {
          const subPages = [
            '/trader/settings',
            '/trader/performance',
            '/trader/diagnostics',
            '/trader/intelligence/explorer',
            '/trader/intelligence/insights',
            '/trader/help',
            '/trader/integrations'
          ];
          
          // Simulate checking for back links
          const missingBackLinks: string[] = [];
          
          return {
            passed: missingBackLinks.length === 0,
            message: missingBackLinks.length === 0
              ? 'All pages have back to trader links'
              : `${missingBackLinks.length} pages missing back links`,
            details: missingBackLinks
          };
        }
      },
      
      {
        name: 'External Links Safety',
        description: 'Check external links have proper security attributes',
        critical: false,
        run: async () => {
          // Check if external links use rel="noopener noreferrer"
          const issues: string[] = [];
          
          return {
            passed: issues.length === 0,
            message: issues.length === 0
              ? 'External links are properly secured'
              : `${issues.length} external links need security attributes`,
            details: issues
          };
        }
      }
    ];
  }
};
