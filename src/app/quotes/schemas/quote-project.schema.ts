import { Schema } from "mongoose";

export const QuoteProjectSchema = new Schema({
    name: String,
    reference: String,
    status: Number,
    customer: String,
    createdAt: Number,
    updatedAt: Number,
    deletedAt: Number,
    quotes: Schema.Types.Mixed
});