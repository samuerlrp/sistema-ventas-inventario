// Base de datos con localStorage
let productos = [];
let ventas = [];
let ultimaVenta = null;

// Cargar datos del localStorage
function cargarDatos() {
    const productosGuardados = localStorage.getItem('productos');
    const ventasGuardadas = localStorage.getItem('ventas');
    
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
    }
    
    if (ventasGuardadas) {
        ventas = JSON.parse(ventasGuardadas);
    }
}

// Guardar datos en localStorage
function guardarProductos() {
    localStorage.setItem('productos', JSON.stringify(productos));
}

function guardarVentas() {
    localStorage.setItem('ventas', JSON.stringify(ventas));
}

// Sistema de Login
const loginScreen = document.getElementById('loginScreen');
const mainSystem = document.getElementById('mainSystem');
const formLogin = document.getElementById('formLogin');

// Verificar si ya hay sesión activa
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('sesionActiva') === 'true') {
        mostrarSistema();
    }
});

// Manejar login
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('loginUsuario').value;
    const password = document.getElementById('loginPassword').value;
    
    const usuarioGuardado = localStorage.getItem('usuario');
    const passwordGuardada = localStorage.getItem('password');
    
    if (!usuarioGuardado || !passwordGuardada) {
        localStorage.setItem('usuario', usuario);
        localStorage.setItem('password', password);
        alert('✅ ¡Cuenta creada exitosamente!');
        mostrarSistema();
    } else {
        if (usuario === usuarioGuardado && password === passwordGuardada) {
            alert('✅ ¡Bienvenido de nuevo!');
            mostrarSistema();
        } else {
            alert('❌ Usuario o contraseña incorrectos');
        }
    }
});

function mostrarSistema() {
    localStorage.setItem('sesionActiva', 'true');
    loginScreen.style.display = 'none';
    mainSystem.style.display = 'block';
    
    cargarDatos();
    mostrarInventario();
    cargarProductosVenta();
    mostrarVentas();
    mostrarEstadisticas();
    verificarStockBajo();
    inicializarTabs();
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.setItem('sesionActiva', 'false');
        location.reload();
    }
}

// ALERTAS DE STOCK BAJO
function verificarStockBajo() {
    const productosStockBajo = productos.filter(p => p.cantidad <= 5 && p.cantidad > 0);
    const productosAgotados = productos.filter(p => p.cantidad === 0);
    
    const alertasDiv = document.getElementById('alertasStock');
    const alertaTexto = document.getElementById('alertaTexto');
    
    if (productosStockBajo.length > 0 || productosAgotados.length > 0) {
        let mensaje = '';
        if (productosAgotados.length > 0) {
            mensaje += `${productosAgotados.length} producto(s) agotado(s). `;
        }
        if (productosStockBajo.length > 0) {
            mensaje += `${productosStockBajo.length} producto(s) con stock bajo.`;
        }
        alertaTexto.textContent = mensaje;
        alertasDiv.style.display = 'block';
    } else {
        alertasDiv.style.display = 'none';
    }
    
    mostrarTablaStockBajo();
}

function cerrarAlerta() {
    document.getElementById('alertasStock').style.display = 'none';
}

function mostrarTablaStockBajo() {
    const tbody = document.getElementById('tablaStockBajo');
    const productosProblema = productos.filter(p => p.cantidad <= 5);
    
    if (productosProblema.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">✅ Todos los productos tienen stock suficiente</td></tr>';
        return;
    }
    
    tbody.innerHTML = productosProblema.map(p => {
        let estado = '';
        let clase = '';
        if (p.cantidad === 0) {
            estado = '🔴 Agotado';
            clase = 'stock-agotado';
        } else if (p.cantidad <= 5) {
            estado = '⚠️ Stock Bajo';
            clase = 'stock-bajo';
        }
        
        return `
            <tr class="${clase}">
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${p.cantidad}</td>
                <td><strong>${estado}</strong></td>
            </tr>
        `;
    }).join('');
}

// Inicializar sistema de pestañas
function inicializarTabs() {
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
            
            if (target === 'inventario') {
                mostrarInventario();
            } else if (target === 'ventas') {
                cargarProductosVenta();
                mostrarVentas();
            } else if (target === 'estadisticas') {
                mostrarEstadisticas();
                verificarStockBajo();
            } else if (target === 'graficas') {
                mostrarGraficas();
            }
        });
    });
}

// INVENTARIO CON BÚSQUEDA Y FILTROS
document.getElementById('formProducto').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const producto = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value,
        precio: parseFloat(document.getElementById('precio').value),
        cantidad: parseInt(document.getElementById('cantidad').value),
        categoria: document.getElementById('categoria').value
    };
    
    productos.push(producto);
    guardarProductos();
    e.target.reset();
    mostrarInventario();
    verificarStockBajo();
    alert('✅ Producto agregado exitosamente');
});

// Búsqueda y filtros en tiempo real
document.getElementById('buscarProducto').addEventListener('input', filtrarProductos);
document.getElementById('filtroCategoria').addEventListener('change', filtrarProductos);
document.getElementById('filtroStock').addEventListener('change', filtrarProductos);

function filtrarProductos() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    const stock = document.getElementById('filtroStock').value;
    
    let productosFiltrados = productos.filter(p => {
        const cumpleBusqueda = p.nombre.toLowerCase().includes(busqueda);
        const cumpleCategoria = !categoria || p.categoria === categoria;
        
        let cumpleStock = true;
        if (stock === 'bajo') cumpleStock = p.cantidad <= 5 && p.cantidad > 0;
        if (stock === 'disponible') cumpleStock = p.cantidad > 5;
        if (stock === 'agotado') cumpleStock = p.cantidad === 0;
        
        return cumpleBusqueda && cumpleCategoria && cumpleStock;
    });
    
    mostrarInventario(productosFiltrados);
}

function mostrarInventario(productosMostrar = productos) {
    const tbody = document.getElementById('tablaProductos');
    
    if (productosMostrar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay productos que coincidan con los filtros</td></tr>';
        return;
    }
    
    tbody.innerHTML = productosMostrar.map(p => {
        let clase = '';
        if (p.cantidad === 0) clase = 'stock-agotado';
        else if (p.cantidad <= 5) clase = 'stock-bajo';
        
        return `
            <tr class="${clase}">
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>${p.cantidad}</td>
                <td>$${(p.precio * p.cantidad).toFixed(2)}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarProductos();
        mostrarInventario();
        verificarStockBajo();
        alert('✅ Producto eliminado');
    }
}

// VENTAS
function cargarProductosVenta() {
    const select = document.getElementById('productoVenta');
    
    if (productos.length === 0) {
        select.innerHTML = '<option value="">No hay productos disponibles</option>';
        return;
    }
    
    select.innerHTML = '<option value="">Seleccionar producto</option>' + 
        productos.filter(p => p.cantidad > 0).map(p => 
            `<option value="${p.id}">${p.nombre} - $${p.precio} (Stock: ${p.cantidad})</option>`
        ).join('');
}

document.getElementById('productoVenta').addEventListener('change', (e) => {
    const producto = productos.find(p => p.id == e.target.value);
    if (producto) {
        document.getElementById('precioVenta').value = producto.precio;
        document.getElementById('cantidadVenta').max = producto.cantidad;
        document.getElementById('cantidadVenta').value = '';
        document.getElementById('totalVenta').value = '';
    }
});

document.getElementById('cantidadVenta').addEventListener('input', (e) => {
    const precio = parseFloat(document.getElementById('precioVenta').value) || 0;
    const cantidad = parseInt(e.target.value) || 0;
    document.getElementById('totalVenta').value = (precio * cantidad).toFixed(2);
});

document.getElementById('formVenta').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productoId = parseInt(document.getElementById('productoVenta').value);
    const cantidad = parseInt(document.getElementById('cantidadVenta').value);
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        alert('❌ Selecciona un producto');
        return;
    }
    
    if (cantidad > producto.cantidad) {
        alert('❌ No hay suficiente stock. Stock disponible: ' + producto.cantidad);
        return;
    }
    
    const venta = {
        id: Date.now(),
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        total: cantidad * producto.precio,
        fecha: new Date().toLocaleString('es-PE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    ventas.push(venta);
    producto.cantidad -= cantidad;
    ultimaVenta = venta;
    
    guardarVentas();
    guardarProductos();
    
    e.target.reset();
    mostrarVentas();
    cargarProductosVenta();
    mostrarInventario();
    mostrarEstadisticas();
    verificarStockBajo();
    
    document.getElementById('btnImprimir').style.display = 'inline-block';
    alert('✅ Venta registrada exitosamente\n\nTotal: $' + venta.total.toFixed(2));
});

// Búsqueda de ventas
document.getElementById('buscarVenta').addEventListener('input', filtrarVentas);
document.getElementById('filtroFecha').addEventListener('change', filtrarVentas);

function filtrarVentas() {
    const busqueda = document.getElementById('buscarVenta').value.toLowerCase();
    const fecha = document.getElementById('filtroFecha').value;
    
    let ventasFiltradas = ventas.filter(v => {
        const cumpleBusqueda = v.productoNombre.toLowerCase().includes(busqueda);
        const cumpleFecha = !fecha || v.fecha.includes(fecha.split('-').reverse().join('/'));
        return cumpleBusqueda && cumpleFecha;
    });
    
    mostrarVentas(ventasFiltradas);
}

function mostrarVentas(ventasMostrar = ventas) {
    const tbody = document.getElementById('tablaVentas');
    
    if (ventasMostrar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay ventas que coincidan con los filtros</td></tr>';
        return;
    }
    
    const ventasOrdenadas = [...ventasMostrar].reverse();
    
    tbody.innerHTML = ventasOrdenadas.map(v => `
        <tr>
            <td>${v.fecha}</td>
            <td>${v.productoNombre}</td>
            <td>${v.cantidad}</td>
            <td>$${v.precioUnitario.toFixed(2)}</td>
            <td><strong>$${v.total.toFixed(2)}</strong></td>
        </tr>
    `).join('');
}

// IMPRIMIR TICKET
function imprimirTicket() {
    if (!ultimaVenta) {
        alert('❌ No hay ninguna venta reciente para imprimir');
        return;
    }
    
    document.getElementById('ticketFecha').textContent = ultimaVenta.fecha;
    document.getElementById('ticketProducto').textContent = ultimaVenta.productoNombre;
    document.getElementById('ticketCantidad').textContent = ultimaVenta.cantidad;
    document.getElementById('ticketPrecio').textContent = ultimaVenta.precioUnitario.toFixed(2);
    document.getElementById('ticketTotal').textContent = ultimaVenta.total.toFixed(2);
    
    window.print();
}

// ESTADÍSTICAS
function mostrarEstadisticas() {
    const totalProductos = productos.reduce((sum, p) => sum + p.cantidad, 0);
    const valorInventario = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const cantidadVentas = ventas.length;
    
    document.getElementById('totalProductos').textContent = totalProductos;
    document.getElementById('valorInventario').textContent = '$' + valorInventario.toFixed(2);
    document.getElementById('totalVentas').textContent = '$' + totalVentas.toFixed(2);
    document.getElementById('cantidadVentas').textContent = cantidadVentas;
}

// GRÁFICAS
let graficaVentasDiarias, graficaProductos, graficaCategorias;

function mostrarGraficas() {
    crearGraficaVentasDiarias();
    crearGraficaProductosMasVendidos();
    crearGraficaVentasPorCategoria();
}

function crearGraficaVentasDiarias() {
    const ctx = document.getElementById('graficaVentasDiarias');
    
    // Agrupar ventas por fecha
    const ventasPorDia = {};
    ventas.forEach(v => {
        const fecha = v.fecha.split(',')[0];
        ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + v.total;
    });
    
    const fechas = Object.keys(ventasPorDia).slice(-7);
    const totales = fechas.map(f => ventasPorDia[f]);
    
    if (graficaVentasDiarias) graficaVentasDiarias.destroy();
    
    graficaVentasDiarias = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                label: 'Ventas ($)',
                data: totales,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function crearGraficaProductosMasVendidos() {
    const ctx = document.getElementById('graficaProductos');
    
    // Contar productos vendidos
    const productosVendidos = {};
    ventas.forEach(v => {
        productosVendidos[v.productoNombre] = (productosVendidos[v.productoNombre] || 0) + v.cantidad;
    });
    
    const nombres = Object.keys(productosVendidos).slice(0, 5);
    const cantidades = nombres.map(n => productosVendidos[n]);
    
    if (graficaProductos) graficaProductos.destroy();
    
    graficaProductos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nombres,
            datasets: [{
                label: 'Unidades Vendidas',
                data: cantidades,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function crearGraficaVentasPorCategoria() {
    const ctx = document.getElementById('graficaCategorias');
    
    // Agrupar ventas por categoría
    const ventasPorCategoria = {};
    ventas.forEach(v => {
        const producto = productos.find(p => p.id === v.productoId);
        if (producto) {
            ventasPorCategoria[producto.categoria] = (ventasPorCategoria[producto.categoria] || 0) + v.total;
        }
    });
    
    const categorias = Object.keys(ventasPorCategoria);
    const totales = categorias.map(c => ventasPorCategoria[c]);
    
    if (graficaCategorias) graficaCategorias.destroy();
    
    graficaCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categorias,
            datasets: [{
                data: totales,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#f9d423'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
