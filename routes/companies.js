
const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')


router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows })
  } catch (e) {
    return next(e);
  }
})

router.get('/:code', async(req, res, next) => {
  const { code } = req.params;
   try {
    const comp = await db.query(`SELECT * FROM companies WHERE code = $1 `, [code]);
    const ind = await db.query(`
      SELECT c.code, c.name, i.industry
      FROM companies AS c
      LEFT JOIN company_industries as ci
      ON c.code = ci.comp_code
      LEFT JOIN industries AS i
      ON ci.ind_code = i.code
      WHERE c.code = $1
    `, [code])
    const indRows = ind.rows.map(i => i.industry)
    if (comp.rows.length === 0) {
      throw new ExpressError(`Can't get company with code of ${code}`, 404)
    }
    return res.status(200).json({ company: comp.rows[0], industries: indRows })
  } catch (e) {
    return next(e);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let code = slugify(name, {remove: /[*+~.()%'"!:@#]/g, trim: true, lower: true})
    if(code.length > 5){
      code = code.slice(0,5)
    }
    const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    return res.status(201).json({ company: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404)
    }
    return res.send({ company: results.rows[0] })
  } catch (e) {
    return next(e)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
    return res.send({ msg: "DELETED!" })
  } catch (e) {
    return next(e)
  }
})

module.exports = router;