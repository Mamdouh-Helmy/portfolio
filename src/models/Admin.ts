import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, default: "", trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 }, 
    lastLoginAt: { type: Date, default: null },
    avatarUrl: { type: String, default: "", maxlength: 500 },
    avatarPublicId: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof adminSchema> & { createdAt: Date; updatedAt: Date };

export const Admin: Model<AdminDoc> =
  (models.Admin as Model<AdminDoc> | undefined) ?? (model("Admin", adminSchema) as unknown as Model<AdminDoc>);