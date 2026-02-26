import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Clock, Monitor, Wrench, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getProjectById, projectsData } from "@/data/projects";
import { Button } from "@/components/ui/button";

const ProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || "");
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  // Get next project for navigation
  const currentIndex = projectsData.findIndex((p) => p.id === id);
  const nextProject = projectsData[(currentIndex + 1) % projectsData.length];

  // Parse core loop steps
  const coreLoopSteps = project.content.coreLoop.split(" -> ");

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => setLightboxIdx((prev) => (prev + 1) % project.media.gallery.length);
  const prevImage = () => setLightboxIdx((prev) => (prev - 1 + project.media.gallery.length) % project.media.gallery.length);

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
        <div className="max-w-5xl mx-auto space-y-20">
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
            
            {/* Main video player */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-card border border-border mb-4">
              <iframe
                key={project.media.videos[activeVideoIdx]?.id}
                src={`https://www.youtube.com/embed/${project.media.videos[activeVideoIdx]?.id}`}
                title={project.media.videos[activeVideoIdx]?.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video title */}
            <p className="text-sm text-foreground font-medium mb-4">
              {project.media.videos[activeVideoIdx]?.title}
            </p>

            {/* Video thumbnails list */}
            {project.media.videos.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {project.media.videos.map((video, idx) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideoIdx(idx)}
                    className={`group relative aspect-video rounded-md overflow-hidden border-2 transition-all duration-200 ${
                      idx === activeVideoIdx
                        ? "border-primary shadow-gold"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-1.5">
                      <span className="text-[10px] text-foreground leading-tight line-clamp-2">{video.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          {/* Photo Gallery */}
          {project.media.gallery.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
                <span className="text-gold-gradient">Photo Gallery</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {project.media.gallery.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => openLightbox(idx)}
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-200"
                  >
                    <img
                      src={img}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-200" />
                  </button>
                ))}
              </div>
            </motion.section>
          )}

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

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 rounded-full bg-card border border-border hover:bg-accent transition-colors"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 p-2 rounded-full bg-card border border-border hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>

            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={project.media.gallery[lightboxIdx]}
              alt={`${project.title} screenshot ${lightboxIdx + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 p-2 rounded-full bg-card border border-border hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>

            <div className="absolute bottom-6 text-sm text-muted-foreground">
              {lightboxIdx + 1} / {project.media.gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectPage;
