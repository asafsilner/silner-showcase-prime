import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Clock, Monitor, Wrench } from "lucide-react";
import { getProjectById, projectsData } from "@/data/projects";
import { Button } from "@/components/ui/button";

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || "");

  if (!project) {
    return <Navigate to="/" replace />;
  }

  // Get next project for navigation
  const currentIndex = projectsData.findIndex((p) => p.id === id);
  const nextProject = projectsData[(currentIndex + 1) % projectsData.length];

  // Parse core loop steps
  const coreLoopSteps = project.content.coreLoop.split(" -> ");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={project.media.hero}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-6 left-6 z-20">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-border hover:bg-background"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Work
            </Link>
          </Button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container px-6 md:px-8 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-accent rounded-full mb-4">
                {project.platform}
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                {project.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {project.tagline}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metadata Bar */}
      <section className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container px-6 md:px-8">
          <div className="flex flex-wrap items-center gap-4 md:gap-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Role:</span>
              <span className="text-foreground font-medium">{project.role}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Team:</span>
              <span className="text-foreground font-medium">{project.team}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Duration:</span>
              <span className="text-foreground font-medium">{project.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Platform:</span>
              <span className="text-foreground font-medium">{project.platform}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Tools:</span>
              <span className="text-foreground font-medium">{project.tools.join(", ")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-20">
          {/* The Challenge */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              <span className="text-gold-gradient">The Challenge</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {project.content.problem}
            </p>
          </motion.section>

          {/* The Solution */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              <span className="text-gold-gradient">The Solution</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {project.content.solution}
            </p>
            
            {/* Responsibilities */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Key Responsibilities</h3>
              <ul className="space-y-3">
                {project.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Video Showcase */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              <span className="text-gold-gradient">Video Showcase</span>
            </h2>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-card border border-border">
              <iframe
                src={project.media.video}
                title={`${project.title} Video`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.section>

          {/* Core Loop */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
              <span className="text-gold-gradient">Core Loop</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {coreLoopSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 md:gap-4">
                  <div className="loop-step min-w-[120px] text-center">
                    <span className="text-sm md:text-base font-medium text-foreground">{step}</span>
                  </div>
                  {index < coreLoopSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Systems & UX */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              <span className="text-gold-gradient">Systems & UX</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">Systems Design</h3>
                <p className="text-muted-foreground">{project.content.systems}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">UX Flow</h3>
                <p className="text-muted-foreground">{project.content.uxFlow}</p>
              </div>
            </div>
          </motion.section>

          {/* The Outcome */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              <span className="text-gold-gradient">The Outcome</span>
            </h2>
            <div className="bg-accent/50 border border-primary/20 rounded-lg p-8">
              <p className="text-lg text-foreground leading-relaxed">
                {project.content.outcome}
              </p>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Next Project */}
      <section className="border-t border-border">
        <Link
          to={`/project/${nextProject.id}`}
          className="group block py-16 md:py-24 hover:bg-card/50 transition-colors duration-300"
        >
          <div className="container px-6 md:px-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Next Project</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {nextProject.title}
                </h3>
              </div>
              <ArrowRight className="w-8 h-8 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default ProjectPage;
