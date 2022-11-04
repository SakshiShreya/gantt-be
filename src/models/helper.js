export const durationSchema = {
  amount: { type: Number, required: true },
  unit: {
    type: String,
    enum: ["hours", "days"],
    required: true,
  },
};

export const addressSchema = {
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
};

export default { durationSchema, addressSchema };
