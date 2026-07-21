import { categoriaIndiceTactika } from "../../services/IndiceTactika";

const estilos = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export default function IndiceTactikaBadge({ puntaje }) {
  const { label, color } = categoriaIndiceTactika(puntaje || 0);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${estilos[color]}`}>
      <span className="font-mono">{puntaje || 0}</span> · {label}
    </span>
  );
}