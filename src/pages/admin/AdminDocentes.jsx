import { useEffect, useState } from 'react';
import { getAllDocentes, crearDocente, editarDocente, eliminarDocente } from '../../services/api';

const initialForm = { nombre: '', correo: '', contrasena: '', especialidad: '' };

const AdminDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchDocentes = async () => {
    setLoading(true);
    try {
      const data = await getAllDocentes();
      setDocentes(data);
    } catch {
      setError('Error al cargar docentes');
    }
    setLoading(false);
  };

  useEffect(() => { fetchDocentes(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await editarDocente(editId, form);
      } else {
        await crearDocente(form);
      }
      setForm(initialForm);
      setEditId(null);
      fetchDocentes();
    } catch (err) {
      setError('Error al guardar docente');
    }
  };

  const handleEdit = docente => {
    setForm({
      nombre: docente.nombre || '',
      correo: docente.correo || '',
      contrasena: '',
      especialidad: docente.especialidad || ''
    });
    setEditId(docente.idDocente || docente.idUsuario);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar este docente?')) return;
    try {
      await eliminarDocente(id);
      fetchDocentes();
    } catch {
      setError('Error al eliminar docente');
    }
  };

  return (
    <div className="admin-docentes-container">
      <h1>Gestión de Docentes</h1>
      <form className="admin-docente-form" onSubmit={handleSubmit}>
        <h3>{editId ? 'Editar Docente' : 'Crear Nuevo Docente'}</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Correo</label>
          <input name="correo" type="email" value={form.correo} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input name="contrasena" type="password" value={form.contrasena} onChange={handleChange} required={!editId} />
        </div>
        <div className="form-group">
          <label>Especialidad</label>
          <input name="especialidad" value={form.especialidad} onChange={handleChange} />
        </div>
        <div className="modal-actions">
          <button type="submit" className="btn-primary">{editId ? 'Guardar Cambios' : 'Crear Docente'}</button>
          {editId && <button type="button" className="btn-cancel" onClick={() => { setEditId(null); setForm(initialForm); }}>Cancelar</button>}
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
      <hr />
      <h3>Docentes Registrados</h3>
      {loading ? <div>Cargando...</div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Especialidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map(docente => (
              <tr key={docente.idDocente || docente.idUsuario}>
                <td>{docente.idDocente || docente.idUsuario}</td>
                <td>{docente.nombre}</td>
                <td>{docente.correo}</td>
                <td>{docente.especialidad}</td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEdit(docente)}>✏️</button>
                  <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDelete(docente.idDocente || docente.idUsuario)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDocentes;
