/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin"

import {onRequest} from "firebase-functions/v2/https";

const {onRequest} = require("firebase-functions/https");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp()

const realtimeDB = admin.realtimeDB()

// FUNCTIONS

export const getGameList = onRequest({cors: true}, async (request, response) => {
    try {
        const snapshot = await realtimeDB.ref("ldjvv1/gamelist").once("value");
        if (snapshot.exists()) {
            const gamelist = snapshot.val()
            const gamelistFormatted = Object.values(gamelist);
            response.json(gamelistFormatted)
        } else {
            response.status(404).send("Aucun jeu récupéré")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de la récupération des jeux -> " + error)
    }
})

export const addGAme = onRequest({cors: true}, async (request, response) => {
    try {
        const name = request.query.name
        const platformId = request.query.platformId
        const statusId = request.query.statusId 
        const releaseDate = request.query.releaseDate
        const purchaseDate = request.query.purchaseDate
        const startDate = request.query.startDate
        const endDate = request.query.endDate
        const index = request.query.index

        const ref = realtimeDB.ref(`ldjvv1/gamelist/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            const newGame = {
                name,
                platformId,
                statusId,
                releaseDate,
                purchaseDate,
                startDate,
                endDate,
                index,
            }

            await ref.set(newGame)

            response.status(201).send("Jeu ajouté") 
        } else {
            response.stauts(400).send("Un jeu a déjà cet index")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de l'ajout du jeu -> " + error)
    }
})