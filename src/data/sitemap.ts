export interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  children?: NavigationItem[];
}

export const siteNavigation: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    description: "Stock Signal Analysis Dashboard"
  },
  {
    title: "Research",
    href: "/research",
    description: "Our methodology and research findings",
    children: [
      {
        title: "Methodology",
        href: "/research/methodology",
        description: "How our algorithms work and what they track"
      },
      {
        title: "Data Sources", 
        href: "/research/data-sources",
        description: "Where we get our data and how we validate it"
      },
      {
        title: "Algorithm Weights",
        href: "/research/algorithm-weights", 
        description: "Detailed breakdown of our scoring factors"
      },
      {
        title: "Backtesting Results",
        href: "/research/backtesting",
        description: "Historical performance and accuracy metrics"
      },
      {
        title: "Research Papers",
        href: "/research/papers",
        description: "Academic research and white papers"
      }
    ]
  },
  {
    title: "Documentation",
    href: "/docs",
    description: "Complete documentation and guides",
    children: [
      {
        title: "Getting Started",
        href: "/docs/getting-started",
        description: "How to use our platform effectively"
      },
      {
        title: "Signal Interpretation",
        href: "/docs/signals",
        description: "Understanding probability scores and confidence levels"
      },
      {
        title: "API Documentation",
        href: "/docs/api",
        description: "Developer API reference and examples"
      },
      {
        title: "Risk Disclaimer",
        href: "/docs/risk-disclaimer",
        description: "Important risk and legal information"
      }
    ]
  },
  {
    title: "Performance",
    href: "/performance",
    description: "Track record and transparency metrics",
    children: [
      {
        title: "Live Results",
        href: "/performance/live",
        description: "Real-time accuracy tracking"
      },
      {
        title: "Historical Performance",
        href: "/performance/historical",
        description: "Long-term track record analysis"
      },
      {
        title: "Model Updates",
        href: "/performance/updates",
        description: "Algorithm improvements and changes"
      }
    ]
  },
  {
    title: "About",
    href: "/about",
    description: "Learn about our team and mission",
    children: [
      {
        title: "Our Team",
        href: "/about/team",
        description: "Meet the researchers and developers"
      },
      {
        title: "Our Mission",
        href: "/about/mission", 
        description: "Why we built this platform"
      },
      {
        title: "Press & Media",
        href: "/about/press",
        description: "News coverage and media mentions"
      }
    ]
  }
];

export const footerLinks = {
  product: [
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "API", href: "/docs/api" },
    { title: "Status", href: "/status" }
  ],
  company: [
    { title: "About", href: "/about" },
    { title: "Team", href: "/about/team" },
    { title: "Careers", href: "/careers" },
    { title: "Contact", href: "/contact" }
  ],
  resources: [
    { title: "Documentation", href: "/docs" },
    { title: "Research", href: "/research" },
    { title: "Blog", href: "/blog" },
    { title: "Help Center", href: "/help" }
  ],
  legal: [
    { title: "Privacy Policy", href: "/legal/privacy" },
    { title: "Terms of Service", href: "/legal/terms" },
    { title: "Risk Disclaimer", href: "/docs/risk-disclaimer" },
    { title: "Data Policy", href: "/legal/data-policy" }
  ]
};

// High priority pages for initial development
export const priorityPages = [
  "/research/methodology",
  "/research/algorithm-weights", 
  "/performance/live",
  "/docs/signals",
  "/about/team",
  "/docs/risk-disclaimer"
];