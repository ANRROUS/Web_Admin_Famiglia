import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditoria extends Document {
  usuarioId: string | null;
  anonimoId: string | null;
  rol: string | null;
  accion: string;
  recurso: string | null;
  recursoId: string | null;
  ruta: string | null;
  meta: Record<string, unknown>;
  creadoEn: Date;
}

const AuditoriaSchema = new Schema<IAuditoria>({
  usuarioId: { type: String, default: null },
  anonimoId: { type: String, default: null },
  rol: { type: String, default: null },
  accion: { type: String, required: true },
  recurso: { type: String, default: null },
  recursoId: { type: String, default: null },
  ruta: { type: String, default: null },
  meta: { type: Schema.Types.Mixed, default: {} },
  creadoEn: { type: Date, default: Date.now }
}, { versionKey: false });

export const Auditoria = mongoose.models.Auditoria || mongoose.model<IAuditoria>('Auditoria', AuditoriaSchema);
