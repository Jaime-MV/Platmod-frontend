import { useState } from 'react';
import Modal from '../../../components/ui/Modal';

const CreateCursoModal = ({ visible, onClose, onCreated }) => {
    const [newCurso, setNewCurso] = useState({
        titulo: '',
        descripcion: '',
        portadaUrl: '',
        estado: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCurso(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCurso.titulo || !newCurso.descripcion) {
            return alert('Llena los campos obligatorios');
        }
        await onCreated(newCurso);
        setNewCurso({ titulo: '', descripcion: '', portadaUrl: '', estado: false });
    };

    return (
        <Modal visible={visible} onClose={onClose} title="Crear Nuevo Curso">
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label>Título del Curso</label>
                    <input
                        type="text"
                        name="titulo"
                        className="form-input"
                        value={newCurso.titulo}
                        onChange={handleInputChange}
                        placeholder="Ej. Curso de React Avanzado"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                        name="descripcion"
                        className="form-input"
                        value={newCurso.descripcion}
                        onChange={handleInputChange}
                        placeholder="Breve descripción..."
                        rows="3"
                        required
                        style={{ resize: 'vertical' }}
                    />
                </div>
                <div className="form-group">
                    <label>URL de Portada</label>
                    <input
                        type="text"
                        name="portadaUrl"
                        className="form-input"
                        value={newCurso.portadaUrl}
                        onChange={handleInputChange}
                        placeholder="https://..."
                    />
                </div>
                <div className="form-group">
                    <label>Visibilidad Inicial</label>
                    <select
                        name="estado"
                        className="form-input"
                        value={newCurso.estado}
                        onChange={(e) => setNewCurso(prev => ({ ...prev, estado: e.target.value === 'true' }))}
                    >
                        <option value="false">🔒 Oculto (Borrador)</option>
                        <option value="true">🌍 Público (Visible)</option>
                    </select>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Curso</button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateCursoModal;
