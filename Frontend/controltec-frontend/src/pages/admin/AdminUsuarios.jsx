// src/pages/admin/AdminUsuarios.jsx
import { useEffect, useState } from "react";
import api from "../../api/apiClient";

function CrearUsuarioModal({ open, onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Solicitante");
  const [activo, setActivo] = useState(true);
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Limpiar formulario cada vez que se abre/cierra el modal
  useEffect(() => {
    if (open) {
      setNombre("");
      setCorreo("");
      setPassword("");
      setRol("Solicitante");
      setActivo(true);
      setCedula("");
      setError("");
      setSuccessMsg("");
      setLoading(false);
    }
  }, [open]);

  const normalizarCedula = (v = "") => v.replace(/[^0-9]/g, "").slice(0, 11);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !correo.trim() || !password.trim() || !rol.trim()) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }
    if (cedula && normalizarCedula(cedula).length !== 11) {
      setError("La cédula debe tener 11 dígitos.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/admin/usuarios", {
        nombre,
        correo,
        password,
        roll: rol,
        activo,
        cedula: cedula ? normalizarCedula(cedula) : null,
      });
      setSuccessMsg("Usuario creado correctamente.");
      setTimeout(() => {
        setSuccessMsg("");
        onSuccess && onSuccess();
        onClose && onClose();
      }, 1200);
    } catch (err) {
      if (err?.response?.status === 401) {
        // Si ocurre 401, simplemente cerrar el modal y sugerir recargar sesión, pero no mostrarlo como error de negocio
        onClose && onClose();
        // Opcional: window.location.reload();
      } else if (typeof err?.response?.data === "string") {
        setError(err.response.data);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al crear usuario.");
      }
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;
  return (
    <div className="ct-modal-overlay">
      <div className="ct-modal">
        <h2>Crear usuario</h2>
        {error && <div className="ct-error">{error}</div>}
        <form onSubmit={handleSubmit} className="ct-col">
          <div className="form-group">
            <label>Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Cédula (opcional / 11 dígitos)</label>
            <input value={cedula} onChange={e => setCedula(normalizarCedula(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Rol / Perfil</label>
            <select value={rol} onChange={e => setRol(e.target.value)}>
              {ROLES_POSIBLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="checkbox-label" style={{ display: "flex", gap: ".5rem" }}>
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
              <span>Usuario activo</span>
            </label>
          </div>
          <div className="ct-row ct-gap-2">
            <button type="submit" className="ct-btn ct-btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear usuario"}
            </button>
            <button type="button" className="ct-btn ct-btn-outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <style>{`.ct-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.13);z-index:99;display:flex;align-items:center;justify-content:center;}`}</style>
      <style>{`.ct-modal{background:#fff;padding:2rem 2.5rem;border-radius:1rem;box-shadow:0 2px 16px #0001;min-width:350px;max-width:95vw;}`}</style>
    </div>
  );
}

const ROLES_POSIBLES = [
  "Solicitante",
  "VUS",
  "TecnicoUPC",
  "EncargadoUPC",
  "Direccion",
  "DNCD",
  "Admin",
];

export default function AdminUsuarios() {
  const [modalCrear, setModalCrear] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modo edición (null = creando)
  const [editingId, setEditingId] = useState(null);

  // formulario de nuevo / editar usuario
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [cedula, setCedula] = useState("");
  const [rol, setRol] = useState("Solicitante");
  const [activo, setActivo] = useState(true);

  // ✅ nueva contraseña (crear/editar opcional)
  const [password, setPassword] = useState("");

  // búsqueda por cédula
  const [searchCedula, setSearchCedula] = useState("");

  const normalizarCedula = (v = "") => v.replace(/[^0-9]/g, "").slice(0, 11);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/Usuarios");
      setUsuarios(res.data || []);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;

      if (status && status !== 404) {
        setError("No se pudieron cargar los usuarios.");
      } else {
        setError("");
        setUsuarios([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNombre("");
    setCorreo("");
    setCedula("");
    setRol("Solicitante");
    setActivo(true);
    setPassword(""); // ✅ reset
  };

  const handleCrearOEditarUsuario = async (e) => {
    e.preventDefault();
    setError("");

    if (cedula && normalizarCedula(cedula).length !== 11) {
      setError("La cédula debe tener 11 dígitos.");
      return;
    }

    // ✅ Validación: si estás creando, contraseña obligatoria
    if (!editingId && !password.trim()) {
      setError("La contraseña es obligatoria para crear el usuario.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Payload: en crear SIEMPRE va contraseña
      // ✅ En editar, solo se manda si el usuario escribió una nueva
      const payload = {
        id: editingId ? editingId : 0,
        nombre,
        correo,
        roll: rol,
        activo,
        esInternoPendiente: rol !== "Solicitante",
        cedula: cedula ? normalizarCedula(cedula) : null,
        ...(editingId
          ? password.trim()
            ? { contraseña: password }
            : {}
          : { contraseña: password }),
      };

      if (editingId) {
        await api.put(`/api/Usuarios/${editingId}`, payload);
      } else {
        await api.post("/api/Usuarios", payload);
      }

      resetForm();
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarUsuario = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
      setLoading(true);
      setError("");

      await api.delete(`/api/Usuarios/${id}`);

      if (editingId === id) resetForm();

      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setNombre(u.nombre || "");
    setCorreo(u.correo || "");
    setCedula(u.cedula || "");
    setRol(u.roll || "Solicitante");
    setActivo(!!u.activo);
    setPassword(""); // ✅ en edición no rellenamos contraseña
  };

  // ====== FILTRADO POR CÉDULA ======
  const cedulaBuscada = normalizarCedula(searchCedula);
  const usuariosFiltrados =
    cedulaBuscada.length > 0
      ? usuarios.filter(
        (u) =>
          u.cedula &&
          normalizarCedula(String(u.cedula)).includes(cedulaBuscada)
      )
      : usuarios;

  return (
    <div className="ct-app">
      <CrearUsuarioModal
        open={modalCrear}
        onClose={() => setModalCrear(false)}
        onSuccess={cargarUsuarios}
      />
      <div className="ct-page-container">
        <header className="ct-header">
          <div className="ct-title-group">
            <h1 className="ct-title">Gestión de Usuarios y Perfiles</h1>
            <p className="ct-subtitle">
              Crea usuarios del sistema, define su rol/perfil y controla si están activos.
            </p>
          </div>
        </header>

        {error && <div className="ct-error">{error}</div>}

        <div className="ct-grid-admin-users">
          {/* ==========================
              Columna izquierda: FORM
             ========================== */}
          <section className="ct-card">
            <div className="ct-row-between ct-mb-4">
              <h2 style={{ margin: 0 }}>
                {editingId ? "Editar usuario" : "Detalles del usuario (Seleccione para editar)"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="ct-btn ct-btn-outline"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={handleCrearOEditarUsuario} className="ct-col">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={!editingId}
                />
              </div>

              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={!editingId}
                />
              </div>

              <div className="form-group">
                <label>Cédula (opcional / 11 dígitos)</label>
                <input
                  value={cedula}
                  onChange={(e) => setCedula(normalizarCedula(e.target.value))}
                  disabled={!editingId}
                />
              </div>

              <div className="form-group">
                <label>Rol / Perfil</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)} disabled={!editingId}>
                  {ROLES_POSIBLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ contraseña */}
              <div className="form-group">
                <label>
                  Contraseña{" "}
                  {editingId ? (
                    <span style={{ color: "var(--ct-text-muted)", fontSize: "0.85rem" }}>
                      (opcional: solo si deseas cambiarla)
                    </span>
                  ) : null}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? "Dejar en blanco para mantener" : ""}
                  required={false}
                  disabled={!editingId}
                />
              </div>

              <div className="form-group">
                <label
                  className="checkbox-label"
                  style={{ display: "flex", gap: "0.5rem" }}
                >
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    disabled={!editingId}
                  />
                  <span>Usuario activo</span>
                </label>
              </div>

              {editingId && (
                <button type="submit" className="ct-btn ct-btn-primary" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar cambios"}
                </button>
              )}
            </form>
          </section>

          {/* ==========================
              Columna derecha: TABLA
             ========================== */}
          <section className="ct-card">
            <div className="ct-row-between ct-mb-4 ct-wrap">
              <h2 style={{ margin: 0 }}>Usuarios registrados</h2>
              <div className="ct-row ct-gap-2 ct-wrap">
                <button
                  type="button"
                  className="ct-btn ct-btn-primary"
                  onClick={() => setModalCrear(true)}
                  style={{ fontWeight: 500 }}
                >
                  Crear usuario
                </button>
                <input
                  type="text"
                  placeholder="Buscar por cédula"
                  value={searchCedula}
                  onChange={(e) => setSearchCedula(e.target.value)}
                  style={{
                    padding: "0.45rem 0.7rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--ct-border)",
                    fontSize: "0.9rem",
                  }}
                />
                {cedulaBuscada.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchCedula("")}
                    className="ct-btn ct-btn-outline"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {loading && <div className="ct-loading">Cargando usuarios...</div>}

            {!loading && usuariosFiltrados.length === 0 && (
              <div className="ct-empty">
                {cedulaBuscada.length > 0
                  ? "No se encontraron usuarios con esa cédula."
                  : "No hay usuarios registrados o la API aún no está disponible."}
              </div>
            )}

            {!loading && usuariosFiltrados.length > 0 && (
              <div className="ct-table-wrap">
                <table className="ct-table ct-table--actions">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td>{u.nombre}</td>
                        <td>{u.correo}</td>
                        <td>{u.roll}</td>
                        <td>
                          <span
                            className={`ct-badge ${u.activo ? "ct-badge-success" : "ct-badge-neutral"
                              }`}
                          >
                            {u.activo ? "Sí" : "No"}
                          </span>
                        </td>
                        <td>
                          <div className="ct-row ct-wrap ct-gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(u)}
                              className="ct-btn ct-btn-outline"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEliminarUsuario(u.id)}
                              className="ct-btn ct-btn-outline"
                              style={{ borderColor: "#fecaca", color: "#b91c1c" }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
