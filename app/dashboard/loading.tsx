import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="p-3 bg-slate-50 rounded-full">
                    <Loader2 className="h-8 w-8 text-slate-900 animate-spin" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-slate-600 animate-pulse">Cargando contenido...</p>
            </div>
        </div>
    );
}
