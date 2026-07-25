/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {initializeApp} from "firebase-admin/app"
import { getDatabase } from "firebase-admin/database";
import {onRequest} from "firebase-functions/v2/https";

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

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// console.log("admin default default")
// console.log(admin.default.default)
console.log("initializeApp")
console.log(initializeApp)

// admin.initializeApp();

initializeApp();

const realtime = getDatabase()

// FUNCTIONS

export const getGameList = onRequest({cors: true}, async (request, response) => {
    try {
        const snapshot = await realtime.ref("ldjvv1/gamelist").once("value");
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

export const getPlatforms = onRequest({cors: true}, async (request, response) => {
    try {
        const snapshot = await realtime.ref(`ldjvv1/platforms`).once("value");
        if (snapshot.exists()) {
            const platform = snapshot.val()
            // const platformFormatted = Object.values(platform)
            const platformFormatted = platform
            response.json(platformFormatted)

        } else {
            response.status(404).send("Aucune plateforme récupérée")
        } 
    } catch (error) {
            response.status(500).send("Erreur de la récupération des plateformes -> " + error)
    }
})

export const getPlatform = onRequest({cors: true}, async (request, response) => {
    try {
        const index = request.query.index
        const snapshot = await realtime.ref(`ldjvv1/platforms/${index}`).once("value");
        if (snapshot.exists()) {
            const platform = snapshot.val()
            // const platformFormatted = platform
            response.json(platform)

        } else {
            response.status(404).send("Aucune plateform correspondante")
        } 
    } catch (error) {
            response.status(500).send("Erreur de la récupération de la plateforme " + index + " -> " + error)
    }
})

export const getStatuses = onRequest({cors: true}, async (request, response) => {
    try {
        const snapshot = await realtime.ref(`ldjvv1/statuses`).once("value");
        if (snapshot.exists()) {
            const status = snapshot.val()
            // const statusFormatted = Object.values(status)
            const statusFormatted = status
            response.json(statusFormatted)

        } else {
            response.status(404).send("Aucun statut récupéré")
        } 
    } catch (error) {
            response.status(500).send("Erreur de la récupération des statuts -> " + error)
    }
})

export const getStatus = onRequest({cors: true}, async (request, response) => {
    try {
        const index = request.query.index
        const snapshot = await realtime.ref(`ldjvv1/statuses/${index}`).once("value");
        if (snapshot.exists()) {
            const status = snapshot.val()
            // const statusFormatted = Object.values(status)
            response.json(status)

        } else {
            response.status(404).send("Aucun statut correspondant")
        } 
    } catch (error) {
            response.status(500).send("Erreur de la récupération du statut " + index + " -> " + error)
    }
})

export const addGame = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const name = request.query.name
        const platformId = request.query.platformId
        const statusId = request.query.statusId ?? null
        const releaseDate = request.query.releaseDate ?? null
        const purchaseDate = request.query.purchaseDate ?? null
        const startDate = request.query.startDate ?? null
        const endDate = request.query.endDate ?? null
        const index = request.query.index 
        const cover = `https://img.ldjvv1.ericthiberge.fr/cover/${index}.webp`;
        const seriesId = request.query.seriesId ?? null   

        const collectionFlag = request.query.collectionFlag ?? "false" // à ajouter à la fonction merci, ça c'est du boolean
        const DLCFlag = request.query.DLCFlag ?? "false" // à ajouter à la fonction merci, ça c'est du boolean
        const episodicFlag = request.query.episodicFlag ?? "false" // à ajouter à la fonction merci, ça c'est du boolean

        const collectionGames = request.query.collectionGames ?? [] // à ajouter à la fonction merci, ça c'est un array de objects
        const DLCGames = request.query.collectionGames ?? [] // à ajouter à la fonction merci, ça c'est un array de objects
        const episodicGames = request.query.episodicGames ?? [] // à ajouter à la fonction merci, ça c'est un array de objects

        const ref = realtime.ref(`ldjvv1/gamelist/${index}`);
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
                cover,
                seriesId
            }

            await ref.set(newGame)

            response.status(201).send("Jeu ajouté") 
        } else {
            response.status(400).send("Un jeu a déjà cet index")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de l'ajout du jeu -> " + error)
    }
})



export const addPlatform = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const name = request.query.name
        const index = request.query.index 
        const color = request.query.color 

        const ref = realtime.ref(`ldjvv1/platforms/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            const newPlatform = {
                name,
                index,
                color
            }

            await ref.set(newPlatform)

            response.status(201).send("Plateforme ajoutée") 
        } else {
            response.status(400).send("Une plateforme existe déjà avec cet ID")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de l'ajout de la plateforme -> " + error)
    }
})



export const addStatus = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const name = request.query.name
        const index = request.query.index
        const color = request.query.color

        const ref = realtime.ref(`ldjvv1/statuses/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            const newStatus = {
                name,
                index,
                color
            }

            await ref.set(newStatus)

            response.status(201).send("Statut ajoutée") 
        } else {
            response.status(400).send("Un statut existe déjà avec cet ID")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de l'ajout du statut -> " + error)
    }
})

export const updateGame = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const index = request.query.index;

        const ref = realtime.ref(`ldjvv1/gamelist/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            return response.status(404).send("Jeu introuvable");
        }

        const updates = {};

        if (request.query.name !== undefined) updates.name = request.query.name;
        if (request.query.platformId !== undefined) updates.platformId = request.query.platformId;
        if (request.query.statusId !== undefined) updates.statusId = request.query.statusId;
        if (request.query.releaseDate !== undefined) updates.releaseDate = request.query.releaseDate;
        if (request.query.purchaseDate !== undefined) updates.purchaseDate = request.query.purchaseDate;
        if (request.query.startDate !== undefined) updates.startDate = request.query.startDate;
        if (request.query.endDate !== undefined) updates.endDate = request.query.endDate;
        if (request.query.seriesId !== undefined) updates.seriesId = request.query.seriesId;

        await ref.update(updates);

        response.status(200).send("Jeu mis à jour");
    } catch (error) {
        response.status(500).send("Erreur lors de la mise à jour du jeu -> " + error);
    }
});

export const updatePlatform = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const index = request.query.index;

        const ref = realtime.ref(`ldjvv1/platforms/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            return response.status(404).send("Plateforme introuvable");
        }

        const updates = {};

        if (request.query.name !== undefined) updates.name = request.query.name;
        if (request.query.color !== undefined) updates.color = request.query.color;

        await ref.update(updates);

        response.status(200).send("Plateforme mise à jour");
    } catch (error) {
        response.status(500).send("Erreur lors de la mise à jour de la plateforme -> " + error);
    }
});

export const updateStatus = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const index = request.query.index;

        const ref = realtime.ref(`ldjvv1/statuses/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            return response.status(404).send("Statut introuvable");
        }

        const updates = {};

        if (request.query.name !== undefined) updates.name = request.query.name;
        if (request.query.color !== undefined) updates.color = request.query.color;

        await ref.update(updates);

        response.status(200).send("Statut mis à jour");
    } catch (error) {
        response.status(500).send("Erreur lors de la mise à jour du statut -> " + error);
    }
});

export const deleteGame = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const index = request.query.index;

        const ref = realtime.ref(`ldjvv1/gamelist/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            return response.status(404).send("Jeu introuvable");
        }

        await ref.remove();

        response.status(200).send("Jeu supprimé");
    } catch (error) {
        response.status(500).send("Erreur lors de la suppression du jeu -> " + error);
    }
});

export const getSeries = onRequest({cors: true}, async (request, response) => {
    try {
        const snapshot = await realtime.ref(`ldjvv1/series`).once("value");
        if (snapshot.exists()) {
            const series = snapshot.val()
            const seriesFormatted = series
            response.json(seriesFormatted)
        } else {
            response.status(404).send("Aucune série récupérée")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de la récupération des séries -> " + error)
    }
})

export const addSeries = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const name = request.query.name
        const index = request.query.index

        const ref = realtime.ref(`ldjvv1/series/${index}`);
        const snapshot = await ref.once("value")

        if (!snapshot.exists()) {
            const newSeries = {
                name,
                index
            }

            await ref.set(newSeries)

            response.status(201).send("Série ajoutée")
        } else {
            response.status(400).send("Une série existe déjà avec cet ID")
        }
    } catch (error) {
        response.status(500).send("Erreur lors de l'ajout de la série -> " + error)
    }
})

export const updateSeries = onRequest({cors: true, invoker: "public"}, async (request, response) => {
    try {
        const index = request.query.index;

        const ref = realtime.ref(`ldjvv1/series/${index}`);
        const snapshot = await ref.once("value");

        if (!snapshot.exists()) {
            return response.status(404).send("Série introuvable");
        }

        const updates = {}

        if (request.query.name !== undefined) updates.name = request.query.name;

        await ref.update(updates)

        response.status(200).send("Série mise à jour")
    } catch (error) {
        response.status(500).send("Erreur lors de la mise à jour de la série -> " + error)
    }
})