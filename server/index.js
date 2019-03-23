const keys = require('./keys');

// Express App Setup

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json())

// Postgres Client Setup

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));


// Setup of table for postgres if it doesnt exist
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

/* 
    Duplicate is used because if we have a client that is listening
    or publishing information on Redis then we have to make a duplicate connection.
    When a connection is turned into one that is going to listen or subscribe, or publish
    info it cannot be used for other purposes.
*/
const redisPublisher = redisClient.duplicate();


// Express route handlers

// Retrieves values from the Postgres client
app.get('/values/all', async (req,res) => {
    const values = await pgClient.query('SELECT * FROM VALUES');

    // value.rows send only the info from db and no other metadata
    res.send(values.rows);
});

// Retrieves values from the redis client
app.get('/values/current', async (req,res) => {
    redisClient.hgetall('values', (err,values) => {
        res.send(values);
    });
});

// Adds values from the React client to both the 
app.post('/value', (req,res) => {
    const index = req.body.index;

    // Capped because if Index is very large it could take days or months to calculate.
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high')
    }

    // The string 'Nothing yet' is added here because when the value comes in
    // the value hasn't been calculated
    redisClient.hset('values', index, 'Nothing yet')

    // This is done because the worker is listening to 
    // Insert events. When insert occurs then it kicks off
    // calulation and sets the value.
    redisPublisher.publish('insert', index)

    // Takes the submitted index and stores it into postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

    // send back an arbitrary response
    res.send({ working: true});
});

// Set up express server to listen on port
app.listen(5000, err => {
    console.log('Listening')
});