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
