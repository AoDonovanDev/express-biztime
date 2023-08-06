const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')


router.get('/', async(req, res, next) => {
  try{
    const ind = await db.query(`
      SELECT i.industry, c.name
      FROM industries AS i
      LEFT JOIN company_industries as ci
      ON i.code = ci.ind_code
      LEFT JOIN companies AS c
      ON ci.comp_code = c.code
    `)
    let indMap = {}
    for(let row of ind.rows){
      if(indMap[row.industry]){
        indMap[row.industry].push(row.name)
      } else {
        indMap[row.industry] = [row.name]
      }
    }
    return res.status(200).json({industries: indMap})
  } catch(e){
    next(e)
  }
}) 

router.post('/', async(req, res, next) => {
  let { industry, comp_code } = req.body;
  let ind_code = slugify(industry, {remove: /[*+~.()%'"!:@#]/g, trim: true, lower: true})
    if(ind_code.length > 5){
      ind_code = ind_code.slice(0,5)
    }
  try{
    if(comp_code){
        const result = await db.query(`INSERT INTO company_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code`, [comp_code, ind_code])
        return res.status(200).json({company_industry: result.rows[0]})
      }
    const result = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [ind_code, industry])
    return res.status(200).json({industry: result.rows[0]})
  } catch (e) {
    next(e)
  }
})

module.exports = router;