import { Input } from "./ui/input";

// eslint-disable-next-line no-unused-vars
function CustomInput({ icon: Icon, ...props }) {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-[#D5262A]" />
      </div>
      <Input
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-[#E46625]
         focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 transition duration-200"
      />
    </div>
  );
}

export default CustomInput;
