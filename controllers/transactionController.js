//Database initialization/connection
const db = require('./db');

exports.createTransaction = (req, res) => {
    const {
        type,
        category,
        amount,
        desc,
        method,
        date,
        recurring,
        receipt,
        tags,
    } = req.body;  

    if(!type || !category || !amount || !date || !recurring)
        return res.status(400).json({ error: "Not all necessary fields are filled in" });

    
};

exports.getTransaction = (req, res) => {

};

exports.getTransactions = (req, res) => {

};

exports.updateTransaction = (req, res) => {

};

exports.deleteTransaction = (req, res) => {

};