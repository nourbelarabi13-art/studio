
"use client";

import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Terminal, Globe, Search, Lock, Code2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SecurityGuidePage() {
  const tools = [
    {
      category: "Comprehensive Proxies",
      icon: <Globe className="w-5 h-5 text-primary" />,
      items: [
        { name: "Burp Suite Pro", desc: "The industry standard for manual testing and interception.", status: "Premium" },
        { name: "Caido", desc: "Rust-based, high-performance proxy for modern workflows.", status: "Modern Choice" },
        { name: "OWASP ZAP", desc: "Best-in-class open source automated scanner.", status: "Free" }
      ]
    },
    {
      category: "Vulnerability Scanners (DAST)",
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      items: [
        { name: "Nuclei", desc: "Fast, template-based scanner for known vulnerabilities.", status: "Essential" },
        { name: "Invicti", desc: "Enterprise-grade DAST with extremely low false positives.", status: "Premium" }
      ]
    },
    {
      category: "API & Fuzzing",
      icon: <Terminal className="w-5 h-5 text-accent" />,
      items: [
        { name: "ffuf", desc: "Ultra-fast web fuzzer for directory and parameter discovery.", status: "Power User" },
        { name: "Kiterunner", desc: "The standard for API endpoint discovery.", status: "API-First" }
      ]
    },
    {
      category: "Static Analysis (SAST)",
      icon: <Code2 className="w-5 h-5 text-blue-500" />,
      items: [
        { name: "Semgrep", desc: "Fast, rule-based static analysis for your codebase.", status: "Shift-Left" },
        { name: "Snyk", desc: "Developer-friendly vulnerability and dependency scanning.", status: "Must-Have" }
      ]
    }
  ];

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-5xl space-y-12 animate-fade-in">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
            <Shield className="w-4 h-4" />
            Guardian Resources
          </div>
          <h1 className="font-headline text-5xl font-bold">Sentinel’s Security Grimoire</h1>
          <p className="text-muted-foreground italic text-lg max-w-2xl mx-auto">
            A 2026 guide to the artifacts and rituals required to protect the sanctuary from unholy breaches.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tools.map((section) => (
            <Card key={section.category} className="glass-morphism border-primary/10 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all shadow-xl">
              <CardHeader className="bg-primary/5 border-b border-primary/5 py-6">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <CardTitle className="font-headline text-xl">{section.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {section.items.map((tool) => (
                  <div key={tool.name} className="space-y-1 group">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{tool.name}</h4>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-primary/20">
                        {tool.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">{tool.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="glass-morphism rounded-[3.5rem] p-12 border-primary/10 space-y-8 bg-white/40">
          <div className="flex items-center gap-4 border-b border-primary/5 pb-6">
            <Lock className="w-8 h-8 text-primary" />
            <h2 className="font-headline text-3xl font-bold">The Guardian's Toolchain (2026)</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Beginners</h3>
              <p className="text-xs text-muted-foreground italic">ZAP + sqlmap + Postman Security. Focus on learning the basics of request/response flow.</p>
            </div>
            <div className="space-y-3 border-x border-primary/5 px-8">
              <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Bounty Hunters</h3>
              <p className="text-xs text-muted-foreground italic">Caido + Nuclei + ffuf. Speed and automation are your greatest allies in the wild.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Professional</h3>
              <p className="text-xs text-muted-foreground italic">Burp Pro + Semgrep + Custom AI Fuzzing. Deep manual inspection meets autonomous scanning.</p>
            </div>
          </div>
        </section>

        <footer className="text-center space-y-4 pt-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">
            <AlertTriangle className="w-4 h-4 text-primary/40" />
            Ritual Warning
          </div>
          <p className="text-xs text-muted-foreground/60 italic max-w-lg mx-auto">
            "With great power comes great responsibility. Test only that which you own, or that which has invited you to find its shadows."
          </p>
        </footer>
      </main>
    </div>
  );
}
