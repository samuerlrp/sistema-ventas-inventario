// Base de datos en memoria
let productos = [];
let ventas = [];

// Elementos del DOM
const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');

// Cambiar entre pestañas
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
    e.target.reset();
    mostrarInventario();
    alert('✅ Producto agregado exitosamente');
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
        mostrarInventario();
    }
}

// VENTAS
function cargarProductosVenta() {
    const select = document.getElementById('productoVenta');
    select.innerHTML = '<option value="">Seleccionar producto</option>' + 
        productos.map(p => `<option value="${p.id}">${p.nombre} - $${p.precio} (Stock: ${p.cantidad})</option>`).join('');
}

document.getElementById('productoVenta').addEventListener('change', (e) => {
    const producto = productos.find(p => p.id == e.target.value);
    if (producto) {
        document.getElementById('precioVenta').value = producto.precio;
        document.getElementById('cantidadVenta').max = producto.cantidad;
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
        alert('❌ No hay suficiente stock');
        return;
    }
    
    const venta = {
        id: Date.now(),
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        total: cantidad * producto.precio,
        fecha: new Date().toLocaleString()
    };
    
    ventas.push(venta);
    producto.cantidad -= cantidad;
    
    e.target.reset();
    mostrarVentas();
    mostrarInventario();
    alert('✅ Venta registrada exitosamente');
});

function mostrarVentas() {
    const tbody = document.getElementById('tablaVentas');
    
    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay ventas registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = ventas.map(v => `
        <tr>
            <td>${v.fecha}</td>
            <td>${v.productoNombre}</td>
            <td>${v.cantidad}</td>
            <td>$${v.precioUnitario.toFixed(2)}</td>
            <td>$${v.total.toFixed(2)}</td>
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

// Inicializar
mostrarInventario();
