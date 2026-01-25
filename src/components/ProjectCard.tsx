import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      <Link to={`/project/${project.id}`} className="group block">
        <article className="relative overflow-hidden rounded-lg bg-card border border-border card-glow transition-all duration-500">
          {/* Thumbnail */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={project.media.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60" />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* View CTA */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                View Case Study
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Platform tag */}
            <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-accent rounded-full mb-3">
              {project.platform}
            </span>
            
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              {project.title}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {project.tagline}
            </p>
            
            {/* Role */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="text-foreground font-medium">{project.role}</span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
