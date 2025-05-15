import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

const ActivityCard = ({ activities = [], title = "Recent Activity" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-black/30 backdrop-blur-md rounded-xl border border-orange-500/30 p-4 h-full"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/60">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 border-b border-white/10">
              <div
                className={`w-8 h-8 rounded-full bg-${activity.color || "orange"}-500 flex items-center justify-center flex-shrink-0`}
              >
                <activity.icon className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{activity.title}</p>
                <p className="text-white/70 text-sm truncate">{activity.description}</p>
                <p className="text-white/50 text-xs mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ActivityCard
