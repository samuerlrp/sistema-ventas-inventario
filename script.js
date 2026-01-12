// Base de datos con localStorage
let productos = [];
let ventas = [];

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
    
    // Verificar si es la primera vez
    const usuarioGuardado = localStorage.getItem('usuario');
    const passwordGuardada = localStorage.getItem('password');
    
    if (!usuarioGuardado || !passwordGuardada) {
        // Primera vez - Crear cuenta
        localStorage.setItem('usuario', usuario);
        localStorage.setItem('password', password);
        alert('✅ ¡Cuenta creada exitosamente! Ahora puedes ingresar.');
        mostrarSistema();
    } else {
        // Verificar credenciales
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
    
    // IMPORTANTE: Cargar datos primero
    cargarDatos();
    
    // Luego mostrar todo
    mostrarInventario();
    cargarProductosVenta();
    mostrarVentas();
    mostrarEstadisticas();
    
    // Inicializar tabs
    inicializarTabs();
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.setItem('sesionActiva', 'false');
        location.reload();
    }
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
            }
        });
    });
}

// INVENTARIO
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
    alert('✅ Producto agregado y guardado');
});

function mostrarInventario() {
    const tbody = document.getElementById('tablaProductos');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay productos en el inventario</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>${p.cantidad}</td>
            <td>$${(p.precio * p.cantidad).toFixed(2)}</td>
            <td class="actions">
                <button class="btn btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarProductos();
        mostrarInventario();
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
    }
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
    
    guardarVentas();
    guardarProductos();
    
    e.target.reset();
    mostrarVentas();
    cargarProductosVenta();
    mostrarInventario();
    mostrarEstadisticas();
    
    alert('✅ Venta registrada exitosamente\n\nTotal: $' + venta.total.toFixed(2));
});

function mostrarVentas() {
    const tbody = document.getElementById('tablaVentas');
    
    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay ventas registradas</td></tr>';
        return;
    }
    
    // Mostrar ventas más recientes primero
    const ventasOrdenadas = [...ventas].reverse();
    
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
