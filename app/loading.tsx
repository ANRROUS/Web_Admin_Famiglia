import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-slate-900 animate-spin" strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-500">Cargando Famiglia Admin...</p>
            </div>
        </div>
    );
}
