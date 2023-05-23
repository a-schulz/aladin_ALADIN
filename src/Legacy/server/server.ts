import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { TaskRouteManager, ISerializedTaskRoute } from "./api/TaskRouteManager";
import { taskParts } from "./api/TaskGraphManager";

// load environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const app: express.Application = express();

const serializedRoutes: Array<ISerializedTaskRoute> = taskParts.API;

(async () => {
	try {
		const port: string = process.env.PORT || "8000";

		app.use(cors());
		app.use(bodyParser.json({ limit: "50mb" }));
		app.use(
			bodyParser.urlencoded({
				limit: "50mb",
				extended: true,
				parameterLimit: 50000,
			})
		);

		// initialize API
		const taskRouteManager = new TaskRouteManager(app);
		taskRouteManager.addRoute(serializedRoutes);

		// const { dbRoutes } = await import("./api/DB");
		// const { maximaRoutes } = await import("./api/Maxima");
		const { taskGraph } = await import("./api/TaskGraphManager");
		const { replayRoutes } = await import("./api/Replay");
		// app.use("/api", dbRoutes(express.Router(), channel));
		// app.use("/api", maximaRoutes(express.Router(), channel));
		app.use("/api", taskGraph(express.Router()));
		app.use("/api", replayRoutes(express.Router()));

		const buildResourcesPath = `${__dirname}/public/`;
		app.use(express.static(buildResourcesPath));

		app.get("/", (req: express.Request, res: express.Response) => {
			res.sendFile(`${buildResourcesPath}index.html`);
		});

		app.listen(port, () => {
			// tslint:disable-next-line:no-console
			console.log(`server started at http://localhost:${port}`);
		});
	} catch (error) {
		throw Error(error);
	} finally {
		// const cleanup = () => broker.tearDown();
		// [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
		//     process.on(eventType, cleanup.bind(null, eventType));
		// });
	}
})();
