import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import asafLogo from "@/assets/asaf-logo.png";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border"
        >
          <div className="container px-6 md:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <img 
                  src={asafLogo} 
                  alt="Asaf Silner" 
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-6">
                {isHomePage ? (
                  <>
                    <button
                      onClick={() => scrollToSection("work")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors gold-underline"
                    >
                      Work
                    </button>
                    <button
                      onClick={() => scrollToSection("hero")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors gold-underline"
                    >
                      About
                    </button>
                    <a
                      href="mailto:asaf@example.com"
                      className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      Contact
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors gold-underline"
                    >
                      Home
                    </Link>
                    <a
                      href="mailto:asaf@example.com"
                      className="text-sm px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      Contact
                    </a>
                  </>
                )}
              </nav>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;
