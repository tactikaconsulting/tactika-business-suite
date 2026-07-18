import { NavLink } from "react-router-dom";

export default function SidebarItem({
  to,
  icon: Icon,
  text,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-6 py-3 transition-all
        ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={20} />

      <span>{text}</span>
    </NavLink>
  );
}