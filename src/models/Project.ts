import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const bi = { ar: { type: String, required: true }, en: { type: String, required: true } };

const schema = new Schema(
  {
    title: bi,
    description: bi,
    tags: [String],
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    link: { type: String, default: "" },
    repo: { type: String, default: "" },
    category: { type: String, default: "" },
    year: { type: String, default: "" },
    metrics: [{ _id: false, value: String, ar: String, en: String }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

type Bilingual = { ar: string; en: string };

export type ProjectDoc = Omit<InferSchemaType<typeof schema>, "title" | "description"> & {
  _id: string;
  title: Bilingual;
  description: Bilingual;
};

export const Project: Model<InferSchemaType<typeof schema>> =
  models.Project ?? model("Project", schema);