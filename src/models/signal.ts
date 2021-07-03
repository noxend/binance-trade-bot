import { Schema, model } from "mongoose";
import type { Document } from "mongoose";

export interface Signal extends Document {
  currency: string;
  sl: number;
  ep: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tf: string;
  side: string;
}

const SignalSchema = new Schema<Signal>(
  {
    currency: String,
    sl: Number,
    ep: Number,
    tp1: Number,
    tp2: Number,
    tp3: Number,
    tf: String,
    side: String,
  },
  { timestamps: true }
);

export default model<Signal>("signals", SignalSchema);
