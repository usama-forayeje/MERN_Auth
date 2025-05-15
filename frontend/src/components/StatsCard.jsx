import { motion } from "framer-motion";

const StatsCard = ({ icon: Icon, title, value, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-black/30 backdrop-blur-md rounded-xl border border-${color}-500/30 p-4 flex items-center`}
    >
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center mr-4 shadow-lg`}
      >
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <h3 className="text-white/70 text-sm font-medium">{title}</h3>
        <p className="text-white text-xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
