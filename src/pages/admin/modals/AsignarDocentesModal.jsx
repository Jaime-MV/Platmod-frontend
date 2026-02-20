import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Modal from '../../../components/ui/Modal';

const AsignarDocentesModal = ({ visible, onClose, onSave, availableDocentes: initialAvailable, assignedDocentes: initialAssigned }) => {
    const [available, setAvailable] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Sync state when modal opens with new data
    // Parent passes fresh data each time the modal opens
    if (visible && initialAvailable.length > 0 && available.length === 0 && assigned.length === 0) {
        setAvailable(initialAvailable);
        setAssigned(initialAssigned);
    }

    const onDragEnd = ({ source, destination }) => {
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const getList = (id) => id === 'available' ? available : assigned;
        const src = Array.from(getList(source.droppableId));
        const dst = source.droppableId === destination.droppableId
            ? src
            : Array.from(getList(destination.droppableId));

        const [moved] = src.splice(source.index, 1);
        dst.splice(destination.index, 0, moved);

        if (source.droppableId === 'available') {
            setAvailable(src);
            if (destination.droppableId === 'assigned') setAssigned(dst);
        } else {
            setAssigned(src);
            if (destination.droppableId === 'available') setAvailable(dst);
        }
    };

    const handleSave = async () => {
        await onSave(assigned.map(d => d.idUsuario));
        handleClose();
    };

    const handleClose = () => {
        setAvailable([]);
        setAssigned([]);
        setSearchTerm('');
        onClose();
    };

    const filtered = available.filter(d =>
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal visible={visible} onClose={handleClose} title="Gestionar Docentes" size="lg">
            <p className="modal-subtitle">Arrastra los docentes para asignarlos al curso.</p>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="dnd-container">
                    {/* Available column */}
                    <div className="dnd-column">
                        <h4>Disponibles</h4>
                        <input
                            type="text"
                            placeholder="Buscar docente..."
                            className="search-input-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Droppable droppableId="available">
                            {(provided) => (
                                <div className="dnd-list" {...provided.droppableProps} ref={provided.innerRef}>
                                    {filtered.map((docente, index) => (
                                        <Draggable key={docente.idUsuario} draggableId={String(docente.idUsuario)} index={index}>
                                            {(provided) => (
                                                <div className="dnd-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <div className="docente-info">
                                                        <span className="docente-name">{docente.nombre}</span>
                                                        <small style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>{docente.especialidad}</small>
                                                    </div>
                                                    <span className="drag-handle">⠿</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* Assigned column */}
                    <div className="dnd-column">
                        <h4>Asignados al Curso</h4>
                        <Droppable droppableId="assigned">
                            {(provided) => (
                                <div className="dnd-list assigned-list" {...provided.droppableProps} ref={provided.innerRef}>
                                    {assigned.map((docente, index) => (
                                        <Draggable key={docente.idUsuario} draggableId={String(docente.idUsuario)} index={index}>
                                            {(provided) => (
                                                <div className="dnd-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <div className="docente-info">
                                                        <span className="docente-name">{docente.nombre}</span>
                                                        <small style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>{docente.especialidad}</small>
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem' }}>✅</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={handleClose}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave}>Guardar Cambios</button>
            </div>
        </Modal>
    );
};

export default AsignarDocentesModal;
