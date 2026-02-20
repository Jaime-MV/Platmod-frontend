import { useState } from 'react';
import Modal from '../../../components/ui/Modal';

const DeleteCursoModal = ({ visible, onClose, curso, onDeleted }) => {
    const [confirmText, setConfirmText] = useState('');

    const handleConfirm = async () => {
        if (confirmText !== curso?.titulo) {
            return alert('El nombre no coincide.');
        }
        await onDeleted(curso.idCurso);
        setConfirmText('');
    };

    // Reset text when modal opens/closes
    const handleClose = () => {
        setConfirmText('');
        onClose();
    };

    return (
        <Modal visible={visible} onClose={handleClose} title="⚠️ Eliminar Curso" titleColor="var(--red)">
            {curso ? (
                <>
                    <div className="delete-warning">
                        <p>Estás a punto de eliminar: <strong>{curso.titulo}</strong></p>
                        <p style={{ marginTop: 6 }}>Esta acción es <strong>irreversible</strong>.</p>
                    </div>
                    <div className="form-group">
                        <label>
                            Escribe <strong style={{ color: 'var(--text-primary)' }}>{curso.titulo}</strong> para confirmar:
                        </label>
                        <input
                            type="text"
                            className="form-input delete-input"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Nombre del curso"
                            style={{ marginTop: 8 }}
                        />
                    </div>
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={handleClose}>Cancelar</button>
                        <button
                            className="btn-danger"
                            onClick={handleConfirm}
                            disabled={confirmText !== curso.titulo}
                        >
                            Eliminar Definitivamente
                        </button>
                    </div>
                </>
            ) : null}
        </Modal>
    );
};

export default DeleteCursoModal;
