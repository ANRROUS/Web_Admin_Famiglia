import { Database, Shield, Globe, Server } from 'lucide-react';
import prisma from '@/lib/prisma';
import dbConnect from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

async function getSystemInfo() {
    let mongoStatus = 'Desconectado';
    let supabaseStatus = 'Desconectado';

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

    return {
        mongoStatus,
        supabaseStatus,
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
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    Próximamente
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Validación automática del estado del sitio web</p>
                        </div>
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Tiempo de Respuesta</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    Próximamente
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Monitoreo de rendimiento del frontend</p>
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
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    Próximamente
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Validación de endpoints críticos del backend</p>
                        </div>
                        <div className="py-3 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Servicios Externos</span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    Próximamente
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">Estado de integraciones y servicios de terceros</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
