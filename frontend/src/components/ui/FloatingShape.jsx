import { motion } from "framer-motion";

const FloatingShape = ({ color, size, top, left, delay = 0 }) => {
  return (
    <motion.div
      className={`absolute ${size} ${color} rounded-full filter blur-3xl opacity-30`}
      style={{ top, left }}
      animate={{
        y: ["0%", "15%", "0%"],
        x: ["0%", "10%", "0%"],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 15,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        delay,
      }}
    />
  );
};

export default FloatingShape;
