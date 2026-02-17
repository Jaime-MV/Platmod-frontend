import { useState, useEffect } from 'react';
import { getPlanes, updatePlan, addBeneficio, deleteBeneficio } from '../../services/api';
import './AdminStyles.css';

const AdminPlanes = () => {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [newBenefit, setNewBenefit] = useState("");

    useEffect(() => {
        loadPlanes();
    }, []);

    const loadPlanes = async () => {
        setLoading(true);
        const data = await getPlanes();
        setPlanes(data);
        setLoading(false);
    };

    const handleEditClick = (plan) => {
        setEditingPlan({ ...plan });
        setNewBenefit("");
    };

    const handleSave = async () => {
        try {
            await updatePlan(editingPlan.idPlan, editingPlan);
            alert("Plan actualizado correctamente");
            setEditingPlan(null);
            loadPlanes();
        } catch (error) {
            alert("Error al actualizar plan");
        }
    };

    const handleAddBenefit = async () => {
        if (!newBenefit.trim()) return;
        try {
            await addBeneficio(editingPlan.idPlan, newBenefit);
            // Recargar planes para actualizar la lista de beneficios
            // Podríamos optimizarlo actualizando el estado local, pero recargar es más seguro por ahora
            const updatedPlanes = await getPlanes();
            setPlanes(updatedPlanes);

            // Actualizar también el plan en edición para verlo reflejado en el modal
            const updatedPlan = updatedPlanes.find(p => p.idPlan === editingPlan.idPlan);
            setEditingPlan(updatedPlan);

            setNewBenefit("");
        } catch (error) {
            alert("Error al agregar beneficio");
        }
    };

    const handleDeleteBenefit = async (idBeneficio) => {
        if (!window.confirm("¿Eliminar beneficio?")) return;
        try {
            await deleteBeneficio(idBeneficio);
            // Recargar planes 
            const updatedPlanes = await getPlanes();
            setPlanes(updatedPlanes);

            // Actualizar plan en edición
            const updatedPlan = updatedPlanes.find(p => p.idPlan === editingPlan.idPlan);
            setEditingPlan(updatedPlan);
        } catch (error) {
            alert("Error al eliminar beneficio");
        }
    };

    if (loading) return <div>Cargando planes...</div>;

    return (
        <div className="admin-container">
            <h2>Gestión de Planes de Suscripción</h2>

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
                                <td>{plan.nombre}</td>
                                <td>${plan.precio}</td>
                                <td>{plan.duracionDias}</td>
                                <td>{plan.descuento > 0 ? `${plan.descuento}%` : '-'}</td>
                                <td>{plan.ofertaActiva ? '✅ SI' : '❌ NO'}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEditClick(plan)}>Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingPlan && (
                <div className="modal-overlay">
                    <div className="modal-content modal-lg">
                        <h3>Editar Plan: {editingPlan.nombre}</h3>

                        <div className="form-group-row">
                            <label>Nombre:
                                <input type="text" value={editingPlan.nombre} onChange={e => setEditingPlan({ ...editingPlan, nombre: e.target.value })} />
                            </label>
                            <label>Precio:
                                <input type="number" value={editingPlan.precio} onChange={e => setEditingPlan({ ...editingPlan, precio: e.target.value })} />
                            </label>
                        </div>

                        <div className="form-group-row">
                            <label>Duración (días):
                                <input type="number" value={editingPlan.duracionDias} onChange={e => setEditingPlan({ ...editingPlan, duracionDias: e.target.value })} />
                            </label>
                        </div>

                        <div className="form-group-row" style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
                            <label>Descuento (%):
                                <input type="number" value={editingPlan.descuento} onChange={e => setEditingPlan({ ...editingPlan, descuento: e.target.value })} />
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                Oferta Activa:
                                <input type="checkbox" checked={editingPlan.ofertaActiva} onChange={e => setEditingPlan({ ...editingPlan, ofertaActiva: e.target.checked })} />
                            </label>
                        </div>

                        <div className="benefits-section" style={{ marginTop: '20px' }}>
                            <h4>Beneficios</h4>
                            <ul>
                                {editingPlan.beneficios && editingPlan.beneficios.map(b => (
                                    <li key={b.idBeneficio} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        {b.descripcion}
                                        <button className="btn-delete-sm" onClick={() => handleDeleteBenefit(b.idBeneficio)}>❌</button>
                                    </li>
                                ))}
                            </ul>
                            <div className="add-benefit">
                                <input
                                    type="text"
                                    placeholder="Nuevo beneficio..."
                                    value={newBenefit}
                                    onChange={e => setNewBenefit(e.target.value)}
                                    style={{ width: '70%', padding: '5px' }}
                                />
                                <button className="btn-primary-sm" onClick={handleAddBenefit} style={{ marginLeft: '10px' }}>Agregar</button>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setEditingPlan(null)}>Cancelar</button>
                            <button className="btn-save" onClick={handleSave}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlanes;
