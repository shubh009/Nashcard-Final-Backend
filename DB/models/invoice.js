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
    OrderID: {
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
    amount: { // this represent the amount of invoice
        type: Number,
        required: true
    },
    balance: { // this  represent the amount received in payment
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
    }

}, {
    timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
