import axios from 'axios';
import './tabs.css';

function TiendaTab({ data, setData }) {

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get('http://localhost:5000/api/productos', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar productos:", err));
    };

    const actualizarProducto = (id) => {
        const token = localStorage.getItem('token_fc_canaveral');
        const actualizado = {
            nombre: document.getElementById(`prod-nom-${id}`).value,
            precio: document.getElementById(`prod-pre-${id}`).value,
            stock: document.getElementById(`prod-stk-${id}`).value,
            categoria: document.getElementById(`prod-cat-${id}`).value,
            descripcion: document.getElementById(`prod-desc-${id}`).value,
            imagen_url: document.getElementById(`prod-img-${id}`).value
        };

        axios.put(`http://localhost:5000/api/admin/productos/${id}`, actualizado, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                alert("Producto actualizado con éxito");
                cargarDatos();
            })
            .catch(err => alert("Error al actualizar"));
    };

    const eliminarProducto = (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
            const token = localStorage.getItem('token_fc_canaveral');
            axios.delete(`http://localhost:5000/api/admin/productos/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(() => {
                    alert("Producto eliminado");
                    cargarDatos();
                });
        }
    };

    return (
        <div>
            <h3>Añadir Nuevo Producto</h3>
            <form onSubmit={(e) => {
                e.preventDefault();
                const token = localStorage.getItem('token_fc_canaveral');
                const producto = {
                    nombre: e.target.nombre.value,
                    precio: e.target.precio.value,
                    stock: e.target.stock.value,
                    categoria: e.target.categoria.value,
                    descripcion: e.target.descripcion.value,
                    imagen_url: e.target.imagen.value || 'https://via.placeholder.com/150'
                };
                axios.post('http://localhost:5000/api/admin/productos', producto, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(() => {
                    alert("Producto añadido");
                    e.target.reset();
                    cargarDatos();
                });
            }} className="tab-form-grid">
                <input name="nombre" placeholder="Nombre" required className="form-input" />
                <input name="precio" type="number" step="0.01" placeholder="Precio (€)" required className="form-input" />
                <input name="stock" type="number" placeholder="Stock" required className="form-input" />
                <input name="categoria" placeholder="Categoría" required className="form-input" />
                <input name="imagen" placeholder="URL Imagen" className="form-input" />
                <textarea name="descripcion" placeholder="Descripción" className="form-input tab-form-grid.full-width" />
                <button type="submit" className="btn-ok tab-form-grid.full-width">PUBLICAR PRODUCTO</button>
            </form>

            <h3>Gestionar Inventario</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Imagen / Info</th>
                        <th>Precio (€)</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(p => (
                        <tr key={p.id}>
                            <td>
                                <input id={`prod-nom-${p.id}`} defaultValue={p.nombre} className="form-input text-bold" style={{ marginBottom: '5px' }} />
                                <input id={`prod-cat-${p.id}`} defaultValue={p.categoria} className="form-input text-small" />
                                <input id={`prod-img-${p.id}`} defaultValue={p.imagen_url} className="form-input text-xsmall" placeholder="URL Imagen" style={{ marginTop: '5px' }} />
                                <textarea id={`prod-desc-${p.id}`} defaultValue={p.descripcion} className="form-input text-small" style={{ marginTop: '5px' }} />
                            </td>
                            <td className="text-center">
                                <input id={`prod-pre-${p.id}`} type="number" step="0.01" defaultValue={p.precio} className="stat-input" style={{ width: '70px' }} />
                            </td>
                            <td className="text-center">
                                <input
                                    id={`prod-stk-${p.id}`}
                                    type="number"
                                    defaultValue={p.stock}
                                    className="stat-input"
                                    style={{
                                        width: '60px',
                                        fontWeight: 'bold',
                                        color: p.stock < 5 ? '#ef4444' : '#1e293b',
                                        borderColor: p.stock < 5 ? '#f59e0b' : '#ddd'
                                    }}
                                />
                                {p.stock < 5 && <div className="text-error text-xsmall">¡Reponer!</div>}
                            </td>
                            <td className="text-center">
                                <button onClick={() => actualizarProducto(p.id)} className="btn-ok">Guardar</button>
                                <button onClick={() => eliminarProducto(p.id)} className="btn-delete btn-delete-margin">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TiendaTab;
