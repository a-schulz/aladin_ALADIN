const path = require("path");
// Requiring Ltijs
const lti = require("ltijs").Provider;

import { Router } from "express";

export const LTIRoutes = (router: Router) => {
	// Grading route
	router.post("/addLTIPlatform", async (req, res) => {
		try {
			const platform = req.body.platform; 
			
            const referencePlatform = await lti.registerPlatform(platform);

			return res.status(201).send("responseGrade");
		} catch (err) {
			console.log(err.message);
			return res.status(500).send({ err: err.message });
		}
	});

	return router;
};
