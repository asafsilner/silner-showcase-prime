import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <WorkGrid />
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 Asaf Silner. All rights reserved.
            </p>
            <a
              href="mailto:asaf@example.com"
              className="text-sm text-foreground hover:text-primary transition-colors gold-underline"
            >
              asaf@example.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
