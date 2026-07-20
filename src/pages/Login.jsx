import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await iniciarSesion(email, password);
      navigate("/");
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={enviar}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-slate-800">Táctika</h1>
          <p className="text-sm text-slate-500">Business Suite</p>
        </div>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg p-3"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}