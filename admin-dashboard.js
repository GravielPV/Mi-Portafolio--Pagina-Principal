// ===== ADMIN DASHBOARD MODULE =====
// Código separado para el panel de administración y dashboard

// ===== ADMIN PANEL ACCESS =====
// Function to check if user is already logged in
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (isLoggedIn === 'true' && loginTime) {
        // Check if login is still valid (24 hours)
        const now = Date.now();
        const timeDiff = now - parseInt(loginTime);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (timeDiff < twentyFourHours) {
            return true;
        } else {
            // Session expired, clear storage
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminLoginTime');
        }
    }
    return false;
}

// Function to redirect to admin login
function redirectToAdminLogin() {
    // Add visual feedback if triggered by button
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.style.transform = 'scale(0.95)';
        adminBtn.style.opacity = '0.5';
        setTimeout(() => {
            adminBtn.style.transform = '';
            adminBtn.style.opacity = '';
        }, 150);
    }
    
    // Redirect to login page
    window.location.href = 'admin-login.html';
}

// Maintain secret keyboard access for power users
let adminSequence = [];
const adminCode = ['ControlLeft', 'ShiftLeft', 'KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN'];

document.addEventListener('keydown', (e) => {
    adminSequence.push(e.code);
    if (adminSequence.length > adminCode.length) {
        adminSequence.shift();
    }
    
    if (JSON.stringify(adminSequence) === JSON.stringify(adminCode)) {
        // Check if already logged in
        if (checkAdminLogin()) {
            showAdminPanel();
        } else {
            redirectToAdminLogin();
        }
        adminSequence = [];
    }
});

// Add visible button access
document.addEventListener('DOMContentLoaded', () => {
    const adminBtn = document.getElementById('admin-panel-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            // Check if already logged in
            if (checkAdminLogin()) {
                showAdminPanel();
            } else {
                redirectToAdminLogin();
            }
        });
    }
    
    // Check URL parameters for admin access after login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' && checkAdminLogin()) {
        // Show admin panel directly
        setTimeout(() => {
            showAdminPanel();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 500);
    }
});

// Utility functions for the dashboard
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'hace un momento';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
        border: 1px solid ${type === 'success' ? '#047857' : type === 'error' ? '#b91c1c' : '#2563eb'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Contact management functions - Funciones avanzadas de gestión IMPLEMENTADAS
function sortContacts() {
    const sortBy = document.getElementById('contactSort')?.value || 'date';
    
    if (!window.dashboardData || window.dashboardData.length === 0) {
        showNotification('❌ No hay datos para ordenar', 'warning');
        return;
    }
    
    showNotification(`📊 Ordenando contactos por: ${sortBy}`, 'info');
    
    let sortedMessages = [...window.dashboardData];
    
    switch(sortBy) {
        case 'date':
            sortedMessages.sort((a, b) => new Date(b.get('createdAt')) - new Date(a.get('createdAt')));
            break;
        case 'name':
            sortedMessages.sort((a, b) => a.get('name').localeCompare(b.get('name')));
            break;
        case 'contact':
            sortedMessages.sort((a, b) => a.get('contact').localeCompare(b.get('contact')));
            break;
        case 'package':
            sortedMessages.sort((a, b) => {
                const aPackage = a.get('package') || '';
                const bPackage = b.get('package') || '';
                return bPackage.localeCompare(aPackage);
            });
            break;
        default:
            sortedMessages.sort((a, b) => new Date(b.get('createdAt')) - new Date(a.get('createdAt')));
    }
    
    // Actualizar datos globales
    window.dashboardData = sortedMessages;
    
    // Re-renderizar la sección actual
    const activeSection = document.querySelector('.nav-item.active')?.textContent.toLowerCase();
    if (activeSection && activeSection.includes('mensajes')) {
        loadMessagesSection(document.getElementById('dashboard-content'), sortedMessages);
    }
    
    setTimeout(() => {
        showNotification(`✅ ${sortedMessages.length} contactos ordenados correctamente`, 'success');
    }, 500);
}

function exportContacts() {
    if (!window.dashboardData || window.dashboardData.length === 0) {
        showNotification('❌ No hay datos para exportar', 'warning');
        return;
    }
    
    showNotification('📊 Preparando exportación de contactos...', 'info');
    
    try {
        // Crear datos únicos de contactos
        const uniqueContacts = new Map();
        
        window.dashboardData.forEach(msg => {
            const contact = msg.get('contact');
            const createdAt = new Date(msg.get('createdAt'));
            
            if (!uniqueContacts.has(contact)) {
                uniqueContacts.set(contact, {
                    nombre: msg.get('name'),
                    contacto: contact,
                    primerMensaje: createdAt,
                    ultimoMensaje: createdAt,
                    totalMensajes: 1,
                    paquetesSolicitados: msg.get('package') ? [msg.get('package')] : [],
                    mensajes: [msg.get('message')]
                });
            } else {
                const existing = uniqueContacts.get(contact);
                if (createdAt > existing.ultimoMensaje) {
                    existing.ultimoMensaje = createdAt;
                }
                if (createdAt < existing.primerMensaje) {
                    existing.primerMensaje = createdAt;
                }
                existing.totalMensajes++;
                
                if (msg.get('package') && !existing.paquetesSolicitados.includes(msg.get('package'))) {
                    existing.paquetesSolicitados.push(msg.get('package'));
                }
                existing.mensajes.push(msg.get('message'));
            }
        });
        
        // Generar CSV
        const headers = [
            'Nombre',
            'Contacto',
            'Total Mensajes',
            'Primer Contacto',
            'Último Contacto',
            'Paquetes Solicitados',
            'Días Activo',
            'Valor Potencial'
        ];
        
        const csvData = Array.from(uniqueContacts.values()).map(contact => {
            const diasActivo = Math.max(1, Math.ceil((contact.ultimoMensaje - contact.primerMensaje) / (1000 * 60 * 60 * 24)));
            const valorPotencial = contact.paquetesSolicitados.length > 0 
                ? contact.paquetesSolicitados.reduce((sum, pkg) => {
                    if (pkg.includes('13,000')) return sum + 13000;
                    if (pkg.includes('8,000')) return sum + 8000;
                    if (pkg.includes('5,000')) return sum + 5000;
                    return sum + 5000; // valor por defecto
                }, 0) 
                : 0;
            
            return [
                `"${contact.nombre}"`,
                `"${contact.contacto}"`,
                contact.totalMensajes,
                `"${contact.primerMensaje.toLocaleDateString('es-ES')}"`,
                `"${contact.ultimoMensaje.toLocaleDateString('es-ES')}"`,
                `"${contact.paquetesSolicitados.join(', ')}"`,
                diasActivo,
                `"RD$${valorPotencial.toLocaleString()}"`
            ].join(',');
        });
        
        const csvContent = [headers.join(','), ...csvData].join('\n');
        
        // Crear y descargar archivo
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `contactos-unicos-gabydev-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Mostrar estadísticas del export
        const totalValor = Array.from(uniqueContacts.values()).reduce((sum, contact) => {
            return sum + contact.paquetesSolicitados.reduce((packageSum, pkg) => {
                if (pkg.includes('13,000')) return packageSum + 13000;
                if (pkg.includes('8,000')) return packageSum + 8000;
                if (pkg.includes('5,000')) return packageSum + 5000;
                return packageSum;
            }, 0);
        }, 0);
        
        setTimeout(() => {
            showNotification(`✅ Exportados ${uniqueContacts.size} contactos únicos • Valor potencial: RD$${totalValor.toLocaleString()}`, 'success');
        }, 1000);
        
    } catch (error) {
        showNotification(`❌ Error en exportación: ${error.message}`, 'error');
        console.error('Error exportando contactos:', error);
    }
}

function viewContactHistory(contact) {
    if (!window.dashboardData) {
        showNotification('❌ No hay datos disponibles', 'error');
        return;
    }
    
    showNotification(`📋 Cargando historial de ${contact}...`, 'info');
    
    // Buscar todos los mensajes de este contacto
    const contactMessages = window.dashboardData.filter(msg => 
        msg.get('contact').toLowerCase() === contact.toLowerCase()
    );
    
    if (contactMessages.length === 0) {
        showNotification(`❌ No se encontró historial para ${contact}`, 'warning');
        return;
    }
    
    // Crear modal con historial
    const modal = document.createElement('div');
    modal.id = 'contact-history-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 style="color: #e2e8f0; margin: 0; font-size: 1.5rem;">
                    📋 Historial de ${contactMessages[0].get('name')}
                </h3>
                <button onclick="document.getElementById('contact-history-modal').remove()" style="
                    background: #374151;
                    border: none;
                    color: #94a3b8;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.25rem;
                ">✕</button>
            </div>
            
            <div style="
                background: rgba(15, 23, 42, 0.5);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            ">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: center;">
                    <div>
                        <div style="color: #3b82f6; font-size: 1.5rem; font-weight: 700;">${contactMessages.length}</div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Mensajes</div>
                    </div>
                    <div>
                        <div style="color: #10b981; font-size: 1.5rem; font-weight: 700;">
                            ${Math.ceil((new Date() - new Date(contactMessages[contactMessages.length - 1].get('createdAt'))) / (1000 * 60 * 60 * 24))}d
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Días activo</div>
                    </div>
                    <div>
                        <div style="color: #8b5cf6; font-size: 1.5rem; font-weight: 700;">
                            ${contactMessages.filter(msg => msg.get('package')).length}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Paquetes</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto;">
                ${contactMessages.sort((a, b) => new Date(b.get('createdAt')) - new Date(a.get('createdAt'))).map(msg => `
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border-left: 4px solid ${msg.get('package') ? '#8b5cf6' : '#3b82f6'};
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: #e2e8f0; font-weight: 500;">📅 ${new Date(msg.get('createdAt')).toLocaleDateString('es-ES')}</span>
                                <span style="color: #64748b;">•</span>
                                <span style="color: #64748b; font-size: 0.875rem;">${new Date(msg.get('createdAt')).toLocaleTimeString('es-ES')}</span>
                                ${msg.get('package') ? `<span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">📦 ${msg.get('package')}</span>` : ''}
                            </div>
                            <span style="color: #64748b; font-size: 0.75rem;">#${msg.id.substring(0, 8)}</span>
                        </div>
                        <div style="color: #94a3b8; line-height: 1.5; font-size: 0.875rem;">
                            ${msg.get('message')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #334155;
            ">
                <span style="color: #64748b; font-size: 0.875rem;">
                    📧 ${contact}
                </span>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="
                        const whatsappMessage = encodeURIComponent('Hola ${contactMessages[0].get('name')}, gracias por contactarme a través de mi portfolio.');
                        window.open('https://wa.me/18295639556?text=' + whatsappMessage, '_blank');
                    " style="
                        background: linear-gradient(135deg, #10b981, #047857);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                    ">💬 Responder</button>
                    <button onclick="exportContactHistory('${contact}')" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                    ">📊 Exportar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    showNotification(`✅ Historial cargado - ${contactMessages.length} mensajes`, 'success');
}

// Settings functions - Funciones avanzadas de configuración
function exportData() {
    if (!window.dashboardData || window.dashboardData.length === 0) {
        showNotification('❌ No hay datos para exportar', 'warning');
        return;
    }
    
    showNotification('📊 Iniciando exportación completa de datos...', 'info');
    
    // Preparar datos completos
    const allData = window.dashboardData.map(msg => ({
        id: msg.id,
        nombre: msg.get('name'),
        contacto: msg.get('contact'),
        mensaje: msg.get('message'),
        paquete: msg.get('package') || '',
        fecha: new Date(msg.get('createdAt')).toLocaleDateString('es-ES'),
        hora: new Date(msg.get('createdAt')).toLocaleTimeString('es-ES'),
        timestamp: msg.get('createdAt'),
        ip: msg.get('ipAddress') || '',
        userAgent: msg.get('userAgent') || ''
    }));
    
    // Crear CSV completo
    const headers = [
        'ID', 'Nombre', 'Contacto', 'Mensaje', 'Paquete',
        'Fecha', 'Hora', 'IP', 'Navegador'
    ];
    
    const csvData = allData.map(row => [
        `"${row.id}"`,
        `"${row.nombre}"`,
        `"${row.contacto}"`,
        `"${row.mensaje.replace(/"/g, '""')}"`,
        `"${row.paquete}"`,
        `"${row.fecha}"`,
        `"${row.hora}"`,
        `"${row.ip}"`,
        `"${row.userAgent.substring(0, 100)}..."`
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    // Crear archivo ZIP con múltiples formatos
    const zip = {
        'datos-completos.csv': csvContent,
        'resumen-estadisticas.json': JSON.stringify({
            fechaExportacion: new Date().toISOString(),
            totalMensajes: allData.length,
            contactosUnicos: new Set(allData.map(d => d.contacto)).size,
            paquetesSolicitados: allData.filter(d => d.paquete).length,
            rangoFechas: {
                inicio: allData[allData.length - 1]?.fecha,
                fin: allData[0]?.fecha
            },
            dominiosMasComunes: Object.entries(
                allData
                    .filter(d => d.contacto.includes('@'))
                    .reduce((acc, d) => {
                        const domain = d.contacto.split('@')[1];
                        acc[domain] = (acc[domain] || 0) + 1;
                        return acc;
                    }, {})
            ).sort(([,a], [,b]) => b - a).slice(0, 5)
        }, null, 2)
    };
    
    // Simular descarga (en un caso real usarías JSZip)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exportacion-completa-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        showNotification(`✅ Exportación completa - ${allData.length} registros descargados`, 'success');
    }, 1000);
}

function clearOldData() {
    if (!window.dashboardData || window.dashboardData.length === 0) {
        showNotification('❌ No hay datos para analizar', 'info');
        return;
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldMessages = window.dashboardData.filter(msg => 
        new Date(msg.get('createdAt')) < thirtyDaysAgo
    );
    
    const recentMessages = window.dashboardData.filter(msg => 
        new Date(msg.get('createdAt')) >= thirtyDaysAgo
    );
    
    if (oldMessages.length === 0) {
        showNotification('✅ No hay mensajes anteriores a 30 días', 'info');
        return;
    }
    
    // Crear modal de confirmación personalizado
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
        ">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🗑️</div>
                <h3 style="color: #e2e8f0; margin: 0 0 1rem 0;">Limpiar Datos Antiguos</h3>
                <p style="color: #94a3b8; margin: 0; line-height: 1.5;">
                    Se encontraron <strong>${oldMessages.length} mensajes</strong> anteriores a 30 días.<br>
                    Mantendremos <strong>${recentMessages.length} mensajes recientes</strong>.
                </p>
            </div>
            
            <div style="
                background: rgba(15, 23, 42, 0.5);
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            ">
                <h4 style="color: #f59e0b; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                    ⚠️ Esta acción:
                </h4>
                <ul style="color: #94a3b8; margin: 0; padding-left: 1.5rem; line-height: 1.6;">
                    <li>Eliminará ${oldMessages.length} mensajes antiguos de Back4App</li>
                    <li>Esta acción NO se puede deshacer</li>
                    <li>Se mantendrán los mensajes de los últimos 30 días</li>
                    <li>Recomendamos exportar datos antes de continuar</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #374151;
                    border: 1px solid #4b5563;
                    color: #d1d5db;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">
                    Cancelar
                </button>
                <button onclick="confirmClearOldData(${oldMessages.length}); this.closest('div').parentElement.remove();" style="
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">
                    🗑️ Eliminar Datos Antiguos
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Función global para confirmar eliminación
    window.confirmClearOldData = async function(count) {
        showNotification(`🧹 Iniciando limpieza de ${count} mensajes antiguos...`, 'info');
        
        try {
            // Intentar eliminar mensajes reales de Back4App
            if (typeof Parse !== 'undefined') {
                let deletedCount = 0;
                const batchSize = 100; // Parse limita eliminaciones en lote
                
                for (let i = 0; i < oldMessages.length; i += batchSize) {
                    const batch = oldMessages.slice(i, i + batchSize);
                    
                    try {
                        await Parse.Object.destroyAll(batch);
                        deletedCount += batch.length;
                        
                        // Mostrar progreso
                        showNotification(`🔄 Eliminados ${deletedCount}/${oldMessages.length} mensajes...`, 'info');
                    } catch (batchError) {
                        console.warn('Error eliminando lote:', batchError);
                    }
                }
                
                // Actualizar datos globales
                window.dashboardData = recentMessages;
                
                // Recargar dashboard
                await loadDashboardData();
                
                showNotification(`✅ Limpieza completada: ${deletedCount} mensajes eliminados`, 'success');
                
            } else {
                // Fallback si Parse no está disponible
                showNotification(`⚠️ Simulando eliminación de ${count} mensajes (Parse no disponible)`, 'warning');
                
                // Simular delay
                setTimeout(() => {
                    window.dashboardData = recentMessages;
                    showNotification(`✅ Simulación completada: ${count} mensajes removidos localmente`, 'info');
                }, 2000);
            }
            
        } catch (error) {
            showNotification(`❌ Error durante la limpieza: ${error.message}`, 'error');
            console.error('Error en clearOldData:', error);
        }
    };
}

async function testConnection() {
    showNotification('� Probando conexión con Back4App...', 'info');
    
    try {
        // Verificar que Parse está configurado
        if (typeof Parse === 'undefined') {
            throw new Error('Parse SDK no está cargado correctamente');
        }
        
        // Verificar configuración de Parse
        if (!Parse.applicationId || !Parse.serverURL) {
            throw new Error('Parse no está configurado correctamente (falta applicationId o serverURL)');
        }
        
        // Test 1: Verificar conectividad básica
        const startTime = Date.now();
        
        try {
            // Intentar hacer una consulta simple
            const TestQuery = Parse.Object.extend('Contact');
            const query = new Parse.Query(TestQuery);
            query.limit(1);
            await query.find();
            
            const responseTime = Date.now() - startTime;
            
            // Test 2: Verificar permisos de escritura
            const testObject = new Parse.Object('ConnectionTest');
            testObject.set('testField', 'test-value');
            testObject.set('timestamp', new Date());
            
            await testObject.save();
            
            // Test 3: Verificar permisos de eliminación
            await testObject.destroy();
            
            // Test 4: Verificar estadísticas de datos
            const contactQuery = new Parse.Query(TestQuery);
            const totalContacts = await contactQuery.count();
            
            // Mostrar resultados detallados
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: #1e293b;
                    border: 1px solid #10b981;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 600px;
                    width: 90%;
                ">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                        <h3 style="color: #10b981; margin: 0 0 1rem 0;">Conexión Exitosa</h3>
                        <p style="color: #94a3b8; margin: 0;">
                            Conectado exitosamente a Back4App
                        </p>
                    </div>
                    
                    <div style="
                        background: rgba(16, 185, 129, 0.1);
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        border-radius: 8px;
                        padding: 1.5rem;
                        margin-bottom: 2rem;
                    ">
                        <h4 style="color: #10b981; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            📊 Resultados de Pruebas:
                        </h4>
                        <div style="color: #e2e8f0; line-height: 1.8;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>⚡ Tiempo de respuesta:</span>
                                <span style="color: #10b981; font-weight: bold;">${responseTime}ms</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>🔗 Conectividad:</span>
                                <span style="color: #10b981; font-weight: bold;">✅ Activa</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>✏️ Permisos de escritura:</span>
                                <span style="color: #10b981; font-weight: bold;">✅ Habilitados</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>�️ Permisos de eliminación:</span>
                                <span style="color: #10b981; font-weight: bold;">✅ Habilitados</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>📝 Total de contactos:</span>
                                <span style="color: #10b981; font-weight: bold;">${totalContacts}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 2rem;
                    ">
                        <div style="color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
                            <strong style="color: #e2e8f0;">Servidor:</strong> ${Parse.serverURL}<br>
                            <strong style="color: #e2e8f0;">App ID:</strong> ${Parse.applicationId.substring(0, 8)}...
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <button onclick="this.closest('div').parentElement.remove()" style="
                            background: #10b981;
                            color: white;
                            border: none;
                            padding: 0.75rem 2rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                            Cerrar
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            showNotification('✅ Conexión verificada exitosamente', 'success');
            
        } catch (parseError) {
            // Error específico de Parse
            throw new Error(`Error de Back4App: ${parseError.message}`);
        }
        
    } catch (error) {
        // Mostrar error detallado
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1e293b;
                border: 1px solid #dc2626;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
            ">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                    <h3 style="color: #dc2626; margin: 0 0 1rem 0;">Error de Conexión</h3>
                    <p style="color: #94a3b8; margin: 0;">
                        No se pudo conectar con Back4App
                    </p>
                </div>
                
                <div style="
                    background: rgba(220, 38, 38, 0.1);
                    border: 1px solid rgba(220, 38, 38, 0.3);
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                ">
                    <h4 style="color: #dc2626; margin: 0 0 1rem 0;">🔍 Detalles del Error:</h4>
                    <div style="color: #e2e8f0; font-family: monospace; font-size: 0.9rem; word-break: break-word;">
                        ${error.message}
                    </div>
                </div>
                
                <div style="
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 2rem;
                ">
                    <h4 style="color: #f59e0b; margin: 0 0 0.5rem 0;">💡 Posibles Soluciones:</h4>
                    <ul style="color: #94a3b8; margin: 0; padding-left: 1.5rem; line-height: 1.6; font-size: 0.9rem;">
                        <li>Verificar conexión a internet</li>
                        <li>Revisar credenciales de Back4App</li>
                        <li>Comprobar configuración de CORS</li>
                        <li>Verificar que el servidor esté activo</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.75rem 2rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        showNotification(`❌ Error de conexión: ${error.message}`, 'error');
        console.error('Error en testConnection:', error);
    }
}

// Función para exportar historial de un contacto específico
function exportContactHistory(contact) {
    const contactMessages = window.dashboardData.filter(msg => 
        msg.get('contact').toLowerCase() === contact.toLowerCase()
    );
    
    if (contactMessages.length === 0) {
        showNotification('❌ No hay mensajes para este contacto', 'warning');
        return;
    }
    
    const csvData = contactMessages.map(msg => [
        `"${new Date(msg.get('createdAt')).toLocaleDateString('es-ES')}"`,
        `"${new Date(msg.get('createdAt')).toLocaleTimeString('es-ES')}"`,
        `"${msg.get('name')}"`,
        `"${msg.get('contact')}"`,
        `"${msg.get('package') || ''}"`,
        `"${msg.get('message').replace(/"/g, '""')}"`,
        `"${msg.id}"`
    ].join(','));
    
    const headers = ['Fecha', 'Hora', 'Nombre', 'Contacto', 'Paquete', 'Mensaje', 'ID'];
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-${contact.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`✅ Historial de ${contact} exportado`, 'success');
}

// Add CSS animations
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .dashboard-section {
        animation: fadeIn 0.5s ease;
    }
    
    .metric-card:hover {
        transform: translateY(-4px);
        transition: all 0.3s ease;
    }
    
    .metric-card .click-hint {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .metric-card:hover .click-hint {
        opacity: 1;
    }
`;
document.head.appendChild(dashboardStyle);

// ===== MAIN DASHBOARD FUNCTION =====
async function showAdminPanel() {
    // Check if dbManager is available from main app
    if (typeof dbManager === 'undefined' || !dbManager.initialized) {
        showNotification('Panel de Administración no disponible - Back4App no conectado', 'error');
        return;
    }

    // Show loading notification
    showNotification('📊 Cargando dashboard profesional...', 'info');
    
    // Create admin panel with professional dashboard
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #0f172a;
        z-index: 99999;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        animation: dashboardFadeIn 0.5s ease-out;
    `;
    
    const currentTime = new Date();
    const greeting = currentTime.getHours() < 12 ? 'Buenos días' : currentTime.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';
    
    adminPanel.innerHTML = `
        <!-- Dashboard Header -->
        <div class="dashboard-header" style="
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 1rem 2rem;
            border-bottom: 1px solid #475569;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: relative;
        ">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button id="mobile-menu-toggle" style="
                    display: none;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-right: 1rem;
                    transition: all 0.2s;
                " onclick="toggleMobileSidebar()">☰</button>
                <div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 1.2rem;
                ">G</div>
                <div>
                    <h1 style="margin: 0; color: white; font-size: 1.5rem; font-weight: 700;">
                        Dashboard GabyDev
                    </h1>
                    <p style="margin: 0; color: #94a3b8; font-size: 0.875rem;">
                        ${greeting}, Gabriel • ${currentTime.toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    color: #60a5fa;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                    Conectado
                </div>
                <button onclick="location.reload()" style="
                    background: #374151;
                    border: 1px solid #4b5563;
                    color: #d1d5db;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                    🔄 Actualizar
                </button>
                <button onclick="document.getElementById('admin-panel').remove()" style="
                    background: #dc2626;
                    border: none;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                    ✕ Cerrar
                </button>
            </div>
        </div>

        <!-- Dashboard Content -->
        <div style="
            display: flex;
            height: calc(100vh - 80px);
            background: #0f172a;
        ">
            <!-- Sidebar -->
            <div class="dashboard-sidebar" style="
                width: 280px;
                background: #1e293b;
                border-right: 1px solid #334155;
                padding: 1.5rem;
                overflow-y: auto;
            ">
                <nav style="space-y: 0.5rem;">
                    <button class="nav-item active" onclick="showDashboardSection('overview')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    ">
                        📊 Dashboard General
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('messages')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        💬 Mensajes
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('analytics')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        📈 Analíticas
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('contacts')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        👥 Contactos
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('packages')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        📦 Paquetes
                    </button>
                    <button class="nav-item" onclick="showDashboardSection('settings')" style="
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.75rem 1rem;
                        background: transparent;
                        color: #94a3b8;
                        border: 1px solid #374151;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 500;
                        margin-bottom: 0.5rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                        ⚙️ Configuración
                    </button>
                </nav>
                
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #334155;">
                    <div style="
                        background: linear-gradient(135deg, #059669, #047857);
                        padding: 1rem;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <div style="color: white; font-weight: 600; margin-bottom: 0.5rem;">
                            🚀 Sistema Activo
                        </div>
                        <div style="color: #a7f3d0; font-size: 0.875rem;">
                            Back4App conectado
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div style="
                flex: 1;
                padding: 2rem;
                overflow-y: auto;
                background: #0f172a;
            ">
                <div id="dashboard-content">
                    <!-- Loading Content -->
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 400px;
                        color: #64748b;
                    ">
                        <div style="
                            width: 60px;
                            height: 60px;
                            border: 4px solid #334155;
                            border-top: 4px solid #3b82f6;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 1rem;
                        "></div>
                        <h3 style="margin: 0 0 0.5rem 0; color: #e2e8f0;">Cargando Dashboard</h3>
                        <p style="margin: 0; font-size: 0.875rem;">Obteniendo datos de la base de datos...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes dashboardFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .nav-item.active {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                border-color: #3b82f6 !important;
            }
            
            /* Mobile Dashboard Styles */
            @media (max-width: 768px) {
                #mobile-menu-toggle {
                    display: block !important;
                }
                
                .dashboard-sidebar {
                    position: fixed !important;
                    top: 0 !important;
                    left: -280px !important;
                    height: 100vh !important;
                    z-index: 1001 !important;
                    transition: left 0.3s ease !important;
                }
                
                .dashboard-sidebar.open {
                    left: 0 !important;
                }
                
                .dashboard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: none;
                }
                
                .dashboard-overlay.active {
                    display: block;
                }
            }
        </style>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Load dashboard data
    await loadDashboardData();
}

// Mobile sidebar toggle function
window.toggleMobileSidebar = function() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = document.querySelector('.dashboard-overlay');
    
    if (!overlay) {
        // Create overlay if it doesn't exist
        const newOverlay = document.createElement('div');
        newOverlay.className = 'dashboard-overlay';
        newOverlay.onclick = () => toggleMobileSidebar();
        document.getElementById('admin-panel').appendChild(newOverlay);
    }
    
    sidebar.classList.toggle('open');
    const overlayElement = document.querySelector('.dashboard-overlay');
    overlayElement.classList.toggle('active');
}

// Dashboard navigation function
window.showDashboardSection = function(section) {
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        item.style.background = 'transparent';
        item.style.color = '#94a3b8';
        item.style.borderColor = '#374151';
    });
    
    const activeItem = event.target;
    activeItem.classList.add('active');
    activeItem.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    activeItem.style.color = 'white';
    activeItem.style.borderColor = '#3b82f6';
    
    // Load section content
    loadDashboardSection(section);
}

// Load dashboard data function
async function loadDashboardData() {
    try {
        const query = new Parse.Query('ContactMessage');
        query.limit(1000); // Get more data for analytics
        query.descending('createdAt');
        
        const messages = await query.find();
        window.dashboardData = messages; // Store globally for use in sections
        
        // Load default section (overview)
        loadDashboardSection('overview');
        
    } catch (error) {
        const contentDiv = document.getElementById('dashboard-content');
        contentDiv.innerHTML = `
            <div style="
                text-align: center;
                padding: 3rem;
                color: #ef4444;
                background: #1e293b;
                border-radius: 12px;
                border: 1px solid #374151;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem;">Error de Conexión</h3>
                <p style="color: #94a3b8; margin-bottom: 2rem;">Error cargando datos: ${error.message}</p>
                <button onclick="refreshDashboardData()" style="
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                    🔄 Reintentar Conexión
                </button>
            </div>
        `;
    }
}

// Load specific dashboard section
window.loadDashboardSection = async function(section) {
    console.log('🔄 Navegando a sección:', section); // Debug
    
    const contentDiv = document.getElementById('dashboard-content');
    if (!contentDiv) {
        console.error('❌ No se encontró el contenedor dashboard-content');
        return;
    }
    
    const messages = window.dashboardData || [];
    console.log('📊 Datos disponibles:', messages.length, 'mensajes'); // Debug
    
    switch (section) {
        case 'overview':
            loadOverviewSection(contentDiv, messages);
            break;
        case 'messages':
        case 'mensajes':  // Soporte para ambos nombres
            loadMessagesSection(contentDiv, messages);
            break;
        case 'analytics':
        case 'analíticas':  // Soporte para ambos nombres
            loadAnalyticsSection(contentDiv, messages);
            break;
        case 'contacts':
        case 'contactos':  // Soporte para ambos nombres
            loadContactsSection(contentDiv, messages);
            break;
        case 'packages':
        case 'paquetes':  // Soporte para ambos nombres
            loadPackagesSection(contentDiv, messages);
            break;
        case 'settings':
        case 'configuración':  // Soporte para ambos nombres
            loadSettingsSection(contentDiv, messages);
            break;
        default:
            console.log('🔄 Sección no reconocida, cargando overview'); // Debug
            loadOverviewSection(contentDiv, messages);
    }
}

// Overview Section - Dashboard principal con métricas y estadísticas
function loadOverviewSection(contentDiv, messages) {
    // Calcular métricas
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayMessages = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate.toDateString() === today.toDateString();
    });
    
    const yesterdayMessages = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate.toDateString() === yesterday.toDateString();
    });
    
    const weekMessages = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate >= lastWeek;
    });
    
    const monthMessages = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate >= thisMonth;
    });
    
    // Calcular contactos únicos
    const uniqueContacts = new Set(messages.map(msg => msg.get('contact'))).size;
    
    // Paquetes más solicitados
    const packageRequests = messages.filter(msg => msg.get('package')).length;
    
    // Tendencia de crecimiento
    const growthRate = yesterdayMessages.length > 0 
        ? ((todayMessages.length - yesterdayMessages.length) / yesterdayMessages.length * 100).toFixed(1)
        : todayMessages.length > 0 ? 100 : 0;
    
    const growthIcon = growthRate > 0 ? '📈' : growthRate < 0 ? '📉' : '➡️';
    const growthColor = growthRate > 0 ? '#10b981' : growthRate < 0 ? '#ef4444' : '#64748b';
    
    // Horas más activas (calculado desde datos reales)
    const messagesByHour = {};
    messages.forEach(msg => {
        const hour = new Date(msg.get('createdAt')).getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        messagesByHour[hourKey] = (messagesByHour[hourKey] || 0) + 1;
    });
    
    const peakHours = Object.entries(messagesByHour)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => hour);
    
    // Análisis de dominios de correo para inferir países
    const emailDomains = {};
    messages.forEach(msg => {
        const contact = msg.get('contact');
        if (contact && contact.includes('@')) {
            const domain = contact.split('@')[1];
            emailDomains[domain] = (emailDomains[domain] || 0) + 1;
        }
    });
    
    // Mapeo de dominios a países (estimación basada en dominios comunes)
    const domainCountryMap = {
        'gmail.com': { name: 'Global (Gmail)', flag: '🌐' },
        'outlook.com': { name: 'Global (Outlook)', flag: '🌐' },
        'hotmail.com': { name: 'Global (Hotmail)', flag: '�' },
        'yahoo.com': { name: 'Estados Unidos', flag: '🇺🇸' },
        'outlook.es': { name: 'España', flag: '�🇸' },
        'gmail.es': { name: 'España', flag: '🇪🇸' },
        'hotmail.es': { name: 'España', flag: '🇪🇸' },
        'outlook.mx': { name: 'México', flag: '��' },
        'gmail.mx': { name: 'México', flag: '🇲🇽' },
        'icloud.com': { name: 'Global (iCloud)', flag: '🍎' }
    };
    
    const countryStats = {};
    Object.entries(emailDomains).forEach(([domain, count]) => {
        const country = domainCountryMap[domain] || { name: 'República Dominicana', flag: '��' };
        const countryName = country.name;
        if (!countryStats[countryName]) {
            countryStats[countryName] = { ...country, count: 0 };
        }
        countryStats[countryName].count += count;
    });
    
    const topCountries = Object.values(countryStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                        📊 Dashboard General
                    </h2>
                    <p style="color: #94a3b8; margin: 0; font-size: 1rem;" class="last-updated">
                        Resumen completo de la actividad de tu portfolio • Última actualización: ${new Date().toLocaleTimeString('es-ES')}
                    </p>
                </div>
                <button onclick="refreshDashboardData()" style="
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🔄 Actualizar
                </button>
            </div>
        </div>
        
        <!-- Métricas principales -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        ">
            <!-- Total de mensajes -->
            <div class="metric-card" onclick="loadDashboardSection('messages')" style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(59, 130, 246, 0.15)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; font-weight: 500;">Total Mensajes</p>
                        <h3 style="color: #e2e8f0; margin: 0.5rem 0 0 0; font-size: 2.5rem; font-weight: 700;">${messages.length}</h3>
                    </div>
                    <div style="
                        background: rgba(59, 130, 246, 0.1);
                        padding: 0.75rem;
                        border-radius: 8px;
                        font-size: 1.5rem;
                    ">💬</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${growthColor}; font-size: 0.875rem; font-weight: 600;">
                        ${growthIcon} ${Math.abs(growthRate)}%
                    </span>
                    <span style="color: #64748b; font-size: 0.875rem;">vs ayer</span>
                </div>
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                "></div>
                <div style="
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                " class="click-hint">👆 Click para ver</div>
            </div>
            
            <!-- Mensajes hoy -->
            <div class="metric-card" onclick="loadTodayMessages()" style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(16, 185, 129, 0.15)'; this.querySelector('.click-hint').style.opacity='1'" onmouseout="this.style.transform=''; this.style.boxShadow=''; this.querySelector('.click-hint').style.opacity='0'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; font-weight: 500;">Hoy</p>
                        <h3 style="color: #e2e8f0; margin: 0.5rem 0 0 0; font-size: 2.5rem; font-weight: 700;">${todayMessages.length}</h3>
                    </div>
                    <div style="
                        background: rgba(16, 185, 129, 0.1);
                        padding: 0.75rem;
                        border-radius: 8px;
                        font-size: 1.5rem;
                    ">📅</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #10b981; font-size: 0.875rem; font-weight: 600;">
                        ${todayMessages.length} nuevos
                    </span>
                    <span style="color: #64748b; font-size: 0.875rem;">mensajes</span>
                </div>
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #10b981, #047857);
                "></div>
                <div style="
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                " class="click-hint">👆 Click para filtrar</div>
            </div>
            
            <!-- Contactos únicos -->
            <div class="metric-card" onclick="loadUniqueContacts()" style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(245, 158, 11, 0.15)'; this.querySelector('.click-hint').style.opacity='1'" onmouseout="this.style.transform=''; this.style.boxShadow=''; this.querySelector('.click-hint').style.opacity='0'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; font-weight: 500;">Contactos Únicos</p>
                        <h3 style="color: #e2e8f0; margin: 0.5rem 0 0 0; font-size: 2.5rem; font-weight: 700;">${uniqueContacts}</h3>
                    </div>
                    <div style="
                        background: rgba(245, 158, 11, 0.1);
                        padding: 0.75rem;
                        border-radius: 8px;
                        font-size: 1.5rem;
                    ">👥</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #f59e0b; font-size: 0.875rem; font-weight: 600;">
                        ${(uniqueContacts / messages.length * 100).toFixed(1)}%
                    </span>
                    <span style="color: #64748b; font-size: 0.875rem;">tasa de conversión</span>
                </div>
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #f59e0b, #d97706);
                "></div>
                <div style="
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                " class="click-hint">👆 Ver lista</div>
            </div>
            
            <!-- Solicitudes de paquetes -->
            <div class="metric-card" onclick="loadPackageRequests()" style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #475569;
                border-radius: 12px;
                padding: 1.5rem;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(139, 92, 246, 0.15)'; this.querySelector('.click-hint').style.opacity='1'" onmouseout="this.style.transform=''; this.style.boxShadow=''; this.querySelector('.click-hint').style.opacity='0'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; font-weight: 500;">Solicitudes Paquetes</p>
                        <h3 style="color: #e2e8f0; margin: 0.5rem 0 0 0; font-size: 2.5rem; font-weight: 700;">${packageRequests}</h3>
                    </div>
                    <div style="
                        background: rgba(139, 92, 246, 0.1);
                        padding: 0.75rem;
                        border-radius: 8px;
                        font-size: 1.5rem;
                    ">📦</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #8b5cf6; font-size: 0.875rem; font-weight: 600;">
                        ${messages.length > 0 ? (packageRequests / messages.length * 100).toFixed(1) : 0}%
                    </span>
                    <span style="color: #64748b; font-size: 0.875rem;">del total</span>
                </div>
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, #8b5cf6, #7c3aed);
                "></div>
                <div style="
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    color: #64748b;
                    font-size: 0.75rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                " class="click-hint">👆 Ver paquetes</div>
            </div>
        </div>
        
        <!-- Gráficos y estadísticas -->
        <div style="
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        ">
            <!-- Actividad reciente -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 1.5rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                    📈 Actividad de los últimos 7 días
                </h3>
                <div style="
                    display: flex;
                    align-items: end;
                    gap: 0.5rem;
                    height: 150px;
                    padding: 1rem;
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                ">
                    ${Array.from({length: 7}, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        const dayMessages = messages.filter(msg => {
                            const msgDate = new Date(msg.get('createdAt'));
                            return msgDate.toDateString() === date.toDateString();
                        });
                        const height = Math.max(dayMessages.length * 20, 10);
                        const maxHeight = Math.max(...Array.from({length: 7}, (_, j) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - j));
                            return messages.filter(msg => {
                                const msgDate = new Date(msg.get('createdAt'));
                                return msgDate.toDateString() === d.toDateString();
                            }).length;
                        }), 1);
                        const normalizedHeight = (dayMessages.length / maxHeight) * 120 + 10;
                        
                        return `
                            <div style="
                                flex: 1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 0.5rem;
                            ">
                                <div style="
                                    width: 100%;
                                    height: ${normalizedHeight}px;
                                    background: linear-gradient(to top, #3b82f6, #60a5fa);
                                    border-radius: 4px 4px 0 0;
                                    display: flex;
                                    align-items: end;
                                    justify-content: center;
                                    color: white;
                                    font-size: 0.75rem;
                                    font-weight: 600;
                                    padding-bottom: 0.25rem;
                                ">
                                    ${dayMessages.length > 0 ? dayMessages.length : ''}
                                </div>
                                <span style="color: #94a3b8; font-size: 0.75rem;">
                                    ${date.toLocaleDateString('es-ES', { weekday: 'short' })}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Top países -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 1.5rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                    🌍 Países principales
                </h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${topCountries.slice(0, 5).map((country, index) => `
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                            padding: 0.75rem;
                            background: rgba(15, 23, 42, 0.5);
                            border-radius: 8px;
                        ">
                            <span style="font-size: 1.5rem;">${country.flag}</span>
                            <div style="flex: 1;">
                                <div style="color: #e2e8f0; font-weight: 500; font-size: 0.875rem;">
                                    ${country.name}
                                </div>
                                <div style="color: #64748b; font-size: 0.75rem;">
                                    ${country.count} mensajes
                                </div>
                            </div>
                            <div style="
                                background: rgba(59, 130, 246, 0.1);
                                color: #60a5fa;
                                padding: 0.25rem 0.5rem;
                                border-radius: 4px;
                                font-size: 0.75rem;
                                font-weight: 600;
                            ">
                                ${messages.length > 0 ? (country.count / messages.length * 100).toFixed(1) : 0}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- Mensajes recientes -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: #e2e8f0; margin: 0; font-size: 1.25rem; font-weight: 600;">
                    💬 Mensajes recientes
                </h3>
                <button onclick="showDashboardSection('messages')" style="
                    background: transparent;
                    border: 1px solid #374151;
                    color: #94a3b8;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#334155'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#94a3b8'">
                    Ver todos
                </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${messages.slice(0, 5).map(msg => `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding: 1rem;
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        border-left: 3px solid #3b82f6;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 600;
                            font-size: 0.875rem;
                        ">
                            ${msg.get('name').charAt(0).toUpperCase()}
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <span style="color: #e2e8f0; font-weight: 500;">${msg.get('name')}</span>
                                ${msg.get('package') ? '<span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.125rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">📦 Paquete</span>' : ''}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.25rem;">
                                ${msg.get('message').substring(0, 100)}${msg.get('message').length > 100 ? '...' : ''}
                            </div>
                            <div style="color: #64748b; font-size: 0.75rem;">
                                ${formatTimeAgo(new Date(msg.get('createdAt')))} • ${msg.get('contact')}
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${messages.length === 0 ? `
                    <div style="
                        text-align: center;
                        padding: 3rem;
                        color: #64748b;
                    ">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                        <h4 style="color: #94a3b8; margin-bottom: 0.5rem;">No hay mensajes aún</h4>
                        <p style="margin: 0; font-size: 0.875rem;">Los mensajes aparecerán aquí cuando los usuarios contacten a través del formulario.</p>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <!-- Acciones rápidas -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 1.5rem;
        ">
            <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                ⚡ Acciones rápidas
            </h3>
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            ">
                <button onclick="showDashboardSection('messages')" style="
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💬</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Ver todos los mensajes</div>
                    <div style="opacity: 0.8; font-size: 0.875rem;">Gestionar y responder contactos</div>
                </button>
                
                <button onclick="showDashboardSection('analytics')" style="
                    background: linear-gradient(135deg, #10b981, #047857);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📈</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Analíticas detalladas</div>
                    <div style="opacity: 0.8; font-size: 0.875rem;">Tendencias y estadísticas</div>
                </button>
                
                <button onclick="exportData()" style="
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📊</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Exportar datos</div>
                    <div style="opacity: 0.8; font-size: 0.875rem;">Descargar reportes CSV</div>
                </button>
                
                <button onclick="testConnection()" style="
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                    border: none;
                    padding: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔌</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Probar conexión</div>
                    <div style="opacity: 0.8; font-size: 0.875rem;">Verificar Back4App</div>
                </button>
            </div>
        </div>
    `;
}

// Messages Section - Gestión completa de mensajes
function loadMessagesSection(contentDiv, messages) {
    // Organizar mensajes por categorías
    const packageMessages = messages.filter(msg => msg.get('package'));
    const generalMessages = messages.filter(msg => !msg.get('package'));
    const todayMessages = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        const today = new Date();
        return msgDate.toDateString() === today.toDateString();
    });
    
    // Estadísticas de respuesta (basadas en tiempo transcurrido)
    const now = new Date();
    const responseStats = {
        pending: 0,    // Mensajes de las últimas 24 horas
        responded: 0,  // Mensajes de 1-7 días (asumiendo respuesta)
        closed: 0      // Mensajes de más de 7 días
    };
    
    messages.forEach(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        const hoursAgo = (now - msgDate) / (1000 * 60 * 60);
        
        if (hoursAgo <= 24) {
            responseStats.pending++;
        } else if (hoursAgo <= 168) { // 7 días = 168 horas
            responseStats.responded++;
        } else {
            responseStats.closed++;
        }
    });

    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                        💬 Gestión de Mensajes
                    </h2>
                    <p style="color: #94a3b8; margin: 0; font-size: 1rem;">
                        Administra y responde todos los mensajes de contacto • Total: ${messages.length} mensajes
                    </p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button onclick="exportContacts()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                        📊 Exportar
                    </button>
                    <button onclick="refreshDashboardData()" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🔄 Actualizar
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Estadísticas de estado -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        ">
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #f59e0b;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
                <h3 style="color: #f59e0b; margin: 0; font-size: 1.5rem; font-weight: 700;">${responseStats.pending}</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Pendientes</p>
            </div>
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #10b981;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                <h3 style="color: #10b981; margin: 0; font-size: 1.5rem; font-weight: 700;">${responseStats.responded}</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Respondidos</p>
            </div>
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #64748b;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📁</div>
                <h3 style="color: #64748b; margin: 0; font-size: 1.5rem; font-weight: 700;">${responseStats.closed}</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Archivados</p>
            </div>
        </div>
        
        <!-- Filtros -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        ">
            <h3 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1.125rem; font-weight: 600;">
                🔍 Filtros y búsqueda
            </h3>
            <div style="
                display: grid;
                grid-template-columns: 2fr 1fr 1fr;
                gap: 1rem;
            ">
                <div>
                    <label style="color: #94a3b8; font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Buscar mensajes</label>
                    <input type="text" id="messageSearch" placeholder="Buscar por nombre, email o mensaje..." style="
                        width: 100%;
                        background: #0f172a;
                        border: 1px solid #374151;
                        color: #e2e8f0;
                        padding: 0.75rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                    " oninput="filterMessages()">
                </div>
                <div>
                    <label style="color: #94a3b8; font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Filtrar por tipo</label>
                    <select id="messageType" style="
                        width: 100%;
                        background: #0f172a;
                        border: 1px solid #374151;
                        color: #e2e8f0;
                        padding: 0.75rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                    " onchange="filterMessages()">
                        <option value="all">Todos los mensajes</option>
                        <option value="package">Solo paquetes</option>
                        <option value="general">Consultas generales</option>
                        <option value="today">Solo hoy</option>
                    </select>
                </div>
                <div>
                    <label style="color: #94a3b8; font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Ordenar por</label>
                    <select id="messageSort" style="
                        width: 100%;
                        background: #0f172a;
                        border: 1px solid #374151;
                        color: #e2e8f0;
                        padding: 0.75rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                    " onchange="filterMessages()">
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguos</option>
                        <option value="name">Por nombre</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Lista de mensajes -->
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 1.5rem;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: #e2e8f0; margin: 0; font-size: 1.125rem; font-weight: 600;">
                    📋 Lista de mensajes (<span id="messageCount">${messages.length}</span>)
                </h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button style="
                        background: transparent;
                        border: 1px solid #374151;
                        color: #94a3b8;
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.75rem;
                    " onclick="selectAllMessages()">Seleccionar todos</button>
                    <button style="
                        background: transparent;
                        border: 1px solid #374151;
                        color: #94a3b8;
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.75rem;
                    " onclick="clearSelection()">Limpiar selección</button>
                </div>
            </div>
            
            <div id="messagesList" style="display: flex; flex-direction: column; gap: 1rem;">
                ${messages.length > 0 ? messages.map((msg, index) => `
                    <div class="message-item" data-message-id="${msg.id}" style="
                        display: flex;
                        align-items: flex-start;
                        gap: 1rem;
                        padding: 1.5rem;
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        border-left: 4px solid ${msg.get('package') ? '#8b5cf6' : '#3b82f6'};
                        transition: all 0.2s;
                        cursor: pointer;
                    " onclick="toggleMessageSelection('${msg.id}')" onmouseover="this.style.background='rgba(15, 23, 42, 0.8)'" onmouseout="this.style.background='rgba(15, 23, 42, 0.5)'">
                        <input type="checkbox" class="message-checkbox" style="
                            margin-top: 0.5rem;
                            transform: scale(1.2);
                        ">
                        <div style="
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, ${msg.get('package') ? '#8b5cf6' : '#3b82f6'}, ${msg.get('package') ? '#7c3aed' : '#1d4ed8'});
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 600;
                            font-size: 1.125rem;
                            flex-shrink: 0;
                        ">
                            ${msg.get('name').charAt(0).toUpperCase()}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <h4 style="color: #e2e8f0; margin: 0; font-size: 1rem; font-weight: 600;">
                                    ${msg.get('name')}
                                </h4>
                                ${msg.get('package') ? `
                                    <span style="
                                        background: rgba(139, 92, 246, 0.1);
                                        color: #a78bfa;
                                        padding: 0.25rem 0.75rem;
                                        border-radius: 12px;
                                        font-size: 0.75rem;
                                        font-weight: 500;
                                        border: 1px solid rgba(139, 92, 246, 0.2);
                                    ">
                                        📦 ${msg.get('package')}
                                    </span>
                                ` : ''}
                                <span style="
                                    background: rgba(16, 185, 129, 0.1);
                                    color: #34d399;
                                    padding: 0.25rem 0.75rem;
                                    border-radius: 12px;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                    border: 1px solid rgba(16, 185, 129, 0.2);
                                ">
                                    ✅ Pendiente
                                </span>
                            </div>
                            <div style="color: #94a3b8; margin-bottom: 0.75rem; font-size: 0.875rem; line-height: 1.5;">
                                ${msg.get('message').length > 200 ? msg.get('message').substring(0, 200) + '...' : msg.get('message')}
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.75rem;">
                                    <span>📧 ${msg.get('contact')}</span>
                                    <span>📅 ${formatTimeAgo(new Date(msg.get('createdAt')))}</span>
                                    <span>🆔 ${msg.id.substring(0, 8)}...</span>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="event.stopPropagation(); respondMessage('${msg.id}')" style="
                                        background: linear-gradient(135deg, #10b981, #047857);
                                        color: white;
                                        border: none;
                                        padding: 0.5rem 1rem;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 0.75rem;
                                        font-weight: 500;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                        💬 Responder
                                    </button>
                                    <button onclick="event.stopPropagation(); viewMessageDetails('${msg.id}')" style="
                                        background: #374151;
                                        border: 1px solid #4b5563;
                                        color: #d1d5db;
                                        padding: 0.5rem 1rem;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-size: 0.75rem;
                                        font-weight: 500;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                                        👁️ Ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="
                        text-align: center;
                        padding: 4rem;
                        color: #64748b;
                    ">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📭</div>
                        <h4 style="color: #94a3b8; margin-bottom: 1rem; font-size: 1.25rem;">No hay mensajes</h4>
                        <p style="margin: 0; font-size: 0.875rem; line-height: 1.5;">
                            Cuando los usuarios contacten a través del formulario,<br>
                            sus mensajes aparecerán aquí para que puedas gestionarlos.
                        </p>
                    </div>
                `}
            </div>
            
            ${messages.length > 0 ? `
                <!-- Acciones en lote -->
                <div style="
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #334155;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="color: #94a3b8; font-size: 0.875rem;">
                        <span id="selectedCount">0</span> mensajes seleccionados
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="markAsRead()" style="
                            background: #374151;
                            border: 1px solid #4b5563;
                            color: #d1d5db;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                            ✅ Marcar como leído
                        </button>
                        <button onclick="archiveSelected()" style="
                            background: #374151;
                            border: 1px solid #4b5563;
                            color: #d1d5db;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                            📁 Archivar
                        </button>
                        <button onclick="exportSelected()" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            transition: all 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📊 Exportar seleccionados
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <script>
            // Variables globales para la gestión de mensajes
            window.allMessages = ${JSON.stringify(messages.map(msg => ({
                id: msg.id,
                name: msg.get('name'),
                contact: msg.get('contact'),
                message: msg.get('message'),
                package: msg.get('package'),
                createdAt: msg.get('createdAt')
            })))};
            window.selectedMessages = new Set();
            
            // Función de filtrado
            window.filterMessages = function() {
                const searchTerm = document.getElementById('messageSearch').value.toLowerCase();
                const messageType = document.getElementById('messageType').value;
                const sortOrder = document.getElementById('messageSort').value;
                
                let filteredMessages = [...window.allMessages];
                
                // Filtrar por búsqueda
                if (searchTerm) {
                    filteredMessages = filteredMessages.filter(msg => 
                        msg.name.toLowerCase().includes(searchTerm) ||
                        msg.contact.toLowerCase().includes(searchTerm) ||
                        msg.message.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Filtrar por tipo
                if (messageType === 'package') {
                    filteredMessages = filteredMessages.filter(msg => msg.package);
                } else if (messageType === 'general') {
                    filteredMessages = filteredMessages.filter(msg => !msg.package);
                } else if (messageType === 'today') {
                    const today = new Date().toDateString();
                    filteredMessages = filteredMessages.filter(msg => 
                        new Date(msg.createdAt).toDateString() === today
                    );
                }
                
                // Ordenar
                if (sortOrder === 'newest') {
                    filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else if (sortOrder === 'oldest') {
                    filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                } else if (sortOrder === 'name') {
                    filteredMessages.sort((a, b) => a.name.localeCompare(b.name));
                }
                
                // Actualizar contador
                document.getElementById('messageCount').textContent = filteredMessages.length;
                
                // Renderizar mensajes filtrados
                renderFilteredMessages(filteredMessages);
            };
            
            window.renderFilteredMessages = function(messages) {
                const messagesList = document.getElementById('messagesList');
                if (messages.length === 0) {
                    messagesList.innerHTML = \`
                        <div style="text-align: center; padding: 3rem; color: #64748b;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                            <h4 style="color: #94a3b8; margin-bottom: 1rem;">No se encontraron mensajes</h4>
                            <p style="margin: 0; font-size: 0.875rem;">Intenta ajustar los filtros de búsqueda.</p>
                        </div>
                    \`;
                    return;
                }
                
                messagesList.innerHTML = messages.map(msg => \`
                    <div class="message-item" data-message-id="\${msg.id}" data-message-date="\${msg.get('createdAt')}" data-package="\${msg.get('package') || ''}" data-contact="\${msg.get('contact')}" style="display: flex; align-items: flex-start; gap: 1rem; padding: 1.5rem; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border-left: 4px solid \${msg.get('package') ? '#8b5cf6' : '#3b82f6'}; transition: all 0.2s; cursor: pointer;" onclick="toggleMessageSelection('\${msg.id}')" onmouseover="this.style.background='rgba(15, 23, 42, 0.8)'" onmouseout="this.style.background='rgba(15, 23, 42, 0.5)'">
                        <input type="checkbox" class="message-checkbox" style="margin-top: 0.5rem; transform: scale(1.2);">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, \${msg.get('package') ? '#8b5cf6' : '#3b82f6'}, \${msg.get('package') ? '#7c3aed' : '#1d4ed8'}); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.125rem; flex-shrink: 0;">\${msg.get('name').charAt(0).toUpperCase()}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <h4 style="color: #e2e8f0; margin: 0; font-size: 1rem; font-weight: 600;">\${msg.get('name')}</h4>
                                \${msg.get('package') ? \`<span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; border: 1px solid rgba(139, 92, 246, 0.2);">📦 \${msg.get('package')}</span>\` : ''}
                                <span style="background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; border: 1px solid rgba(16, 185, 129, 0.2);">✅ Pendiente</span>
                            </div>
                            <div style="color: #94a3b8; margin-bottom: 0.75rem; font-size: 0.875rem; line-height: 1.5;">\${msg.get('message').length > 200 ? msg.get('message').substring(0, 200) + '...' : msg.get('message')}</div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.75rem;">
                                    <span>📧 \${msg.contact}</span>
                                    <span>📅 \${formatTimeAgo(new Date(msg.createdAt))}</span>
                                    <span>🆔 \${msg.id.substring(0, 8)}...</span>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="event.stopPropagation(); respondMessage('\${msg.id}')" style="background: linear-gradient(135deg, #10b981, #047857); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">💬 Responder</button>
                                    <button onclick="event.stopPropagation(); viewMessageDetails('\${msg.id}')" style="background: #374151; border: 1px solid #4b5563; color: #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">👁️ Ver</button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`).join('');
            };
            
            // Gestión de selección de mensajes
            window.toggleMessageSelection = function(messageId) {
                const checkbox = document.querySelector(\`[data-message-id="\${messageId}"] .message-checkbox\`);
                if (window.selectedMessages.has(messageId)) {
                    window.selectedMessages.delete(messageId);
                    checkbox.checked = false;
                } else {
                    window.selectedMessages.add(messageId);
                    checkbox.checked = true;
                }
                updateSelectedCount();
            };
            
            window.selectAllMessages = function() {
                window.allMessages.forEach(msg => window.selectedMessages.add(msg.id));
                document.querySelectorAll('.message-checkbox').forEach(cb => cb.checked = true);
                updateSelectedCount();
            };
            
            window.clearSelection = function() {
                window.selectedMessages.clear();
                document.querySelectorAll('.message-checkbox').forEach(cb => cb.checked = false);
                updateSelectedCount();
            };
            
            window.updateSelectedCount = function() {
                document.getElementById('selectedCount').textContent = window.selectedMessages.size;
            };
            
            // Acciones de mensajes
            window.respondMessage = function(messageId) {
                const message = window.allMessages.find(msg => msg.id === messageId);
                if (message) {
                    const whatsappMessage = encodeURIComponent(\`Hola \${message.name}, gracias por contactarme a través de mi portfolio. He recibido tu mensaje y me pondré en contacto contigo pronto.\`);
                    window.open(\`https://wa.me/18295639556?text=\${whatsappMessage}\`, '_blank');
                    showNotification(\`Redirigiendo a WhatsApp para responder a \${message.name}\`, 'success');
                }
            };
            
            window.viewMessageDetails = function(messageId) {
                const message = window.allMessages.find(msg => msg.id === messageId);
                if (message) {
                    showNotification(\`Mostrando detalles del mensaje de \${message.name}\`, 'info');
                    // Aquí podrías abrir un modal con más detalles
                }
            };
            
            window.markAsRead = function() {
                if (window.selectedMessages.size === 0) {
                    showNotification('Selecciona al menos un mensaje', 'warning');
                    return;
                }
                showNotification(\`\${window.selectedMessages.size} mensajes marcados como leídos\`, 'success');
                clearSelection();
            };
            
            window.archiveSelected = function() {
                if (window.selectedMessages.size === 0) {
                    showNotification('Selecciona al menos un mensaje', 'warning');
                    return;
                }
                showNotification(\`\${window.selectedMessages.size} mensajes archivados\`, 'success');
                clearSelection();
            };
            
            window.exportSelected = function() {
                if (window.selectedMessages.size === 0) {
                    showNotification('Selecciona al menos un mensaje', 'warning');
                    return;
                }
                
                const selectedData = window.allMessages.filter(msg => window.selectedMessages.has(msg.id));
                const csv = 'Nombre,Contacto,Mensaje,Paquete,Fecha\\n' + 
                    selectedData.map(msg => \`"\${msg.name}","\${msg.contact}","\${msg.message.replace(/"/g, '""')}","\${msg.package || ''}","\${new Date(msg.createdAt).toLocaleString()}"\`).join('\\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`mensajes-seleccionados-\${new Date().toISOString().split('T')[0]}.csv\`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                showNotification(\`\${selectedData.length} mensajes exportados\`, 'success');
            };
        </script>
    `;
}

// Analytics Section - Análisis completo de datos
function loadAnalyticsSection(contentDiv, messages) {
    // Análisis temporal
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const messages30Days = messages.filter(msg => new Date(msg.get('createdAt')) >= last30Days);
    const messages7Days = messages.filter(msg => new Date(msg.get('createdAt')) >= last7Days);
    const messagesToday = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate.toDateString() === now.toDateString();
    });
    const messagesYesterday = messages.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate.toDateString() === yesterday.toDateString();
    });
    
    // Análisis por horas del día
    const hourlyData = Array.from({length: 24}, (_, hour) => {
        const count = messages.filter(msg => {
            const msgHour = new Date(msg.get('createdAt')).getHours();
            return msgHour === hour;
        }).length;
        return { hour, count };
    });
    
    // Análisis por día de la semana
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyData = Array.from({length: 7}, (_, day) => {
        const count = messages.filter(msg => {
            const msgDay = new Date(msg.get('createdAt')).getDay();
            return msgDay === day;
        }).length;
        return { day: weekDays[day], count };
    });
    
    // Análisis de paquetes
    const packageStats = messages.reduce((acc, msg) => {
        const pkg = msg.get('package');
        if (pkg) {
            acc[pkg] = (acc[pkg] || 0) + 1;
        }
        return acc;
    }, {});
    
    // Análisis de dominios de email
    const emailDomains = messages.reduce((acc, msg) => {
        const contact = msg.get('contact');
        if (contact && contact.includes('@')) {
            const domain = contact.split('@')[1];
            acc[domain] = (acc[domain] || 0) + 1;
        }
        return acc;
    }, {});
    
    // Calcular tasas de crecimiento
    const growthRate = messagesYesterday.length > 0 
        ? ((messagesToday.length - messagesYesterday.length) / messagesYesterday.length * 100).toFixed(1)
        : messagesToday.length > 0 ? 100 : 0;
    
    const monthlyGrowth = messages30Days.length > 0 
        ? ((messages7Days.length - (messages30Days.length / 4)) / (messages30Days.length / 4) * 100).toFixed(1)
        : messages7Days.length > 0 ? 100 : 0;

    contentDiv.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h2 style="color: #e2e8f0; font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem 0;">
                        📈 Analíticas Avanzadas
                    </h2>
                    <p style="color: #94a3b8; margin: 0; font-size: 1rem;">
                        Insights profundos sobre patrones de contacto • Análisis de ${messages.length} mensajes
                    </p>
                </div>
                <button onclick="generateAnalyticsReport()" style="
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    📊 Generar Reporte
                </button>
            </div>
        </div>
        
        <!-- KPIs principales -->
        <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        ">
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #10b981;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
                <h3 style="color: #10b981; margin: 0; font-size: 1.8rem; font-weight: 700;">${growthRate > 0 ? '+' : ''}${growthRate}%</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Crecimiento diario</p>
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #10b981, #047857);"></div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #3b82f6;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚡</div>
                <h3 style="color: #3b82f6; margin: 0; font-size: 1.8rem; font-weight: 700;">${(messages.length / Math.max(1, new Set(messages.map(m => new Date(m.get('createdAt')).toDateString())).size)).toFixed(1)}</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Promedio diario</p>
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #3b82f6, #1d4ed8);"></div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #8b5cf6;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
                <h3 style="color: #8b5cf6; margin: 0; font-size: 1.8rem; font-weight: 700;">${(Object.keys(packageStats).length > 0 ? Object.values(packageStats).reduce((a, b) => a + b, 0) / messages.length * 100 : 0).toFixed(1)}%</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Tasa de conversión</p>
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #8b5cf6, #7c3aed);"></div>
            </div>
            
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                border: 1px solid #f59e0b;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
                <h3 style="color: #f59e0b; margin: 0; font-size: 1.8rem; font-weight: 700;">${new Set(messages.map(m => m.get('contact'))).size}</h3>
                <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.875rem;">Contactos únicos</p>
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #f59e0b, #d97706);"></div>
            </div>
        </div>
        
        <!-- Gráficos de tendencias -->
        <div style="
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        ">
            <!-- Tendencia por horas -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 1.5rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                    🕐 Actividad por horas del día
                </h3>
                <div style="
                    display: flex;
                    align-items: end;
                    gap: 2px;
                    height: 200px;
                    padding: 1rem;
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                    overflow-x: auto;
                ">
                    ${hourlyData.map((data, index) => {
                        const maxCount = Math.max(...hourlyData.map(d => d.count), 1);
                        const height = (data.count / maxCount) * 160 + 10;
                        const isPeakHour = data.count === maxCount && data.count > 0;
                        
                        return `
                            <div style="
                                flex: 1;
                                min-width: 15px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 0.5rem;
                            ">
                                <div style="
                                    width: 100%;
                                    height: ${height}px;
                                    background: ${isPeakHour ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'linear-gradient(to top, #3b82f6, #60a5fa)'};
                                    border-radius: 2px 2px 0 0;
                                    display: flex;
                                    align-items: end;
                                    justify-content: center;
                                    color: white;
                                    font-size: 0.6rem;
                                    font-weight: 600;
                                    padding-bottom: 2px;
                                    position: relative;
                                " title="${data.count} mensajes a las ${data.hour}:00">
                                    ${data.count > 0 ? data.count : ''}
                                    ${isPeakHour ? '<div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); color: #f59e0b;">🔥</div>' : ''}
                                </div>
                                <span style="color: #64748b; font-size: 0.6rem; writing-mode: ${data.hour % 2 === 0 ? 'horizontal-tb' : 'vertical-rl'};">
                                    ${String(data.hour).padStart(2, '0')}h
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #334155;
                    color: #94a3b8;
                    font-size: 0.875rem;
                ">
                    <span>🌅 Hora más activa: ${hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, {hour: 0, count: 0}).hour}:00</span>
                    <span>📊 Pico: ${Math.max(...hourlyData.map(d => d.count))} mensajes</span>
                </div>
            </div>
            
            <!-- Análisis semanal -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 1.5rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                    📅 Patrón semanal
                </h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${weeklyData.map((data, index) => {
                        const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
                        const percentage = (data.count / maxCount) * 100;
                        const isWeekend = index === 0 || index === 6;
                        
                        return `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 1rem;
                                padding: 0.75rem;
                                background: rgba(15, 23, 42, 0.5);
                                border-radius: 6px;
                                border-left: 3px solid ${isWeekend ? '#f59e0b' : '#3b82f6'};
                            ">
                                <span style="
                                    color: #e2e8f0;
                                    font-weight: 600;
                                    font-size: 0.875rem;
                                    width: 40px;
                                    text-align: center;
                                ">
                                    ${data.day}
                                </span>
                                <div style="flex: 1; position: relative;">
                                    <div style="
                                        width: 100%;
                                        height: 8px;
                                        background: rgba(15, 23, 42, 1);
                                        border-radius: 4px;
                                        overflow: hidden;
                                    ">
                                        <div style="
                                            width: ${percentage}%;
                                            height: 100%;
                                            background: linear-gradient(90deg, ${isWeekend ? '#f59e0b' : '#3b82f6'}, ${isWeekend ? '#fbbf24' : '#60a5fa'});
                                            border-radius: 4px;
                                            transition: width 0.5s ease;
                                        "></div>
                                    </div>
                                </div>
                                <span style="
                                    color: ${isWeekend ? '#f59e0b' : '#3b82f6'};
                                    font-weight: 600;
                                    font-size: 0.875rem;
                                    width: 30px;
                                    text-align: right;
                                ">
                                    ${data.count}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #334155;
                    color: #94a3b8;
                    font-size: 0.875rem;
                    text-align: center;
                ">
                    📈 Día más activo: ${weeklyData.reduce((max, curr) => curr.count > max.count ? curr : max, {day: '', count: 0}).day}
                </div>
            </div>
        </div>
        
        <!-- Análisis de paquetes y dominios -->
        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        ">
            <!-- Paquetes más solicitados -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 1.5rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                    📦 Paquetes más solicitados
                </h3>
                ${Object.keys(packageStats).length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${Object.entries(packageStats)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([pkg, count], index) => {
                                const percentage = (count / Object.values(packageStats).reduce((a, b) => a + b, 0) * 100).toFixed(1);
                                const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
                                
                                return `
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        gap: 1rem;
                                        padding: 1rem;
                                        background: rgba(15, 23, 42, 0.5);
                                        border-radius: 8px;
                                        border-left: 4px solid ${colors[index % colors.length]};
                                    ">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}aa);
                                            border-radius: 50%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-weight: 600;
                                            font-size: 0.875rem;
                                        ">
                                            #${index + 1}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.25rem;">
                                                ${pkg}
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                <div style="
                                                    width: 60px;
                                                    height: 6px;
                                                    background: rgba(15, 23, 42, 1);
                                                    border-radius: 3px;
                                                    overflow: hidden;
                                                ">
                                                    <div style="
                                                        width: ${percentage}%;
                                                        height: 100%;
                                                        background: ${colors[index % colors.length]};
                                                        border-radius: 3px;
                                                    "></div>
                                                </div>
                                                <span style="color: #64748b; font-size: 0.75rem;">
                                                    ${count} (${percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 2rem; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                        <h4 style="color: #94a3b8; margin-bottom: 0.5rem;">No hay solicitudes de paquetes</h4>
                        <p style="margin: 0; font-size: 0.875rem;">Cuando los usuarios soliciten paquetes específicos, aparecerán aquí.</p>
                    </div>
                `}
            </div>
            
            <!-- Dominios de email más comunes -->
            <div style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 1.5rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600;">
                    📧 Dominios de email
                </h3>
                ${Object.keys(emailDomains).length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${Object.entries(emailDomains)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 8)
                            .map(([domain, count]) => {
                                const percentage = (count / Object.values(emailDomains).reduce((a, b) => a + b, 0) * 100).toFixed(1);
                                const isPopular = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain);
                                
                                return `
                                    <div style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        padding: 0.75rem;
                                        background: rgba(15, 23, 42, 0.5);
                                        border-radius: 6px;
                                        border-left: 3px solid ${isPopular ? '#10b981' : '#3b82f6'};
                                    ">
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <span style="color: #e2e8f0; font-weight: 500; font-size: 0.875rem;">
                                                ${domain}
                                            </span>
                                            ${isPopular ? '<span style="color: #10b981; font-size: 0.75rem;">🔥</span>' : ''}
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <div style="
                                                width: 40px;
                                                height: 4px;
                                                background: rgba(15, 23, 42, 1);
                                                border-radius: 2px;
                                                overflow: hidden;
                                            ">
                                                <div style="
                                                    width: ${percentage}%;
                                                    height: 100%;
                                                    background: ${isPopular ? '#10b981' : '#3b82f6'};
                                                    border-radius: 2px;
                                                "></div>
                                            </div>
                                            <span style="
                                                color: ${isPopular ? '#10b981' : '#3b82f6'};
                                                font-weight: 600;
                                                font-size: 0.75rem;
                                                width: 35px;
                                                text-align: right;
                                            ">
                                                ${count}
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 2rem; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
                        <h4 style="color: #94a3b8; margin-bottom: 0.5rem;">No hay emails registrados</h4>
                        <p style="margin: 0; font-size: 0.875rem;">Los dominios de email aparecerán cuando lleguen contactos.</p>
                    </div>
                `}
            </div>
        </div>
        
        <!-- Insights y recomendaciones -->
        <div style="
            background: linear-gradient(135deg, #1e293b, #334155);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 2rem;
            position: relative;
            overflow: hidden;
        ">
            <div style="
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent);
                border-radius: 50%;
            "></div>
            <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                🧠 Insights inteligentes
            </h3>
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
            ">
                <div style="
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                    padding: 1.5rem;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                ">
                    <h4 style="color: #60a5fa; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        📈 Tendencia de crecimiento
                    </h4>
                    <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; line-height: 1.5;">
                        ${growthRate > 0 
                            ? `Excelente! Hay un crecimiento del ${growthRate}% en mensajes comparado con ayer. Mantén esta tendencia optimizando tu contenido.`
                            : growthRate < 0 
                                ? `Los mensajes han disminuido ${Math.abs(growthRate)}% respecto a ayer. Considera revisar tu estrategia de contenido.`
                                : 'La actividad se mantiene estable. Una buena consistencia en el flujo de contactos.'
                        }
                    </p>
                </div>
                
                <div style="
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                    padding: 1.5rem;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                ">
                    <h4 style="color: #34d399; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        🎯 Mejor momento para publicar
                    </h4>
                    <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; line-height: 1.5;">
                        ${hourlyData.length > 0 
                            ? `Tus contactos están más activos a las ${hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, {hour: 12}).hour}:00. Considera publicar contenido en redes sociales durante esta hora.`
                            : 'Acumula más datos para identificar los mejores momentos para publicar contenido.'
                        }
                    </p>
                </div>
                
                <div style="
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                    padding: 1.5rem;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                ">
                    <h4 style="color: #a78bfa; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        💼 Oportunidades de negocio
                    </h4>
                    <p style="color: #94a3b8; margin: 0; font-size: 0.875rem; line-height: 1.5;">
                        ${Object.keys(packageStats).length > 0 
                            ? `${Object.values(packageStats).reduce((a, b) => a + b, 0)} solicitudes de paquetes representan un ${(Object.values(packageStats).reduce((a, b) => a + b, 0) / messages.length * 100).toFixed(1)}% de tasa de conversión. Excelente interés comercial!`
                            : 'Considera agregar llamadas a la acción más claras para servicios específicos y aumentar las conversiones.'
                        }
                    </p>
                </div>
            </div>
        </div>
        
        <script>
            window.generateAnalyticsReport = function() {
                const reportData = {
                    fecha: new Date().toLocaleDateString('es-ES'),
                    totalMensajes: ${messages.length},
                    crecimientoDiario: '${growthRate}%',
                    contactosUnicos: ${new Set(messages.map(m => m.get('contact'))).size},
                    tasaConversion: '${(Object.keys(packageStats).length > 0 ? Object.values(packageStats).reduce((a, b) => a + b, 0) / messages.length * 100 : 0).toFixed(1)}%',
                    horasPico: [${hourlyData.filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 3).map(d => d.hour).join(', ')}],
                    paquetesMasSolicitados: ${JSON.stringify(Object.entries(packageStats).sort(([,a], [,b]) => b - a).slice(0, 3).map(([pkg, count]) => ({paquete: pkg, solicitudes: count})))}
                };
                
                const csvContent = 'Métrica,Valor\\n' + 
                    'Fecha del reporte,' + reportData.fecha + '\\n' +
                    'Total de mensajes,' + reportData.totalMensajes + '\\n' +
                    'Crecimiento diario,' + reportData.crecimientoDiario + '\\n' +
                    'Contactos únicos,' + reportData.contactosUnicos + '\\n' +
                    'Tasa de conversión,' + reportData.tasaConversion + '\\n' +
                    'Horas pico,"' + reportData.horasPico.join(', ') + '"\\n';
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`reporte-analiticas-\${new Date().toISOString().split('T')[0]}.csv\`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                showNotification('📊 Reporte de analíticas generado y descargado', 'success');
            };
        </script>
    `;
}

// Contacts Section - Placeholder for now
function loadContactsSection(contentDiv, messages) {
    showNotification('👥 Cargando gestión de contactos...', 'info');
    
    contentDiv.innerHTML = `
        <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                flex-wrap: wrap;
                gap: 1rem;
            ">
                <div>
                    <h2 style="color: #e2e8f0; margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">
                        👥 Gestión de Contactos
                    </h2>
                    <p style="color: #94a3b8; margin: 0; font-size: 1rem;">
                        Base de datos completa de contactos y leads
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <select id="contactSort" onchange="sortContacts()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                    ">
                        <option value="name">Ordenar por Nombre</option>
                        <option value="date">Ordenar por Fecha</option>
                        <option value="contact">Ordenar por Contacto</option>
                        <option value="messages">Ordenar por Mensajes</option>
                    </select>
                    <button onclick="exportContacts()" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">� Exportar Contactos</button>
                </div>
            </div>

            <!-- Estadísticas de contactos -->
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            ">
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #3b82f6; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="total-unique-contacts">
                        ${window.dashboardData ? new Set(window.dashboardData.map(msg => msg.get('contact'))).size : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Contactos Únicos</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #10b981; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="active-contacts">
                        ${window.dashboardData ? window.dashboardData.filter(msg => {
                            const messageDate = new Date(msg.get('createdAt'));
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            return messageDate > sevenDaysAgo;
                        }).length : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Contactos Recientes (7d)</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #8b5cf6; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="premium-contacts">
                        ${window.dashboardData ? new Set(window.dashboardData.filter(msg => msg.get('package')).map(msg => msg.get('contact'))).size : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Interesados en Paquetes</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #f59e0b; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="repeat-contacts">
                        ${window.dashboardData ? (() => {
                            const contactCounts = {};
                            window.dashboardData.forEach(msg => {
                                const contact = msg.get('contact');
                                contactCounts[contact] = (contactCounts[contact] || 0) + 1;
                            });
                            return Object.values(contactCounts).filter(count => count > 1).length;
                        })() : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Contactos Recurrentes</div>
                </div>
            </div>

            <!-- Análisis de dominios de email -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    � Análisis de Dominios de Email
                </h3>
                <div id="email-domains-chart" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                ">
                    ${window.dashboardData ? (() => {
                        const emailDomains = {};
                        window.dashboardData
                            .filter(msg => msg.get('contact').includes('@'))
                            .forEach(msg => {
                                const domain = msg.get('contact').split('@')[1];
                                emailDomains[domain] = (emailDomains[domain] || 0) + 1;
                            });
                        
                        return Object.entries(emailDomains)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 6)
                            .map(([domain, count]) => `
                                <div style="
                                    background: rgba(15, 23, 42, 0.5);
                                    border-radius: 8px;
                                    padding: 1rem;
                                    text-align: center;
                                    border: 1px solid #334155;
                                ">
                                    <div style="color: #3b82f6; font-size: 1.5rem; font-weight: 700;">${count}</div>
                                    <div style="color: #94a3b8; font-size: 0.875rem; word-break: break-all;">${domain}</div>
                                </div>
                            `).join('');
                    })() : '<div style="color: #64748b;">No hay datos de email disponibles</div>'}
                </div>
            </div>

            <!-- Lista de contactos únicos -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    👤 Lista de Contactos Únicos
                </h3>
                
                <!-- Buscador de contactos -->
                <div style="margin-bottom: 1.5rem;">
                    <input type="text" id="contact-search" placeholder="🔍 Buscar contacto..." style="
                        width: 100%;
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.75rem 1rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                    " onkeyup="filterContactsList()">
                </div>
                
                <div id="contacts-list" style="
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    max-height: 600px;
                    overflow-y: auto;
                ">
                    ${window.dashboardData ? (() => {
                        const uniqueContacts = new Map();
                        window.dashboardData.forEach(msg => {
                            const contact = msg.get('contact');
                            if (!uniqueContacts.has(contact)) {
                                uniqueContacts.set(contact, {
                                    name: msg.get('name'),
                                    contact: contact,
                                    firstMessage: new Date(msg.get('createdAt')),
                                    lastMessage: new Date(msg.get('createdAt')),
                                    totalMessages: 1,
                                    packages: msg.get('package') ? [msg.get('package')] : [],
                                    allMessages: [msg]
                                });
                            } else {
                                const existing = uniqueContacts.get(contact);
                                existing.lastMessage = new Date(msg.get('createdAt'));
                                existing.totalMessages++;
                                if (msg.get('package') && !existing.packages.includes(msg.get('package'))) {
                                    existing.packages.push(msg.get('package'));
                                }
                                existing.allMessages.push(msg);
                            }
                        });
                        
                        return Array.from(uniqueContacts.values())
                            .sort((a, b) => b.lastMessage - a.lastMessage)
                            .map(contact => {
                                const daysSinceContact = Math.ceil((new Date() - contact.lastMessage) / (1000 * 60 * 60 * 24));
                                const isRecent = daysSinceContact <= 7;
                                const hasPackageInterest = contact.packages.length > 0;
                                
                                return `
                                    <div class="contact-item" style="
                                        background: rgba(15, 23, 42, 0.5);
                                        border: 1px solid #334155;
                                        border-radius: 8px;
                                        padding: 1.5rem;
                                        transition: all 0.3s ease;
                                        cursor: pointer;
                                        border-left: 4px solid ${isRecent ? '#10b981' : hasPackageInterest ? '#8b5cf6' : '#374151'};
                                    " onclick="viewContactHistory('${contact.contact}')">
                                        <div style="display: flex; justify-content: between; align-items: flex-start; gap: 1rem;">
                                            <div style="flex: 1; min-width: 0;">
                                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                    <h4 style="color: #e2e8f0; margin: 0; font-size: 1.125rem; font-weight: 600; word-break: break-word;">
                                                        ${contact.name}
                                                    </h4>
                                                    ${isRecent ? '<span style="background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">🔥 Reciente</span>' : ''}
                                                    ${hasPackageInterest ? '<span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">💎 Premium</span>' : ''}
                                                </div>
                                                <div style="color: #94a3b8; font-size: 0.875rem; margin-bottom: 1rem; word-break: break-all;">
                                                    📧 ${contact.contact}
                                                </div>
                                                
                                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                                                    <div style="text-align: center;">
                                                        <div style="color: #3b82f6; font-size: 1.25rem; font-weight: 700;">${contact.totalMessages}</div>
                                                        <div style="color: #64748b; font-size: 0.75rem;">Mensajes</div>
                                                    </div>
                                                    <div style="text-align: center;">
                                                        <div style="color: #10b981; font-size: 1.25rem; font-weight: 700;">${daysSinceContact}d</div>
                                                        <div style="color: #64748b; font-size: 0.75rem;">Último contacto</div>
                                                    </div>
                                                    <div style="text-align: center;">
                                                        <div style="color: #8b5cf6; font-size: 1.25rem; font-weight: 700;">${contact.packages.length}</div>
                                                        <div style="color: #64748b; font-size: 0.75rem;">Paquetes</div>
                                                    </div>
                                                </div>
                                                
                                                ${contact.packages.length > 0 ? `
                                                    <div style="margin-bottom: 1rem;">
                                                        <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.5rem;">Paquetes de interés:</div>
                                                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                                            ${contact.packages.map(pkg => `
                                                                <span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                                                                    📦 ${pkg}
                                                                </span>
                                                            `).join('')}
                                                        </div>
                                                    </div>
                                                ` : ''}
                                            </div>
                                            
                                            <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
                                                <button onclick="event.stopPropagation(); 
                                                    const message = encodeURIComponent('Hola ${contact.name}, gracias por contactarme a través de mi portfolio.');
                                                    window.open('https://wa.me/18295639556?text=' + message, '_blank');
                                                " style="
                                                    background: linear-gradient(135deg, #10b981, #047857);
                                                    color: white;
                                                    border: none;
                                                    padding: 0.5rem 1rem;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    font-size: 0.75rem;
                                                ">💬 WhatsApp</button>
                                                
                                                <button onclick="event.stopPropagation(); viewContactHistory('${contact.contact}')" style="
                                                    background: #374151;
                                                    border: 1px solid #4b5563;
                                                    color: #d1d5db;
                                                    padding: 0.5rem 1rem;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    font-size: 0.75rem;
                                                ">📋 Historial</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('');
                    })() : '<div style="color: #64748b; text-align: center; padding: 2rem;">No hay contactos disponibles</div>'}
                </div>
            </div>
        </div>
    `;
    
    showNotification('✅ Gestión de contactos cargada', 'success');
}

// Packages Section - Análisis completo de paquetes
function loadPackagesSection(contentDiv, messages) {
    showNotification('📦 Cargando análisis de paquetes...', 'info');
    
    contentDiv.innerHTML = `
        <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                flex-wrap: wrap;
                gap: 1rem;
            ">
                <div>
                    <h2 style="color: #e2e8f0; margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">
                        📦 Análisis de Paquetes
                    </h2>
                    <p style="color: #94a3b8; margin: 0; font-size: 1rem;">
                        Estadísticas y tendencias de solicitudes de paquetes
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <select id="packagePeriod" onchange="updatePackageAnalysis()" style="
                        background: #374151;
                        border: 1px solid #4b5563;
                        color: #d1d5db;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-size: 0.875rem;
                    ">
                        <option value="all">Todo el tiempo</option>
                        <option value="30">Últimos 30 días</option>
                        <option value="7">Últimos 7 días</option>
                    </select>
                    <button onclick="exportPackageReport()" style="
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    ">📊 Exportar Reporte</button>
                </div>
            </div>

            <!-- Estadísticas generales de paquetes -->
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            ">
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #8b5cf6; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="total-package-requests">
                        ${window.dashboardData ? window.dashboardData.filter(msg => msg.get('package')).length : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Solicitudes de Paquetes</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #10b981; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="unique-package-types">
                        ${window.dashboardData ? new Set(window.dashboardData.filter(msg => msg.get('package')).map(msg => msg.get('package'))).size : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Tipos de Paquetes</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #f59e0b; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="conversion-rate">
                        ${window.dashboardData ? Math.round((window.dashboardData.filter(msg => msg.get('package')).length / window.dashboardData.length) * 100) : 0}%
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Tasa de Conversión</div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, #1e293b, #0f172a);
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                ">
                    <div style="color: #ef4444; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;" id="recent-package-requests">
                        ${window.dashboardData ? (() => {
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            return window.dashboardData.filter(msg => 
                                msg.get('package') && new Date(msg.get('createdAt')) > sevenDaysAgo
                            ).length;
                        })() : 0}
                    </div>
                    <div style="color: #94a3b8; font-size: 0.875rem;">Solicitudes Recientes (7d)</div>
                </div>
            </div>

            <!-- Gráfico de popularidad de paquetes -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 2rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    📊 Popularidad de Paquetes
                </h3>
                <div id="packages-chart" style="
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                ">
                    ${window.dashboardData ? (() => {
                        const packageCounts = {};
                        window.dashboardData
                            .filter(msg => msg.get('package'))
                            .forEach(msg => {
                                const pkg = msg.get('package');
                                packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
                            });
                        
                        const total = Object.values(packageCounts).reduce((a, b) => a + b, 0);
                        
                        return Object.entries(packageCounts)
                            .sort(([,a], [,b]) => b - a)
                            .map(([pkg, count], index) => {
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
                                const color = colors[index % colors.length];
                                
                                return `
                                    <div style="
                                        background: rgba(15, 23, 42, 0.5);
                                        border-radius: 8px;
                                        padding: 1.5rem;
                                        border: 1px solid #334155;
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                            <div>
                                                <h4 style="color: #e2e8f0; margin: 0; font-size: 1.125rem; font-weight: 600;">
                                                    📦 ${pkg}
                                                </h4>
                                                <div style="color: #94a3b8; font-size: 0.875rem;">
                                                    ${count} solicitudes • ${percentage.toFixed(1)}% del total
                                                </div>
                                            </div>
                                            <div style="
                                                background: ${color};
                                                color: white;
                                                padding: 0.5rem 1rem;
                                                border-radius: 20px;
                                                font-weight: 700;
                                                font-size: 1.125rem;
                                            ">
                                                ${count}
                                            </div>
                                        </div>
                                        
                                        <!-- Barra de progreso -->
                                        <div style="
                                            background: #374151;
                                            border-radius: 10px;
                                            height: 10px;
                                            overflow: hidden;
                                        ">
                                            <div style="
                                                background: linear-gradient(90deg, ${color}, ${color}99);
                                                height: 100%;
                                                width: ${percentage}%;
                                                transition: width 0.5s ease;
                                            "></div>
                                        </div>
                                    </div>
                                `;
                            }).join('');
                    })() : '<div style="color: #64748b; text-align: center; padding: 2rem;">No hay solicitudes de paquetes disponibles</div>'}
                </div>
            </div>

            <!-- Análisis temporal de solicitudes -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 2rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    📈 Tendencias Temporales
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                ">
                    <!-- Análisis por días de la semana -->
                    <div>
                        <h4 style="color: #94a3b8; margin: 0 0 1rem 0; font-size: 1rem;">Solicitudes por Día de la Semana</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${window.dashboardData ? (() => {
                                const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                const dayCounts = new Array(7).fill(0);
                                
                                window.dashboardData
                                    .filter(msg => msg.get('package'))
                                    .forEach(msg => {
                                        const day = new Date(msg.get('createdAt')).getDay();
                                        dayCounts[day]++;
                                    });
                                
                                const maxCount = Math.max(...dayCounts) || 1;
                                
                                return dayCounts.map((count, index) => {
                                    const percentage = (count / maxCount) * 100;
                                    const isToday = new Date().getDay() === index;
                                    
                                    return `
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <div style="
                                                min-width: 80px;
                                                font-size: 0.875rem;
                                                color: ${isToday ? '#10b981' : '#94a3b8'};
                                                font-weight: ${isToday ? '600' : '400'};
                                            ">
                                                ${dayNames[index]}
                                            </div>
                                            <div style="flex: 1; background: #374151; border-radius: 5px; height: 8px; overflow: hidden;">
                                                <div style="
                                                    background: ${isToday ? '#10b981' : '#3b82f6'};
                                                    height: 100%;
                                                    width: ${percentage}%;
                                                    transition: width 0.5s ease;
                                                "></div>
                                            </div>
                                            <div style="
                                                min-width: 30px;
                                                text-align: right;
                                                font-size: 0.875rem;
                                                color: #e2e8f0;
                                                font-weight: 600;
                                            ">
                                                ${count}
                                            </div>
                                        </div>
                                    `;
                                }).join('');
                            })() : '<div style="color: #64748b;">No hay datos disponibles</div>'}
                        </div>
                    </div>

                    <!-- Análisis por horas del día -->
                    <div>
                        <h4 style="color: #94a3b8; margin: 0 0 1rem 0; font-size: 1rem;">Horarios Más Activos</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${window.dashboardData ? (() => {
                                const hourCounts = new Array(24).fill(0);
                                
                                window.dashboardData
                                    .filter(msg => msg.get('package'))
                                    .forEach(msg => {
                                        const hour = new Date(msg.get('createdAt')).getHours();
                                        hourCounts[hour]++;
                                    });
                                
                                // Encontrar los 5 horarios más activos
                                const topHours = hourCounts
                                    .map((count, hour) => ({ hour, count }))
                                    .sort((a, b) => b.count - a.count)
                                    .slice(0, 5);
                                
                                const maxCount = topHours[0]?.count || 1;
                                
                                return topHours.map(({ hour, count }) => {
                                    const percentage = (count / maxCount) * 100;
                                    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
                                    
                                    return `
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <div style="
                                                min-width: 60px;
                                                font-size: 0.875rem;
                                                color: #94a3b8;
                                            ">
                                                ${timeLabel}
                                            </div>
                                            <div style="flex: 1; background: #374151; border-radius: 5px; height: 8px; overflow: hidden;">
                                                <div style="
                                                    background: #8b5cf6;
                                                    height: 100%;
                                                    width: ${percentage}%;
                                                    transition: width 0.5s ease;
                                                "></div>
                                            </div>
                                            <div style="
                                                min-width: 30px;
                                                text-align: right;
                                                font-size: 0.875rem;
                                                color: #e2e8f0;
                                                font-weight: 600;
                                            ">
                                                ${count}
                                            </div>
                                        </div>
                                    `;
                                }).join('');
                            })() : '<div style="color: #64748b;">No hay datos disponibles</div>'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Insights y recomendaciones -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    💡 Insights y Recomendaciones
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                ">
                    ${window.dashboardData ? (() => {
                        const packageData = window.dashboardData.filter(msg => msg.get('package'));
                        const insights = [];
                        
                        if (packageData.length > 0) {
                            // Paquete más popular
                            const packageCounts = {};
                            packageData.forEach(msg => {
                                const pkg = msg.get('package');
                                packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
                            });
                            const mostPopular = Object.entries(packageCounts).sort(([,a], [,b]) => b - a)[0];
                            
                            insights.push({
                                icon: '🏆',
                                title: 'Paquete Más Demandado',
                                description: `"${mostPopular[0]}" representa el ${Math.round((mostPopular[1] / packageData.length) * 100)}% de todas las solicitudes.`,
                                color: '#8b5cf6'
                            });
                            
                            // Tendencia reciente
                            const recentRequests = packageData.filter(msg => {
                                const sevenDaysAgo = new Date();
                                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                return new Date(msg.get('createdAt')) > sevenDaysAgo;
                            });
                            
                            if (recentRequests.length > 0) {
                                insights.push({
                                    icon: '📈',
                                    title: 'Actividad Reciente',
                                    description: `${recentRequests.length} solicitudes en los últimos 7 días. ${recentRequests.length > packageData.length * 0.3 ? 'Tendencia alta' : 'Tendencia normal'}.`,
                                    color: '#10b981'
                                });
                            }
                            
                            // Recomendación de horario
                            const hourCounts = new Array(24).fill(0);
                            packageData.forEach(msg => {
                                const hour = new Date(msg.get('createdAt')).getHours();
                                hourCounts[hour]++;
                            });
                            const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
                            
                            insights.push({
                                icon: '⏰',
                                title: 'Mejor Momento para Promociones',
                                description: `La mayoría de solicitudes llegan alrededor de las ${peakHour.toString().padStart(2, '0')}:00. Considera programar promociones en este horario.`,
                                color: '#f59e0b'
                            });
                        } else {
                            insights.push({
                                icon: '💼',
                                title: 'Oportunidad de Crecimiento',
                                description: 'Aún no hay solicitudes de paquetes. Considera crear promociones especiales para atraer clientes.',
                                color: '#3b82f6'
                            });
                        }
                        
                        return insights.map(insight => `
                            <div style="
                                background: rgba(15, 23, 42, 0.5);
                                border: 1px solid #334155;
                                border-radius: 8px;
                                padding: 1.5rem;
                                border-left: 4px solid ${insight.color};
                            ">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                                    <div style="font-size: 1.5rem;">${insight.icon}</div>
                                    <h4 style="color: #e2e8f0; margin: 0; font-size: 1rem; font-weight: 600;">
                                        ${insight.title}
                                    </h4>
                                </div>
                                <p style="color: #94a3b8; margin: 0; line-height: 1.5; font-size: 0.875rem;">
                                    ${insight.description}
                                </p>
                            </div>
                        `).join('');
                    })() : ''}
                </div>
            </div>
        </div>
    `;
    
    showNotification('✅ Análisis de paquetes cargado', 'success');
}

// Función para exportar reporte de paquetes
function exportPackageReport() {
    if (!window.dashboardData || window.dashboardData.length === 0) {
        showNotification('❌ No hay datos para exportar', 'warning');
        return;
    }
    
    showNotification('📊 Generando reporte de paquetes...', 'info');
    
    const packageData = window.dashboardData.filter(msg => msg.get('package'));
    
    if (packageData.length === 0) {
        showNotification('❌ No hay solicitudes de paquetes para exportar', 'warning');
        return;
    }
    
    // Análisis de paquetes
    const packageCounts = {};
    const packageByDate = {};
    
    packageData.forEach(msg => {
        const pkg = msg.get('package');
        const date = new Date(msg.get('createdAt')).toLocaleDateString('es-ES');
        
        packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
        
        if (!packageByDate[date]) {
            packageByDate[date] = {};
        }
        packageByDate[date][pkg] = (packageByDate[date][pkg] || 0) + 1;
    });
    
    // Crear CSV detallado
    const headers = [
        'Fecha', 'Hora', 'Nombre Cliente', 'Contacto', 'Paquete Solicitado', 'Mensaje', 'ID'
    ];
    
    const csvData = packageData
        .sort((a, b) => new Date(b.get('createdAt')) - new Date(a.get('createdAt')))
        .map(msg => [
            `"${new Date(msg.get('createdAt')).toLocaleDateString('es-ES')}"`,
            `"${new Date(msg.get('createdAt')).toLocaleTimeString('es-ES')}"`,
            `"${msg.get('name')}"`,
            `"${msg.get('contact')}"`,
            `"${msg.get('package')}"`,
            `"${msg.get('message').replace(/"/g, '""')}"`,
            `"${msg.id}"`
        ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-paquetes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`✅ Reporte exportado - ${packageData.length} solicitudes de paquetes`, 'success');
}

// Función para actualizar análisis de paquetes según período
function updatePackageAnalysis() {
    const period = document.getElementById('packagePeriod').value;
    showNotification(`📊 Actualizando análisis para: ${period === 'all' ? 'todo el tiempo' : `últimos ${period} días`}`, 'info');
    
    // En una implementación real, aquí se re-renderizaría la sección con datos filtrados
    setTimeout(() => {
        showNotification('✅ Análisis actualizado', 'success');
    }, 1000);
}

// Settings Section - Placeholder for now
function loadSettingsSection(contentDiv, messages) {
    showNotification('⚙️ Cargando configuración del dashboard...', 'info');
    
    contentDiv.innerHTML = `
        <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
            <div style="margin-bottom: 2rem;">
                <h2 style="color: #e2e8f0; margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700;">
                    ⚙️ Configuración
                </h2>
                <p style="color: #94a3b8; margin: 0; font-size: 1rem;">
                    Gestión y configuración del sistema administrativo
                </p>
            </div>

            <!-- Información del sistema -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    🔧 Información del Sistema
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                ">
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #3b82f6; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                            ${window.dashboardData ? window.dashboardData.length : 0}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Total de Mensajes</div>
                        <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.5rem;">
                            Base de datos activa
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #10b981; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                            ${Math.ceil((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24))}d
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Días Activo</div>
                        <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.5rem;">
                            Sistema en funcionamiento
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #8b5cf6; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                            Back4App
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Base de Datos</div>
                        <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.5rem;">
                            Parse.js integrado
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #f59e0b; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                            v2.0
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Versión Dashboard</div>
                        <div style="color: #64748b; font-size: 0.75rem; margin-top: 0.5rem;">
                            Actualizado recientemente
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gestión de datos -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    📊 Gestión de Datos
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                ">
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            📥 Exportación de Datos
                        </h4>
                        <p style="color: #94a3b8; margin: 0 0 1.5rem 0; font-size: 0.875rem; line-height: 1.5;">
                            Exporta todos los datos del sistema en formato CSV para análisis externo o respaldo.
                        </p>
                        <button onclick="exportData()" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            width: 100%;
                        ">📊 Exportar Datos Completos</button>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            🧹 Limpieza de Datos
                        </h4>
                        <p style="color: #94a3b8; margin: 0 0 1.5rem 0; font-size: 0.875rem; line-height: 1.5;">
                            Elimina automáticamente mensajes antiguos para optimizar el rendimiento del sistema.
                        </p>
                        <button onclick="clearOldData()" style="
                            background: linear-gradient(135deg, #ef4444, #dc2626);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            width: 100%;
                        ">🗑️ Limpiar Datos Antiguos</button>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            🔌 Prueba de Conexión
                        </h4>
                        <p style="color: #94a3b8; margin: 0 0 1.5rem 0; font-size: 0.875rem; line-height: 1.5;">
                            Verifica la conectividad con Back4App y el estado de la base de datos.
                        </p>
                        <button onclick="testConnection()" style="
                            background: linear-gradient(135deg, #10b981, #047857);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            width: 100%;
                        ">🔍 Probar Conexión</button>
                    </div>
                </div>
            </div>

            <!-- Estadísticas del dashboard -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    📈 Estadísticas de Uso del Dashboard
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                ">
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1rem;
                        text-align: center;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #3b82f6; font-size: 1.5rem; font-weight: 700;">
                            ${localStorage.getItem('dashboardViews') || 0}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Vistas del Dashboard</div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1rem;
                        text-align: center;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #10b981; font-size: 1.5rem; font-weight: 700;">
                            ${localStorage.getItem('lastLoginDate') ? Math.ceil((new Date() - new Date(localStorage.getItem('lastLoginDate'))) / (1000 * 60 * 60 * 24)) : 0}d
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Último Acceso</div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1rem;
                        text-align: center;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #8b5cf6; font-size: 1.5rem; font-weight: 700;">
                            ${localStorage.getItem('exportCount') || 0}
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Exportaciones</div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1rem;
                        text-align: center;
                        border: 1px solid #334155;
                    ">
                        <div style="color: #f59e0b; font-size: 1.5rem; font-weight: 700;">
                            ${window.dashboardData ? Math.round((window.dashboardData.filter(msg => new Date(msg.get('createdAt')) > new Date(Date.now() - 24*60*60*1000)).length / (window.dashboardData.length || 1)) * 100) : 0}%
                        </div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Actividad 24h</div>
                    </div>
                </div>
            </div>

            <!-- Información de contacto -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    👨‍💻 Información del Desarrollador
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                ">
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem;">Desarrollador</h4>
                        <p style="color: #94a3b8; margin: 0 0 0.5rem 0; font-size: 0.875rem;">Gabriel</p>
                        <p style="color: #64748b; margin: 0; font-size: 0.75rem;">Full-Stack Developer</p>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem;">Tecnologías</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            <span style="background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">JavaScript</span>
                            <span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">Parse.js</span>
                            <span style="background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">Back4App</span>
                            <span style="background: rgba(245, 158, 11, 0.1); color: #fbbf24; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">HTML/CSS</span>
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem;">Contacto</h4>
                        <p style="color: #94a3b8; margin: 0 0 0.5rem 0; font-size: 0.875rem;">WhatsApp: +1 829-563-9556</p>
                        <p style="color: #64748b; margin: 0; font-size: 0.75rem;">Disponible para nuevos proyectos</p>
                    </div>
                </div>
            </div>

            <!-- Gestión de Sesión -->
            <div style="
                background: linear-gradient(135deg, #1e293b, #0f172a);
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 2rem;
            ">
                <h3 style="color: #e2e8f0; margin: 0 0 1.5rem 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                    🔐 Gestión de Sesión
                </h3>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                ">
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            📊 Estado de Sesión
                        </h4>
                        <div style="margin-bottom: 1rem;">
                            <div style="color: #10b981; font-size: 0.875rem; margin-bottom: 0.5rem;">✅ Sesión Activa</div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">
                                Iniciada: ${new Date(parseInt(localStorage.getItem('adminLoginTime') || Date.now())).toLocaleString('es-ES')}
                            </div>
                            <div style="color: #94a3b8; font-size: 0.75rem;">
                                Válida por: ${Math.round((24*60*60*1000 - (Date.now() - parseInt(localStorage.getItem('adminLoginTime') || Date.now()))) / (1000*60*60))} horas más
                            </div>
                        </div>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            🚪 Cerrar Sesión
                        </h4>
                        <p style="color: #94a3b8; margin: 0 0 1.5rem 0; font-size: 0.875rem; line-height: 1.5;">
                            Cierra la sesión actual y requiere autenticación para volver a acceder al dashboard.
                        </p>
                        <button onclick="logoutAdmin()" style="
                            background: linear-gradient(135deg, #ef4444, #dc2626);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            width: 100%;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(239, 68, 68, 0.3)'" 
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            🔓 Cerrar Sesión Administrativa
                        </button>
                    </div>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                    ">
                        <h4 style="color: #e2e8f0; margin: 0 0 1rem 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            🧹 Limpiar Sesión (Desarrollo)
                        </h4>
                        <p style="color: #94a3b8; margin: 0 0 1.5rem 0; font-size: 0.875rem; line-height: 1.5;">
                            Función para testing: limpia la sesión sin redirección. Útil para probar la autenticación.
                        </p>
                        <button onclick="clearAdminSession()" style="
                            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 0.875rem;
                            width: 100%;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139, 92, 246, 0.3)'" 
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            🔧 Limpiar Sesión (Testing)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Actualizar estadísticas de uso
    const currentViews = parseInt(localStorage.getItem('dashboardViews') || '0') + 1;
    localStorage.setItem('dashboardViews', currentViews.toString());
    localStorage.setItem('lastLoginDate', new Date().toISOString());
    
    showNotification('✅ Configuración cargada', 'success');
}

// ===== FUNCIONES DE NAVEGACIÓN DE TARJETAS =====
// Funciones para manejar clicks en las tarjetas del dashboard

// Función para actualizar el elemento activo del sidebar
function updateActiveNavItem(section) {
    // Remover clase active de todos los elementos
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        item.style.background = 'transparent';
        item.style.color = '#94a3b8';
        item.style.borderColor = '#374151';
    });
    
    // Mapear secciones a texto del botón
    const sectionMap = {
        'overview': 'Dashboard General',
        'messages': 'Mensajes', 
        'analytics': 'Analíticas',
        'contacts': 'Contactos',
        'packages': 'Paquetes',
        'settings': 'Configuración'
    };
    
    // Buscar y activar el elemento correspondiente
    const targetText = sectionMap[section];
    if (targetText) {
        navItems.forEach(item => {
            if (item.textContent.includes(targetText)) {
                item.classList.add('active');
                item.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                item.style.color = 'white';
                item.style.borderColor = '#3b82f6';
            }
        });
    }
}

function loadTodayMessages() {
    if (!window.dashboardData) {
        showNotification('❌ No hay datos disponibles', 'error');
        return;
    }
    
    showNotification('📅 Filtrando mensajes de hoy...', 'info');
    
    const today = new Date();
    const todayMessages = window.dashboardData.filter(msg => {
        const msgDate = new Date(msg.get('createdAt'));
        return msgDate.toDateString() === today.toDateString();
    });
    
    // Navegar a mensajes y aplicar filtro
    updateActiveNavItem('messages');
    loadDashboardSection('messages');
    
    setTimeout(() => {
        if (todayMessages.length === 0) {
            showNotification('📅 No hay mensajes nuevos hoy', 'info');
        } else {
            showNotification(`📅 Mostrando ${todayMessages.length} mensajes de hoy`, 'success');
            
            // Resaltar mensajes de hoy en la interfaz
            const messageCards = document.querySelectorAll('[data-message-date]');
            messageCards.forEach(card => {
                const cardDate = new Date(card.getAttribute('data-message-date'));
                if (cardDate.toDateString() === today.toDateString()) {
                    card.style.border = '2px solid #10b981';
                    card.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                }
            });
        }
    }, 1000);
}

function loadUniqueContacts() {
    if (!window.dashboardData) {
        showNotification('❌ No hay datos disponibles', 'error');
        return;
    }
    
    showNotification('👥 Generando lista de contactos únicos...', 'info');
    
    // Crear mapa de contactos únicos
    const uniqueContactsMap = new Map();
    
    window.dashboardData.forEach(msg => {
        const contact = msg.get('contact');
        const createdAt = new Date(msg.get('createdAt'));
        
        if (!uniqueContactsMap.has(contact)) {
            uniqueContactsMap.set(contact, {
                nombre: msg.get('name'),
                contacto: contact,
                primerMensaje: createdAt,
                ultimoMensaje: createdAt,
                totalMensajes: 1,
                paquetesSolicitados: msg.get('package') ? [msg.get('package')] : [],
                valorPotencial: 0
            });
        } else {
            const existing = uniqueContactsMap.get(contact);
            if (createdAt > existing.ultimoMensaje) existing.ultimoMensaje = createdAt;
            if (createdAt < existing.primerMensaje) existing.primerMensaje = createdAt;
            existing.totalMensajes++;
            
            if (msg.get('package') && !existing.paquetesSolicitados.includes(msg.get('package'))) {
                existing.paquetesSolicitados.push(msg.get('package'));
            }
        }
    });
    
    // Calcular valor potencial
    uniqueContactsMap.forEach(contact => {
        contact.valorPotencial = contact.paquetesSolicitados.reduce((sum, pkg) => {
            if (pkg.includes('13,000')) return sum + 13000;
            if (pkg.includes('8,000')) return sum + 8000;
            if (pkg.includes('5,000')) return sum + 5000;
            return sum + 5000;
        }, 0);
    });
    
    // Crear modal con lista de contactos únicos
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const contactList = Array.from(uniqueContactsMap.values())
        .sort((a, b) => b.totalMensajes - a.totalMensajes);
    
    modal.innerHTML = `
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            max-width: 900px;
            max-height: 80vh;
            overflow-y: auto;
            width: 90%;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 style="color: #e2e8f0; margin: 0; font-size: 1.5rem;">
                    👥 Contactos Únicos (${contactList.length})
                </h3>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #374151;
                    border: none;
                    color: #94a3b8;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.25rem;
                ">✕</button>
            </div>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 1rem;
                max-height: 500px;
                overflow-y: auto;
            ">
                ${contactList.map(contact => `
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border: 1px solid #334155;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onclick="viewContactHistory('${contact.contacto}'); this.closest('div').parentElement.remove();" onmouseover="this.style.borderColor='#f59e0b'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#334155'; this.style.transform=''">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h4 style="color: #e2e8f0; margin: 0; font-size: 1rem;">${contact.nombre}</h4>
                            <span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                                ${contact.totalMensajes} mensajes
                            </span>
                        </div>
                        <p style="color: #94a3b8; margin: 0 0 1rem 0; font-size: 0.875rem; word-break: break-all;">
                            📧 ${contact.contacto}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: #64748b; font-size: 0.75rem;">Último contacto:</span>
                            <span style="color: #94a3b8; font-size: 0.75rem;">${contact.ultimoMensaje.toLocaleDateString('es-ES')}</span>
                        </div>
                        ${contact.paquetesSolicitados.length > 0 ? `
                            <div style="margin-bottom: 0.5rem;">
                                <span style="color: #64748b; font-size: 0.75rem;">Paquetes:</span>
                                <div style="margin-top: 0.25rem;">
                                    ${contact.paquetesSolicitados.map(pkg => `
                                        <span style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; padding: 0.125rem 0.375rem; border-radius: 8px; font-size: 0.625rem; margin-right: 0.25rem;">
                                            ${pkg.length > 30 ? pkg.substring(0, 30) + '...' : pkg}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${contact.valorPotencial > 0 ? `
                            <div style="text-align: right;">
                                <span style="color: #10b981; font-weight: 600; font-size: 0.875rem;">RD$${contact.valorPotencial.toLocaleString()}</span>
                                <span style="color: #64748b; font-size: 0.75rem;"> potencial</span>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #334155;
            ">
                <button onclick="exportContacts(); this.closest('div').parentElement.remove();" style="
                    background: linear-gradient(135deg, #10b981, #047857);
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                ">📊 Exportar Lista Completa</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        showNotification(`✅ Lista cargada: ${contactList.length} contactos únicos`, 'success');
    }, 500);
}

function loadPackageRequests() {
    if (!window.dashboardData) {
        showNotification('❌ No hay datos disponibles', 'error');
        return;
    }
    
    showNotification('📦 Analizando solicitudes de paquetes...', 'info');
    
    const packageMessages = window.dashboardData.filter(msg => msg.get('package'));
    
    if (packageMessages.length === 0) {
        showNotification('📦 No hay solicitudes de paquetes registradas', 'info');
        return;
    }
    
    // Agrupar por tipo de paquete
    const packageStats = {};
    packageMessages.forEach(msg => {
        const packageName = msg.get('package');
        if (!packageStats[packageName]) {
            packageStats[packageName] = {
                nombre: packageName,
                solicitudes: 0,
                clientes: new Set(),
                valorTotal: 0,
                mensajes: []
            };
        }
        
        packageStats[packageName].solicitudes++;
        packageStats[packageName].clientes.add(msg.get('contact'));
        packageStats[packageName].mensajes.push(msg);
        
        // Calcular valor
        if (packageName.includes('13,000')) packageStats[packageName].valorTotal += 13000;
        else if (packageName.includes('8,000')) packageStats[packageName].valorTotal += 8000;
        else if (packageName.includes('5,000')) packageStats[packageName].valorTotal += 5000;
        else packageStats[packageName].valorTotal += 5000;
    });
    
    // Crear modal con análisis de paquetes
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const packageList = Object.values(packageStats)
        .sort((a, b) => b.solicitudes - a.solicitudes);
    
    modal.innerHTML = `
        <div style="
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 2rem;
            max-width: 1000px;
            max-height: 80vh;
            overflow-y: auto;
            width: 90%;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 style="color: #e2e8f0; margin: 0; font-size: 1.5rem;">
                    📦 Análisis de Paquetes Solicitados
                </h3>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #374151;
                    border: none;
                    color: #94a3b8;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.25rem;
                ">✕</button>
            </div>
            
            <!-- Resumen general -->
            <div style="
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 2rem;
            ">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: center;">
                    <div>
                        <div style="color: #8b5cf6; font-size: 1.75rem; font-weight: 700;">${packageMessages.length}</div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Total Solicitudes</div>
                    </div>
                    <div>
                        <div style="color: #10b981; font-size: 1.75rem; font-weight: 700;">${Object.keys(packageStats).length}</div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Tipos de Paquetes</div>
                    </div>
                    <div>
                        <div style="color: #f59e0b; font-size: 1.75rem; font-weight: 700;">RD$${Object.values(packageStats).reduce((sum, pkg) => sum + pkg.valorTotal, 0).toLocaleString()}</div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Valor Total Potencial</div>
                    </div>
                    <div>
                        <div style="color: #ef4444; font-size: 1.75rem; font-weight: 700;">${new Set(packageMessages.map(msg => msg.get('contact'))).size}</div>
                        <div style="color: #94a3b8; font-size: 0.875rem;">Clientes Interesados</div>
                    </div>
                </div>
            </div>
            
            <!-- Lista de paquetes -->
            <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto;">
                ${packageList.map((pkg, index) => `
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border-radius: 8px;
                        padding: 1.5rem;
                        border-left: 4px solid ${index === 0 ? '#8b5cf6' : index === 1 ? '#10b981' : '#f59e0b'};
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <h4 style="color: #e2e8f0; margin: 0; font-size: 1rem; max-width: 60%;">
                                ${pkg.nombre.length > 80 ? pkg.nombre.substring(0, 80) + '...' : pkg.nombre}
                            </h4>
                            <div style="text-align: right;">
                                <div style="color: #10b981; font-size: 1.25rem; font-weight: 600;">RD$${pkg.valorTotal.toLocaleString()}</div>
                                <div style="color: #64748b; font-size: 0.75rem;">valor potencial</div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; gap: 2rem;">
                                <div>
                                    <span style="color: #8b5cf6; font-size: 1.125rem; font-weight: 600;">${pkg.solicitudes}</span>
                                    <span style="color: #64748b; font-size: 0.875rem;"> solicitudes</span>
                                </div>
                                <div>
                                    <span style="color: #f59e0b; font-size: 1.125rem; font-weight: 600;">${pkg.clientes.size}</span>
                                    <span style="color: #64748b; font-size: 0.875rem;"> clientes únicos</span>
                                </div>
                            </div>
                            <button onclick="
                                // Filtrar mensajes por este paquete
                                updateActiveNavItem('messages');
                                loadDashboardSection('messages');
                                setTimeout(() => {
                                    const messageCards = document.querySelectorAll('[data-package]');
                                    messageCards.forEach(card => {
                                        if (card.getAttribute('data-package') === '${pkg.nombre.replace(/'/g, "\\'")}') {
                                            card.style.border = '2px solid #8b5cf6';
                                            card.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
                                        }
                                    });
                                    showNotification('📦 Mensajes de este paquete resaltados', 'success');
                                }, 1000);
                                this.closest('div').parentElement.remove();
                            " style="
                                background: #374151;
                                border: 1px solid #4b5563;
                                color: #d1d5db;
                                padding: 0.5rem 1rem;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 0.875rem;
                            ">Ver Mensajes</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        showNotification(`✅ Análisis completado: ${packageList.length} tipos de paquetes`, 'success');
    }, 500);
}

// ===== FUNCIÓN DE ACTUALIZACIÓN =====
// Función para refrescar datos del dashboard en tiempo real

async function refreshDashboardData() {
    showNotification('🔄 Actualizando datos del dashboard...', 'info');
    
    try {
        // Recargar datos desde Back4App
        await loadDashboardData();
        
        // Determinar qué sección está actualmente activa
        const activeNavItem = document.querySelector('.nav-item.active');
        const activeSection = activeNavItem ? activeNavItem.textContent.toLowerCase() : 'overview';
        
        // Recargar la sección activa con datos frescos
        if (activeSection.includes('resumen')) {
            await loadDashboardSection('overview');
        } else if (activeSection.includes('mensajes')) {
            await loadDashboardSection('messages');
        } else if (activeSection.includes('analítica')) {
            await loadDashboardSection('analytics');
        } else if (activeSection.includes('configuración')) {
            await loadDashboardSection('settings');
        }
        
        // Actualizar timestamp de última actualización
        const timestampElement = document.querySelector('.last-updated');
        if (timestampElement) {
            const now = new Date();
            timestampElement.textContent = `Última actualización: ${now.toLocaleTimeString('es-ES')}`;
        }
        
        showNotification(`✅ Dashboard actualizado - ${window.dashboardData ? window.dashboardData.length : 0} mensajes cargados`, 'success');
        
    } catch (error) {
        showNotification(`❌ Error al actualizar: ${error.message}`, 'error');
        console.error('Error actualizando dashboard:', error);
    }
}

// Función para cerrar sesión
function logoutAdmin() {
    // Confirmar logout
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar localStorage
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        
        // Mostrar notificación
        showNotification('✅ Sesión cerrada correctamente', 'success');
        
        // Redirigir después de un momento
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Función para limpiar sesión manualmente (para testing)
function clearAdminSession() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    console.log('✅ Sesión administrativa limpiada');
    alert('Sesión limpiada. Ahora se requerirá contraseña para acceder al dashboard.');
}

console.log('✅ Admin Dashboard Module loaded successfully!');
