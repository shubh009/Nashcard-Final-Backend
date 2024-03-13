const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true
    },
    userID: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    pdf: {
        data: Buffer, // Store PDF data as Buffer
        contentType: String // Mime type of the PDF
    },
    expense: {
        type: Number,
        default: 0,
        required: true
    }

}, {
    timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
