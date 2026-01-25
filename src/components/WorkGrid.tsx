import { motion } from "framer-motion";
import { projectsData } from "@/data/projects";
import ProjectCard from "./ProjectCard";

const WorkGrid = () => {
  return (
    <section id="work" className="py-24 md:py-32">
      <div className="container px-6 md:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gold-gradient">Selected</span>{" "}
            <span className="text-foreground">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            A curated collection of phygital experiences, games, and interactive installations.
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {projectsData.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkGrid;
