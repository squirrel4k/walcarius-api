import { Schema } from "mongoose";

export const QuoteSchema = new Schema({
    status: Number,
    name: String,
    number: String,
    reference: String,
    isEn1090: Boolean,
    projectId: Schema.Types.ObjectId,
    createdAt: Number,
    updatedAt: Number,
    deletedAt: Number,
    project: Schema.Types.Mixed,
    elements: Schema.Types.Mixed,
    needSandblasting: Boolean,
    needMetallization: Boolean,
    needLacquering: Boolean,
    needPainting: Boolean,
    needGalvanization: Boolean,
    remarks: String,
    totalPrice: Number
});