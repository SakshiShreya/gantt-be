import mongoose from "mongoose";

export const durationSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  unit: {
    type: String,
    enum: ["hours", "days"],
    required: true,
  },
});

export default { durationSchema };
