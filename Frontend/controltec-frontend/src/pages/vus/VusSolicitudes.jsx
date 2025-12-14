// src/pages/vus/VusSolicitudes.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import "./VusVentanilla.css";

export default function VusSolicitudes() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cedula, setCedula] = useState("");

  const ESTADOS_OBJETIVO = ["Depositada", "DepositadaFase1", "DepositadaFase2"];

  useEffect(() => {
    const cargarSolicitudes = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/api/Solicitudes");
        const data = res.data || [];

        const filtradas = data.filter((s) =>
          ESTADOS_OBJETIVO.includes(String(s.estado || ""))
        );

        setSolicitudes(filtradas);
      } catch (err) {
        console.error("Error cargando solicitudes VUS:", err);
        setError(
          err.response?.status === 403 || err.response?.status === 401
            ? "No tienes permiso para ver las solicitudes."
            : "No se pudieron cargar las solicitudes."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitudes();
  }, []);

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "-";
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("es-DO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // badge igual al solicitante (success/warning/danger)
  const getEstadoBadgeClass = (estado = "") => {
    const e = String(estado).toLowerCase();
    if (e.includes("rechaz")) return "vus-badge vus-badge-danger";
    if (e.includes("devuelt")) return "vus-badge vus-badge-danger";
    if (e.includes("aprob")) return "vus-badge vus-badge-success";
    if (e.includes("deposit")) return "vus-badge vus-badge-warning";
    return "vus-badge vus-badge-neutral";
  };

  const solicitudesFiltradas = useMemo(() => {
    const c = (cedula || "").trim();
    if (!c) return solicitudes;

    return solicitudes.filter((s) => {
      const ced = s.usuario?.cedula || s.usuario?.Cedula || "";
      return String(ced).includes(c);
    });
  }, [cedula, solicitudes]);

  return (
    <div className="vus-page">
      <div className="vus-container">
        {/* Header estilo solicitante */}
        <div className="vus-header">
          <div>
            <h1 className="vus-title">Bandeja VUS</h1>
            <p className="vus-subtitle">
              Revisa las solicitudes pendientes de validación por VUS:{" "}
              <b>Depositadas</b>, <b>Depositadas Fase 1</b> y{" "}
              <b>Depositadas Fase 2</b>.
            </p>
          </div>
        </div>

        {loading && <p className="vus-loading">Cargando solicitudes...</p>}
        {error && !loading && <div className="vus-error">{error}</div>}

        {!loading && !error && solicitudesFiltradas.length === 0 && (
          <p className="vus-empty">No hay solicitudes para mostrar.</p>
        )}

        {/* Card + tabla igual “Mis solicitudes” */}
        {!loading && !error && solicitudesFiltradas.length > 0 && (
          <section className="vus-card">
            <div className="vus-card-head">
              <div>
                <h3 className="vus-card-title">Solicitudes para revisión VUS</h3>
                <p className="vus-card-subtitle">
                  {solicitudesFiltradas.length} registro(s)
                </p>
              </div>
            </div>

            <div className="vus-table-wrap">
              <table className="vus-table">
                <thead>
                  <tr>
                    <th className="vus-col-id">ID</th>
                    <th className="vus-col-servicio">SERVICIO</th>
                    <th className="vus-col-solicitante">SOLICITANTE</th>
                    <th className="vus-col-estado">ESTADO</th>
                    <th className="vus-col-fecha">FECHA</th>
                    <th className="vus-col-acciones">ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {solicitudesFiltradas.map((s, idx) => (
                    <tr key={s.id} style={{ "--row-delay": `${idx * 60}ms` }}>
                      <td>{s.id}</td>
                      <td>{s.servicio?.nombre ?? "-"}</td>
                      <td>{s.usuario?.nombre ?? "-"}</td>
                      <td>
                        <span className={getEstadoBadgeClass(s.estado)}>
                          {s.estado ?? "-"}
                        </span>
                      </td>
                      <td>{formatFecha(s.fechaCreacion)}</td>
                      <td>
                        <button
                          type="button"
                          className="vus-btn-secondary vus-btn-sm"
                          onClick={() => navigate(`/solicitudes/${s.id}`)}
                        >
                          Revisar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Buscar por cédula (card igual de limpia) */}
        <section className="vus-search-card">
          <h3 className="vus-search-title">Buscar solicitudes por cédula</h3>

          <div className="vus-search-row">
            <input
              className="vus-input"
              placeholder="Cédula del solicitante (11 dígitos)"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              inputMode="numeric"
            />

            <button type="button" className="vus-btn-primary">
              Buscar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
