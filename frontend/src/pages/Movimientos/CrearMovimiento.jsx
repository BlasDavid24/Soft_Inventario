import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { obtenerProveedoresApi } from '../../api/proveedor.api';
import { obtenerCatalogoProductosApi } from '../../api/producto.api';
import { crearMovimientoApi } from '../../api/movimiento.api';
import '../../styles/Movimientos/CrearMovimiento.css';

export default function CrearMovimiento() {
    const navigate = useNavigate();

    // 1. Obtener usuario de la sesión actual (no editable)
    const usuarioSesion = useMemo(() => {
        try {
            const storedUser = localStorage.getItem('usuario');
            if (storedUser) return JSON.parse(storedUser);
        } catch {
        }
        return { id: 1, nombre: 'Prueba Dos', rol: 'ENCARGADO' };
    }, []);

    // Formateador de fecha/hora inicial
    const obtenerFechaHoraActual = () => {
        const ahora = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(ahora.getDate())}-${pad(ahora.getMonth() + 1)}-${ahora.getFullYear()} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
    };

    const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA');
    const [fechaHora] = useState(obtenerFechaHoraActual());
    const [proveedorId, setProveedorId] = useState('');
    const [motivo, setMotivo] = useState('');

    // Listas de datos maestros desde el backend
    const [proveedores, setProveedores] = useState([]);
    const [productosDisponibles, setProductosDisponibles] = useState([]);

    //Estados de la búsqueda y agregador de productos
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidadInput, setCantidadInput] = useState(1);
    const [costoUnitarioInput, setCostoUnitarioInput] = useState('');
    const dropdownRef = useRef(null);

    //Lista de productos añadidos al movimiento
    const [productosMovimiento, setProductosMovimiento] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [errorValidacion, setErrorValidacion] = useState('');

    // 1. Agrega este estado arriba con tus otros useState:
    const [tipoDropdownAbierto, setTipoDropdownAbierto] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    // 2. Configuración de opciones con iconos y colores dinámicos:
    const OPCIONES_TIPO = [
        {
            valor: 'ENTRADA',
            texto: 'ENTRADA',
            clase: 'tipo-pill-entrada',
            icono: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
            ),
        },
        {
            valor: 'SALIDA',
            texto: 'SALIDA',
            clase: 'tipo-pill-salida',
            icono: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
            ),
        },
        {
            valor: 'DEVOLUCION CLIENTE',
            texto: 'DEV. CLIENTE',
            clase: 'tipo-pill-dev-cliente',
            icono: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14 4 9l5-5" />
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                </svg>
            ),
        },
        {
            valor: 'DEVOLUCION PROVEEDOR',
            texto: 'DEV. PROVEEDOR',
            clase: 'tipo-pill-dev-proveedor',
            icono: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                </svg>
            ),
        },
        {
            valor: 'AJUSTE',
            texto: 'AJUSTE',
            clase: 'tipo-pill-ajuste',
            icono: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 7-5 5 5 5" />
                    <path d="M3 12h18" />
                    <path d="m16 17 5-5-5-5" />
                    <path d="M21 12H3" />
                </svg>
            ),
        },
    ];

    const tipoActual = OPCIONES_TIPO.find((t) => t.valor === tipoMovimiento) || OPCIONES_TIPO[0];

    // Cargar Proveedores y Productos existentes al montar
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [dataProv, dataProd] = await Promise.all([
                    obtenerProveedoresApi().catch(() => []),
                    obtenerCatalogoProductosApi().catch(() => []),
                ]);

                const listaProveedores = Array.isArray(dataProv) ? dataProv : (dataProv?.data || []);
                setProveedores(listaProveedores);
                const listaProductos = Array.isArray(dataProd) ? dataProd : (dataProd?.data || []);
                setProductosDisponibles(listaProductos);
            } catch (err) {
                console.error('Error al cargar catálogos:', err);
            }
        };

        cargarCatalogos();
    }, []);

    // Cerrar el dropdown al hacer click fuera
    useEffect(() => {
        const handleClickAfuera = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickAfuera);
        return () => document.removeEventListener('mousedown', handleClickAfuera);
    }, []);

    // Filtro reactivo para la búsqueda predictiva
    const productosFiltrados = useMemo(() => {
        const term = busquedaProducto.trim().toLowerCase();
        if (!term) return [];
        return productosDisponibles.filter(
            (p) =>
                (p.nombre && p.nombre.toLowerCase().includes(term)) ||
                (p.sku && p.sku.toLowerCase().includes(term))
        );
    }, [busquedaProducto, productosDisponibles]);

    // Selección de producto en el buscador
    const handleSeleccionarProducto = (prod) => {
        setProductoSeleccionado(prod);
        setBusquedaProducto(prod.nombre);
        setCostoUnitarioInput(prod.precio_costo || prod.costo || 0);
        setDropdownAbierto(false);
    };

    // Agregar producto a la lista del movimiento
    const handleAgregarProducto = () => {
        if (!productoSeleccionado) {
            setErrorValidacion('Debes seleccionar un producto del catálogo.');
            return;
        }
        const cant = Number(cantidadInput);
        const costo = Number(costoUnitarioInput);

        if (cant <= 0) {
            setErrorValidacion('La cantidad debe ser mayor a 0.');
            return;
        }
        if (costo < 0) {
            setErrorValidacion('El costo unitario no puede ser negativo.');
            return;
        }

        // Verificar si ya existe en la lista para acumular o agregar
        const existeIndex = productosMovimiento.findIndex(
            (item) => item.producto.id === productoSeleccionado.id
        );

        if (existeIndex >= 0) {
            const actualizados = [...productosMovimiento];
            actualizados[existeIndex].cantidad += cant;
            actualizados[existeIndex].costo_unitario = costo;
            actualizados[existeIndex].costo_total =
                actualizados[existeIndex].cantidad * costo;
            setProductosMovimiento(actualizados);
        } else {
            setProductosMovimiento([
                ...productosMovimiento,
                {
                    producto: productoSeleccionado,
                    cantidad: cant,
                    costo_unitario: costo,
                    costo_total: cant * costo,
                },
            ]);
        }

        // Limpiar campos de inserción
        setProductoSeleccionado(null);
        setBusquedaProducto('');
        setCantidadInput(1);
        setCostoUnitarioInput('');
        setErrorValidacion('');
    };

    // Eliminar un producto de la tabla
    const handleEliminarItem = (index) => {
        setProductosMovimiento(productosMovimiento.filter((_, i) => i !== index));
    };

    // 5. Cálculos reactivos para el Resumen del Movimiento
    const totalProductosDistintos = productosMovimiento.length;

    const totalUnidades = useMemo(() => {
        return productosMovimiento.reduce((acc, curr) => acc + Number(curr.cantidad || 0), 0);
    }, [productosMovimiento]);

    const costoTotalMovimiento = useMemo(() => {
        return productosMovimiento.reduce((acc, curr) => acc + Number(curr.costo_total || 0), 0);
    }, [productosMovimiento]);

    const proveedorSeleccionadoNombre = useMemo(() => {
        const prov = proveedores.find((p) => String(p.id) === String(proveedorId));
        return prov ? prov.nombre : 'No aplica / Sin proveedor';
    }, [proveedores, proveedorId]);

    const formatearPrecio = (valor) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(Number(valor) || 0);
    };

    // 6. Guardar Movimiento en la Base de Datos
    const handleGuardarMovimiento = async () => {
        // 1. Validaciones previas
        if (productosMovimiento.length === 0) {
            setErrorValidacion('Debes agregar al menos un producto al movimiento.');
            return;
        }

        if (tipoMovimiento === 'ENTRADA' && !proveedorId) {
            setErrorValidacion('En movimientos de ENTRADA debes seleccionar un proveedor.');
            return;
        }

        setGuardando(true);
        setErrorValidacion('');

        // 2. Construcción del payload
        const payload = {
            tipo: tipoMovimiento,
            proveedor_id: tipoMovimiento === 'ENTRADA' ? Number(proveedorId) : null,
            motivo: motivo.trim() || 'Sin motivo',
            detalles: productosMovimiento.map((item) => ({
                producto_id: item.producto.id,
                cantidad: Number(item.cantidad),
                costo_unitario: Number(item.costo_unitario || 0),
            })),
        };

        // 3. Ejecución con la API personalizada
        try {
            await crearMovimientoApi(payload);
            setTimeout(() => {
                setMensajeExito('');
                navigate(`/movimientos`);
            }, 550)
        } catch (err) {
            console.error('Error al guardar movimiento:', err);
            setErrorValidacion(
                err.response?.data?.detail || 'No se pudo guardar el movimiento. Revisa los datos.'
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="crear-mov-page">
            {/* Encabezado */}
            <PageHeader
                titulo="Crear Movimiento"
                subtitulo="Registra un nuevo movimiento de inventario agregando los detalles e informacion correspondiente."
                rutaVolver={() => navigate('/movimientos')}
            >
            </PageHeader>

            {/* Grid Principal: 2 Columnas (Izquierda: Formulario + Tabla / Derecha: Resumen + Reglas) */}
            <div className="crear-mov-main-grid">
                {/* COLUMNA IZQUIERDA */}
                <div className="crear-mov-col-izquierda">
                    {/* Card 1: Información del Movimiento */}
                    <div className="card-seccion">
                        <div className="card-seccion-header">
                            <div className="header-icon-box blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h2 className="card-seccion-titulo">Información del Movimiento</h2>
                        </div>

                        <div className="form-info-grid">
                            {/* Tipo de Movimiento con estilo idéntico a la imagen */}
                            <div className="form-group custom-select-container">
                                <label className="form-label">
                                    Tipo de Movimiento <span className="req">*</span>
                                </label>

                                {/* Botón que emula el selector cerrado */}
                                <div
                                    className={`custom-select-trigger ${tipoActual.clase}`}
                                    onClick={() => setTipoDropdownAbierto(!tipoDropdownAbierto)}
                                >
                                    <div className="trigger-content-left">
                                        <span className="trigger-icon">{tipoActual.icono}</span>
                                        <span className="trigger-text">{tipoActual.texto}</span>
                                    </div>
                                    <svg
                                        className={`chevron-icon ${tipoDropdownAbierto ? 'rotado' : ''}`}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>

                                {/* Menú desplegable */}
                                {tipoDropdownAbierto && (
                                    <div className="custom-select-menu">
                                        {OPCIONES_TIPO.map((opcion) => (
                                            <div
                                                key={opcion.valor}
                                                className={`custom-select-opcion ${opcion.clase} ${tipoMovimiento === opcion.valor ? 'seleccionada' : ''
                                                    }`}
                                                onClick={() => {
                                                    setTipoMovimiento(opcion.valor);
                                                    setTipoDropdownAbierto(false);
                                                }}
                                            >
                                                <span className="trigger-icon">{opcion.icono}</span>
                                                <span className="trigger-text">{opcion.texto}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fecha y Hora */}
                            <div className="form-group">
                                <label className="form-label">
                                    Fecha y Hora <span className="req">*</span>
                                </label>
                                <div className="input-con-icono">
                                    <input
                                        type="text"
                                        className="form-control input-readonly"
                                        value={fechaHora}
                                        readOnly
                                    />
                                    <svg className="input-icon-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                            </div>

                            {/* Usuario */}
                            <div className="form-group">
                                <label className="form-label">
                                    Usuario <span className="req">*</span>
                                </label>
                                <div className="input-con-icono">
                                    <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <input
                                        type="text"
                                        className="form-control input-readonly"
                                        value={usuarioSesion.nombre}
                                        readOnly
                                        title="El usuario se toma automáticamente de la sesión activa"
                                    />
                                </div>
                            </div>

                            {/* Proveedor */}
                            <div className="form-group form-col-proveedor">
                                <label className="form-label">
                                    Proveedor {tipoMovimiento === 'ENTRADA' && <span className="req">*</span>}
                                </label>
                                <div className="proveedor-row">
                                    <div className="input-con-icono flex-1">
                                        <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="3" width="15" height="13" />
                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                        </svg>
                                        <select
                                            className="form-control"
                                            value={proveedorId}
                                            onChange={(e) => setProveedorId(e.target.value)}
                                            disabled={['SALIDA', 'AJUSTE', 'DEVOLUCION CLIENTE'].includes(tipoMovimiento)}
                                        >
                                            <option value="" disabled hidden>Selecciona un proveedor...</option>
                                            {proveedores.map((prov) => (
                                                <option key={prov.id} value={prov.id}>
                                                    {prov.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-nuevo-proveedor"
                                        onClick={() => navigate('/proveedores')}
                                    >
                                        + Nuevo Proveedor
                                    </button>
                                </div>
                            </div>

                            {/* Motivo */}
                            <div className="form-group form-col-motivo">
                                <label className="form-label">
                                    Motivo <span className="req">*</span>
                                </label>
                                <div className="input-con-icono">
                                    <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <textarea
                                        className="textarea-motivo"
                                        placeholder="Escribe el motivo o detalle del movimiento..."
                                        rows={1}
                                        value={motivo}
                                        onChange={(e) => {
                                            setMotivo(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Agregar Productos */}
                    <div className="card-seccion">
                        <div className="card-seccion-header">
                            <div className="header-icon-box blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                    <path d="m3.3 7 8.7 5 8.7-5" />
                                    <path d="M12 12v10" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="card-seccion-titulo">Agregar Productos</h2>
                                <p className="card-seccion-sub">
                                    Buscá un producto, define la cantidad y el costo unitario. Puedes agregar varios productos al movimiento.
                                </p>
                            </div>
                        </div>

                        <div className="agregar-prod-inputs-row">
                            {/* 1. Buscador */}
                            <div className="prod-input-buscar" ref={dropdownRef}>
                                <label className="form-label">
                                    Buscar Producto (nombre o SKU) <span className="req">*</span>
                                </label>
                                <div className="input-con-icono">
                                    <svg className="input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Escribe el nombre o SKU..."
                                        value={busquedaProducto}
                                        onChange={(e) => {
                                            setBusquedaProducto(e.target.value);
                                            setDropdownAbierto(true);
                                        }}
                                        onFocus={() => setDropdownAbierto(true)}
                                    />
                                    {busquedaProducto && (
                                        <button
                                            type="button"
                                            className="btn-limpiar-busqueda"
                                            onClick={() => {
                                                setBusquedaProducto('');
                                                setProductoSeleccionado(null);
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Predictivo flotante */}
                                {dropdownAbierto && busquedaProducto && (
                                    <div className="predictivo-dropdown">
                                        {productosFiltrados.length === 0 ? (
                                            <div className="predictivo-vacio">
                                                <span>No se encontraron productos coincidentes.</span>
                                            </div>
                                        ) : (
                                            productosFiltrados.map((prod) => (
                                                <div
                                                    key={prod.id}
                                                    className="predictivo-item"
                                                    onClick={() => handleSeleccionarProducto(prod)}
                                                >

                                                    <div className="predictivo-info">
                                                        <span className="pred-nombre">{prod.nombre}</span>
                                                        <span className="pred-sku-stock">
                                                            SKU: {prod.sku || 'S/N'} | Stock actual: {Number(prod.stock_actual ?? 0)} {prod.unidad_medida || 'UNIDAD'}
                                                        </span>
                                                    </div>
                                                    <span className="pred-badge-categoria">
                                                        {prod.categoria?.nombre || 'General'}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 2. Cantidad */}
                            <div className="prod-input-cant">
                                <label className="form-label">
                                    Cantidad <span className="req">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control text-center"
                                    value={cantidadInput}
                                    onChange={(e) => setCantidadInput(e.target.value)}
                                />
                            </div>

                            {/* 3. Costo Unitario */}
                            <div className="prod-input-costo">
                                <label className="form-label">
                                    Costo Unitario<span className="req">*</span>
                                </label>
                                <div className="input-con-icono">
                                    <span className="input-prefix-sign">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control input-with-prefix"
                                        placeholder="0"
                                        value={costoUnitarioInput}
                                        onChange={(e) => setCostoUnitarioInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 4. Columna Derecha con ambos botones (Crear arriba con texto, Agregar abajo) */}
                            <div className="prod-botones-lateral">
                                <div className="prod-box-crear">
                                    <button
                                        type="button"
                                        className="btn-crear-prod-outline"
                                        onClick={() => navigate('/productos')}
                                    >
                                        + Crear Producto
                                    </button>
                                    <span className="subtexto-crear-prod">
                                        ¿No encuentras el producto?<br />Puedes crearlo aquí
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn-agregar-carrito"
                                    onClick={handleAgregarProducto}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    <span>Agregar</span>
                                </button>
                            </div>
                        </div>

                        {/* Tabla de Productos Agregados */}
                        <div className="tabla-mov-wrapper">
                            <table className="tabla-mov">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ textAlign: 'center' }}>PRODUCTO</th>
                                        <th style={{ textAlign: 'center' }}>SKU</th>
                                        <th style={{ textAlign: 'center' }}>CATEGORÍA</th>
                                        <th style={{ textAlign: 'center' }}>TIPO</th>
                                        <th style={{ textAlign: 'center' }}>CANTIDAD</th>
                                        <th style={{ textAlign: 'center' }}>COSTO UNITARIO</th>
                                        <th style={{ textAlign: 'center' }}>TOTAL</th>
                                        <th style={{ width: '70px', textAlign: 'center' }}>ACCION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosMovimiento.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="tabla-vacia-msg">
                                                Aún no se han agregado productos a este movimiento.
                                            </td>
                                        </tr>
                                    ) : (
                                        productosMovimiento.map((item, index) => {
                                            const prod = item.producto;
                                            const catNombre = prod.categoria?.nombre || 'General';

                                            return (
                                                <tr key={prod.id || index}>
                                                    <td className="td-muted">{index + 1}</td>
                                                    <td>
                                                        <div className="prod-fila-cell">

                                                            <span className="prod-fila-nombre">{prod.nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="td-sku">{prod.sku || '—'}</td>
                                                    <td>
                                                        <span className="categoria-tag">{catNombre}</span>
                                                    </td>
                                                    <td className="td-muted">{prod.uni_medida || 'UNIDAD'}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '700' }}>
                                                        {item.cantidad}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {formatearPrecio(item.costo_unitario)}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                                                        {formatearPrecio(item.costo_total)}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            className="btn-accion-delete"
                                                            title="Eliminar fila"
                                                            onClick={() => handleEliminarItem(index)}
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: RESUMEN Y REGLAS */}
                <div className="crear-mov-col-derecha">
                    {/* Card: Resumen del Movimiento (Reactivo) */}
                    <div className="card-seccion card-resumen-sidebar">
                        <div className="card-seccion-header">
                            <div className="header-icon-box blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="4" y="2" width="16" height="20" rx="2" />
                                    <line x1="8" y1="6" x2="16" y2="6" />
                                    <line x1="16" y1="14" x2="16" y2="18" />
                                    <path d="M16 10h.01" />
                                    <path d="M12 10h.01" />
                                    <path d="M8 10h.01" />
                                    <path d="M12 14h.01" />
                                    <path d="M8 14h.01" />
                                    <path d="M12 18h.01" />
                                    <path d="M8 18h.01" />
                                </svg>
                            </div>
                            <h2 className="card-seccion-titulo">Resumen del Movimiento</h2>
                        </div>

                        <div className="resumen-filas-lista">
                            {/* Tipo */}
                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                    Tipo
                                </span>
                                <span className={`badge-resumen-tipo tipo-${tipoMovimiento.toLowerCase()}`}>
                                    {tipoMovimiento === 'ENTRADA' ? '↓ ENTRADA' : tipoMovimiento}
                                </span>
                            </div>

                            {/* Fecha */}
                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    </svg>
                                    Fecha
                                </span>
                                <span className="resumen-val">{fechaHora}</span>
                            </div>

                            {/* Usuario */}
                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Usuario
                                </span>
                                <span className="resumen-val">{usuarioSesion.nombre}</span>
                            </div>

                            {/* Proveedor */}
                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="3" width="15" height="13" />
                                    </svg>
                                    Proveedor
                                </span>
                                <span className="resumen-val">{proveedorSeleccionadoNombre}</span>
                            </div>

                            {/* Motivo */}
                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    </svg>
                                    Motivo
                                </span>
                                <span className="resumen-val">{motivo || '—'}</span>
                            </div>

                            <div className="resumen-divider" />

                            {/* Métricas calculadas */}
                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    </svg>
                                    Total de Productos
                                </span>
                                <span className="resumen-val-bold">{totalProductosDistintos}</span>
                            </div>

                            <div className="resumen-fila">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    Total de Unidades
                                </span>
                                <span className="resumen-val-bold">{totalUnidades}</span>
                            </div>

                            {/* Costo Total */}
                            <div className="resumen-fila resumen-costo-total-box">
                                <span className="resumen-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v12M15 9.5H9.5a2.5 2.5 0 0 1 0-5H14" />
                                    </svg>
                                    Costo Total
                                </span>
                                <span className="resumen-costo-pill">
                                    {formatearPrecio(costoTotalMovimiento)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card: Reglas y Consideraciones */}
                    <div className="card-seccion card-reglas">
                        <div className="card-seccion-header">
                            <div className="header-icon-box blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </div>
                            <h2 className="card-seccion-titulo">Reglas y Consideraciones</h2>
                        </div>

                        <ul className="reglas-lista">
                            <li>
                                En movimientos de <strong>ENTRADA</strong> debe seleccionarse un proveedor.
                            </li>
                            <li>
                                En movimientos de <strong>SALIDA</strong> no es obligatorio seleccionar proveedor.
                            </li>
                            <li>No se permiten cantidades negativas.</li>
                            <li>Si el producto no existe, puedes crearlo desde aquí.</li>
                            <li>
                                El stock se actualizará automáticamente al guardar el movimiento.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Barra Inferior de Acción */}
            <div className="crear-mov-footer-actions">
                <button
                    type="button"
                    className="btn-guardar-principal"
                    onClick={handleGuardarMovimiento}
                    disabled={guardando}
                >
                    {guardando ? 'Guardando Movimiento...' : 'Guardar Movimiento'}
                </button>
            </div>

            {mensajeExito && <div className="alerta-success">{mensajeExito}</div>}
            {errorValidacion && <div className="alerta-error-box">{errorValidacion}</div>}
        </div>
    );
}