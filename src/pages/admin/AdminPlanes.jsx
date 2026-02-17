import { useState, useEffect } from 'react';
import { getPlanes, updatePlan, addBeneficio, deleteBeneficio } from '../../services/api';
import './AdminStyles.css';

const AdminPlanes = () => {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [newBenefit, setNewBenefit] = useState('');

    useEffect(() => { loadPlanes(); }, []);

    const loadPlanes = async () => {
        setLoading(true);
        const data = await getPlanes();
        setPlanes(data);
        setLoading(false);
    };

    const handleEditClick = (plan) => {
        setEditingPlan({ ...plan });
        setNewBenefit('');
    };

    const handleClose = () => setEditingPlan(null);

    const handleSave = async () => {
        try {
            await updatePlan(editingPlan.idPlan, editingPlan);
            alert('Plan actualizado correctamente');
            handleClose();
            loadPlanes();
        } catch {
            alert('Error al actualizar plan');
        }
    };

    const handleAddBenefit = async () => {
        if (!newBenefit.trim()) return;
        try {
            await addBeneficio(editingPlan.idPlan, newBenefit);
            const updatedPlanes = await getPlanes();
            setPlanes(updatedPlanes);
            setEditingPlan(updatedPlanes.find(p => p.idPlan === editingPlan.idPlan));
            setNewBenefit('');
        } catch {
            alert('Error al agregar beneficio');
        }
    };

    const handleDeleteBenefit = async (idBeneficio) => {
        if (!window.confirm('¿Eliminar beneficio?')) return;
        try {
            await deleteBeneficio(idBeneficio);
            const updatedPlanes = await getPlanes();
            setPlanes(updatedPlanes);
            setEditingPlan(updatedPlanes.find(p => p.idPlan === editingPlan.idPlan));
        } catch {
            alert('Error al eliminar beneficio');
        }
    };

    const isOpen = Boolean(editingPlan);

    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        background: isOpen ? 'rgba(0,0,0,0.5)' : 'transparent',
        backdropFilter: isOpen ? 'blur(4px)' : 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: isOpen ? 9999 : -1,
        padding: '20px',
        pointerEvents: isOpen ? 'all' : 'none',
        visibility: isOpen ? 'visible' : 'hidden',
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0' }}>Cargando planes...</div>;

    return (
        <div>
            <div className="section-header">
                <h1>Planes de Suscripción</h1>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Plan</th>
                            <th>Precio</th>
                            <th>Duración (días)</th>
                            <th>Descuento</th>
                            <th>Oferta Activa</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planes.map(plan => (
                            <tr key={plan.idPlan}>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{plan.nombre}</td>
                                <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${plan.precio}</td>
                                <td>{plan.duracionDias}</td>
                                <td>
                                    {plan.descuento > 0
                                        ? <span className="badge badge-active">{plan.descuento}% off</span>
                                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                                    }
                                </td>
                                <td>
                                    {plan.ofertaActiva
                                        ? <span className="badge badge-active">Activa</span>
                                        : <span className="badge badge-hidden">Inactiva</span>
                                    }
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEditClick(plan)}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal siempre montado, visible/invisible via style */}
            <div style={overlayStyle}>
                <div className="modal-content modal-lg">
                    <div className="modal-header">
                        <h3>Editar Plan: {editingPlan?.nombre}</h3>
                        <button className="close-btn" onClick={handleClose}>×</button>
                    </div>

                    {editingPlan && (
                        <>
                            <div className="form-group-row">
                                <label>
                                    Nombre
                                    <input type="text" value={editingPlan.nombre} onChange={e => setEditingPlan({ ...editingPlan, nombre: e.target.value })} />
                                </label>
                                <label>
                                    Precio
                                    <input type="number" value={editingPlan.precio} onChange={e => setEditingPlan({ ...editingPlan, precio: e.target.value })} />
                                </label>
                            </div>

                            <div className="form-group-row">
                                <label>
                                    Duración (días)
                                    <input type="number" value={editingPlan.duracionDias} onChange={e => setEditingPlan({ ...editingPlan, duracionDias: e.target.value })} />
                                </label>
                                <label>
                                    Descuento (%)
                                    <input type="number" value={editingPlan.descuento} onChange={e => setEditingPlan({ ...editingPlan, descuento: e.target.value })} />
                                </label>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
                                    Oferta Activa
                                    <input type="checkbox" checked={editingPlan.ofertaActiva} onChange={e => setEditingPlan({ ...editingPlan, ofertaActiva: e.target.checked })} />
                                </label>
                            </div>

                            <div className="benefits-section">
                                <h4>Beneficios</h4>
                                <ul>
                                    {editingPlan.beneficios && editingPlan.beneficios.map(b => (
                                        <li key={b.idBeneficio}>
                                            <span>{b.descripcion}</span>
                                            <button className="btn-delete-sm" onClick={() => handleDeleteBenefit(b.idBeneficio)}>✕</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="add-benefit">
                                    <input
                                        type="text"
                                        placeholder="Nuevo beneficio..."
                                        value={newBenefit}
                                        onChange={e => setNewBenefit(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddBenefit()}
                                    />
                                    <button className="btn-primary-sm" onClick={handleAddBenefit}>+ Agregar</button>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={handleClose}>Cancelar</button>
                                <button className="btn-save" onClick={handleSave}>Guardar Cambios</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPlanes;
