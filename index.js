const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
const fs = require('fs');
const {format} = require('url');
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const CONFIG = {
    DOMAIN: 'laratest.eu.auth0.com',
    CLIENT_ID: 'af8fhMNH5rc3fySlCtgfnIcKTQiOZshS',
    CLIENT_SECRET: '5-HCY-yOr2bk8NnDsPeupyCLnoNic9HmHgiwMU3xoOfAFj2ghzsxACqWV7FahpOm',
    REDIRECT_TO: 'https://28df-178-251-107-52.ngrok-free.app/callback',
};

app.get('/', async (req, res) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        res.redirect('/login');
        return;
    }

    res.send(`User's token: ${accessToken}`);
});

app.get('/login', async (req, res) => {
    const authUrl = format({
        protocol: 'https',
        hostname: CONFIG.DOMAIN,
        pathname: '/authorize',
        query: {
            client_id: CONFIG.CLIENT_ID,
            redirect_uri: CONFIG.REDIRECT_TO,
            response_type: 'code',
            response_mode: 'query'
        }
    });
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        res.send('No code provided');
        return;
    }

    try {
        const tokenResponse = await axios.post(`https://${CONFIG.DOMAIN}/oauth/token`, {
            client_id: CONFIG.CLIENT_ID,
            client_secret: CONFIG.CLIENT_SECRET,
            redirect_uri: CONFIG.REDIRECT_TO,
            code: code,
            grant_type: 'authorization_code'
        });

        const accessToken = tokenResponse.data.access_token;
        res.cookie('access_token', accessToken, {httpOnly: true});
        res.redirect('/');
    } catch (error) {
        console.error('Error exchanging code for token', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Auth0 app listening on port ${port}`)
})
