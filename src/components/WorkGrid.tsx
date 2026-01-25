import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projectsData } from "@/data/projects";
import ProjectCard from "./ProjectCard";

// Extract unique platform categories
const getPlatformCategory = (platform: string): string => {
  const lower = platform.toLowerCase();
  if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android")) return "Mobile";
  if (lower.includes("vr") || lower.includes("oculus")) return "VR";
  if (lower.includes("physical") || lower.includes("installation") || lower.includes("projection") || lower.includes("kiosk") || lower.includes("touch")) return "Physical";
  if (lower.includes("tv") || lower.includes("connected")) return "TV";
  return "Other";
};

const WorkGrid = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    projectsData.forEach((p) => cats.add(getPlatformCategory(p.platform)));
    return Array.from(cats);
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projectsData;
    return projectsData.filter((p) => getPlatformCategory(p.platform) === activeFilter);
  }, [activeFilter]);

  return (
    <section id="work" className="py-24 md:py-32">
      <div className="container px-6 md:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gold-gradient">Selected</span>{" "}
            <span className="text-foreground">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            A curated collection of phygital experiences, games, and interactive installations.
          </p>
        </motion.div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                activeFilter === category
                  ? "bg-primary text-primary-foreground border-primary shadow-gold"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-2 text-xs opacity-70">
                  ({projectsData.filter((p) => getPlatformCategory(p.platform) === category).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-12"
          >
            No projects found in this category.
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default WorkGrid;
