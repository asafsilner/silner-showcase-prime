import { motion } from "framer-motion";
import { ArrowDown, Mail, Linkedin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import profileAvatar from "@/assets/profile-avatar.webp";

const Hero = () => {
  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-overlay via-background to-background" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container relative z-10 px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Profile Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Avatar className="w-32 h-32 md:w-40 md:h-40 mx-auto ring-4 ring-primary/20 ring-offset-4 ring-offset-background shadow-2xl">
              <AvatarImage src={profileAvatar} alt="Asaf Silner" className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">AS</AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Main headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            <span className="text-foreground">Game Designer</span>
            <span className="text-muted-foreground"> / </span>
            <br className="hidden md:block" />
            <span className="text-gold-gradient">Creative Technologist</span>
          </h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
          >
            Specializing in Phygital Experiences & Systems Design
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base md:text-lg text-muted-foreground/70 max-w-xl mx-auto mb-12"
          >
            Building loops and systems that work in the real world.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={scrollToWork}
              size="lg"
              className="group bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold"
            >
              View Work
              <ArrowDown className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-1" />
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:text-primary px-8 py-6 text-base"
            >
              <a href="mailto:asafsilner@gmail.com">
                <Mail className="mr-2 w-4 h-4" />
                Email
              </a>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:text-primary px-6 py-6 text-base"
            >
              <a href="https://linkedin.com/in/asafsilner" target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 w-4 h-4" />
                LinkedIn
              </a>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-primary hover:text-primary px-6 py-6 text-base"
            >
              <a href="https://wa.me/9720508822828" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 w-4 h-4" />
                WhatsApp
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
