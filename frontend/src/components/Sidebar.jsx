import { LayoutDashboard, HeartPulse, Bot, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r px-4 py-6">
      <h1 className="text-xl font-bold text-green-600 mb-8">MindCare</h1>

      <nav className="space-y-3 text-sm">
        <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
        <NavItem icon={<HeartPulse />} label="Health Reports" />
        <NavItem icon={<Bot />} label="AI Assistant" />
        <NavItem icon={<Settings />} label="Settings" />
      </nav>
    </aside>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
        active
          ? "bg-green-100 text-green-700"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
