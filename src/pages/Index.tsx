import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";
import { Linkedin, Youtube, Instagram } from "lucide-react";

const socialLinks = [
  { name: "LinkedIn", href: "https://linkedin.com/in/asafsilner", icon: Linkedin },
  { name: "ArtStation", href: "https://artstation.com/asafsilner", icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z"/>
    </svg>
  )},
  { name: "YouTube", href: "https://youtube.com/@asafsilner", icon: Youtube },
  { name: "Instagram", href: "https://instagram.com/asafsilner", icon: Instagram },
];

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <WorkGrid />
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-muted-foreground text-sm">
              © 2024 Asaf Silner. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
