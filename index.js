const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db')
const app = express()

//app routes
app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors(txt)
            VALUES($1)
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.txt]);
        res.send(response.rows[0]);

    } catch (error) {
        next(error)
    }
});
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `SELECT * from flavors ORDER BY created_at DESC;`
        const result = await client.query(SQL)
        res.send(result.rows)

    } catch (error) {
        next(error)
    }
});
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE flavors
            SET txt=$1, ranking=$2, update_at= now()
            WHERE id=$3 RETURNING *
        `;
        const response = await client.query(SQL, [reg.body.ranking, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error)
    }
});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE from flavors
        WHERE id = $1
        `;
        const response = await client.query([req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
});

const init = async () => {
    await client.connect();
    console.log('connected to database')
    let SQL = `DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
    );`
    await client.query(SQL)
    console.log('tables created')
    SQL = ` INSERT INTO flavors(txt, ranking) VALUES('vanilla', 1);
            INSERT INTO flavors(txt, ranking) VALUES('chocolate', 2);
            INSERT INTO flavors(txt, ranking) VALUES('strawberry', 3);`;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

init()