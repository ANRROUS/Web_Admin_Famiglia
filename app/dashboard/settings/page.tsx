import { Database, Shield, Globe, Server, CheckCircle, XCircle, Clock } from 'lucide-react';
import prisma from '@/lib/prisma';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

async function getSystemInfo() {
    let mongoStatus = 'Desconectado';
    let supabaseStatus = 'Desconectado';
    let frontendStatus = 'Offline';
    let backendStatus = 'Offline';
    let frontendLatency = 0;
    let backendLatency = 0;

    // Check MongoDB
    try {
        await dbConnect();
        mongoStatus = 'Conectado';
    } catch (error) {
        console.error('MongoDB check failed:', error);
    }

    // Check Supabase (Prisma)
    try {
        await prisma.$queryRaw`SELECT 1`;
        supabaseStatus = 'Conectado';
    } catch (error) {
        console.error('Supabase check failed:', error);
    }

    // Check Frontend
    try {
        const start = Date.now();
        const res = await fetch('https://radiant-truth-production.up.railway.app/', { method: 'HEAD', cache: 'no-store' });
        if (res.ok) {
            frontendStatus = 'Online';
            frontendLatency = Date.now() - start;
        }
    } catch (error) {
        console.error('Frontend check failed:', error);
    }

    // Check Backend
    try {
        const start = Date.now();
        // Checking the root or a health endpoint if available. Using root for now.
        const res = await fetch('https://e-commercefamiglia-production.up.railway.app', { method: 'HEAD', cache: 'no-store' });
        if (res.ok || res.status === 404) { // 404 might mean the server is up but root has no content, which is "Online" for the server itself
            backendStatus = 'Online';
            backendLatency = Date.now() - start;
        }
    } catch (error) {
        console.error('Backend check failed:', error);
    }

    return {
        mongoStatus,
        supabaseStatus,
        frontendStatus,
        backendStatus,
        frontendLatency,
        backendLatency
    };
}

export default async function SettingsPage() {
    const systemInfo = await getSystemInfo();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
                <p className="text-slate-500 mt-1 text-sm">Administración y monitoreo del panel de control</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Database Status */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <Database size={20} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Estado de Bases de Datos</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">MongoDB (Auditoría)</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${systemInfo.mongoStatus === 'Conectado'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                {systemInfo.mongoStatus}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Supabase (Datos)</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${systemInfo.supabaseStatus === 'Conectado'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                {systemInfo.supabaseStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <Shield size={20} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Seguridad</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Autenticación JWT</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    Activo
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Protección de rutas mediante tokens JWT</p>
                        </div>
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Middleware de Protección</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    Activo
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Validación de acceso en todas las rutas del dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Frontend Health Check */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <Globe size={20} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Estado del Frontend</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Página Principal</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${systemInfo.frontendStatus === 'Online'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                    {systemInfo.frontendStatus}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                {systemInfo.frontendStatus === 'Online'
                                    ? 'El sitio web está accesible y respondiendo correctamente'
                                    : 'No se pudo conectar con el sitio web'}
                            </p>
                        </div>
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Tiempo de Respuesta</span>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-sm font-medium text-slate-900">{systemInfo.frontendLatency}ms</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Latencia de conexión al servidor frontend</p>
                        </div>
                    </div>
                </div>

                {/* Backend Health Check */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                            <Server size={20} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Estado del Backend</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">API Principal</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${systemInfo.backendStatus === 'Online'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                    {systemInfo.backendStatus}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                {systemInfo.backendStatus === 'Online'
                                    ? 'La API está operativa y aceptando conexiones'
                                    : 'No se pudo establecer conexión con la API'}
                            </p>
                        </div>
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Tiempo de Respuesta</span>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-sm font-medium text-slate-900">{systemInfo.backendLatency}ms</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Latencia de conexión al servidor backend</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
