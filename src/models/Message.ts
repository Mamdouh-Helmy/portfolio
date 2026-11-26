import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 2000 },
    repliedAt: { type: Date },
  },
  { timestamps: true },
);

export type MessageDoc = InferSchemaType<typeof schema> & { _id: string; createdAt: string };
export const Message: Model<InferSchemaType<typeof schema>> = models.Message ?? model("Message", schema);