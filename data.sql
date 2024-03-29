\c biztime

DROP TABLE IF EXISTS  invoices CASCADE;
DROP TABLE IF EXISTS  companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS company_industries CASCADE;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

INSERT INTO companies (code, name, description)
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('meta', 'facbook', 'zuckterbarg');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null),
         ('meta', 800, false, null);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL 
);

CREATE TABLE company_industries(
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE
);

INSERT INTO industries (code, industry)
  VALUES ('tech', 'Technology'),
         ('sls', 'Sales'),
         ('sclm', 'Social-Media');

INSERT INTO company_industries (comp_code, ind_code)
  VALUES ('apple', 'tech'),
         ('apple', 'sls'),
         ('ibm', 'tech'),
         ('meta', 'tech'),
         ('meta', 'sclm'); 


