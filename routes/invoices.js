
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows })
  } catch (e) {
    return next(e);
  }
})

router.get('/:id', async(req, res, next) => {
  const { id } = req.params;
   try {
    const results = await db.query(`SELECT * FROM invoices WHERE id = $1 `, [id]);
    const comp = await db.query(`Select * FROM companies WHERE code = $1`, [results.rows[0].comp_code])
    return res.json({ invoice: results.rows[0], company: comp.rows[0]})
  } catch (e) {
    return next(e);
  }
})


router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
    return res.status(201).json({ invoice: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    if(paid){
      const date = new Date()
      const payUpdate = await db.query('UPDATE invoices SET amt=$1, paid=$3, paid_date=$4 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id, paid, date]);
      return res.send({ invoice: payUpdate.rows[0] })
    }
    const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id])
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update invoice with code of ${code}`, 404)
    }
    return res.send({ invoice: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})

router.get('/companies/:code', async (req, res, next) => {
  const { code } = req.params
  try{
    const results = await db.query('SELECT * FROM invoices WHERE comp_code = $1', [code])
    const comp = await db.query('SELECT * FROM companies WHERE code = $1', [code])
    return res.json({company: comp.rows[0], invoices: results.rows})
  } catch (e) {
    return next(e)
  }
})

module.exports = router;