import { motion } from "framer-motion";

// Landscape reel for tablet/desktop, 9:16 reel for phones.
const Showreel = () => {
  return (
    <section id="showreel" className="py-16 md:py-24">
      <div className="container px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gold-gradient">Show</span>
            <span className="text-foreground">reel</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            90 seconds across 16 projects: Roku, mobile, console, AR, VR and projection mapping.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <video
            className="hidden md:block w-full max-w-5xl mx-auto rounded-xl shadow-2xl ring-1 ring-border bg-black aspect-video"
            src="/showreel/asaf-silner-showreel.mp4"
            poster="/showreel/showreel-poster.jpg"
            controls
            playsInline
            preload="metadata"
          />
          <video
            className="md:hidden w-full max-w-sm mx-auto rounded-xl shadow-2xl ring-1 ring-border bg-black aspect-[9/16]"
            src="/showreel/asaf-silner-showreel-vertical.mp4"
            poster="/showreel/showreel-vertical-poster.jpg"
            controls
            playsInline
            preload="none"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Showreel;
