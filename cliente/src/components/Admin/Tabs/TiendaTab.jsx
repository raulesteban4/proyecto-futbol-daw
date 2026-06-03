import { useState, useRef } from 'react';
import axios from 'axios';
import './tabs.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function TiendaTab({ data, setData }) {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get(`${API}/api/productos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar productos:", err));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        const file = fileRef.current?.files[0];
        if (!file) return null;
        setUploading(true);
        const token = localStorage.getItem('token_fc_canaveral');
        const formData = new FormData();
        formData.append('imagen', file);
        try {
            const res = await axios.post(`${API}/api/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            setPreview(null);
            if (fileRef.current) fileRef.current.value = '';
            setUploading(false);
            return res.data.url;
        } catch (err) {
            alert('Error al subir imagen');
            setUploading(false);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token_fc_canaveral');
        let imagenUrl = e.target.imagen_url.value || 'https://via.placeholder.com/150';

        if (fileRef.current?.files[0]) {
            const uploaded = await uploadImage();
            if (uploaded) imagenUrl = uploaded;
        }

        const producto = {
            nombre: e.target.nombre.value,
            precio: e.target.precio.value,
            stock: e.target.stock.value,
            categoria: e.target.categoria.value,
            descripcion: e.target.descripcion.value,
            imagen_url: imagenUrl,
        };
        axios.post(`${API}/api/admin/productos`, producto, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => {
            alert("Producto añadido");
            e.target.reset();
            setPreview(null);
            cargarDatos();
        });
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

        axios.put(`${API}/api/admin/productos/${id}`, actualizado, {
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
            axios.delete(`${API}/api/admin/productos/${id}`, {
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
            <form onSubmit={handleSubmit} className="tab-form-grid">
                <input name="nombre" placeholder="Nombre" required className="form-input" />
                <input name="precio" type="number" step="0.01" placeholder="Precio (€)" required className="form-input" />
                <input name="stock" type="number" placeholder="Stock" required className="form-input" />
                <input name="categoria" placeholder="Categoría" required className="form-input" />
                <input name="imagen_url" placeholder="URL Imagen (o sube un archivo)" className="form-input" />
                <div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="form-input"
                    />
                    {preview && (
                        <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                            <img src={preview} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                            <button
                                type="button"
                                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: '22px', textAlign: 'center' }}
                            >
                                x
                            </button>
                        </div>
                    )}
                </div>
                <textarea name="descripcion" placeholder="Descripción" className="form-input tab-form-grid.full-width" />
                <button type="submit" className="btn-ok tab-form-grid.full-width" disabled={uploading}>
                    {uploading ? 'Subiendo imagen...' : 'PUBLICAR PRODUCTO'}
                </button>
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
