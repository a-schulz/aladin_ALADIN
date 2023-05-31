require('dotenv').config()
const path = require('path')
const router = require('express').Router()
// const routes = require('./src/routes')

const lti = require('ltijs').Provider

import { TaskRouteManager, ISerializedTaskRoute } from "./api/TaskRouteManager";
import { taskParts, tasks } from "./api/TaskGraphManager";
const serializedRoutes: Array<ISerializedTaskRoute> = taskParts.API;

// Setup
lti.setup("LTI_KEY",
  {
    url: 'mongodb://localhost/?authSource=admin',
    connection: { user: 'aladin', pass: 'aladin' }
  }, {
    appRoute: "/launch",
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: "None" // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: false // Set DevMode to true if the testing platform is in a different domain and https is not being used
  })


const taskRouteManager = new TaskRouteManager(lti.app);
taskRouteManager.addRoute(serializedRoutes);


lti.whitelist(new RegExp(/^\/api\/.*/))
lti.whitelist(new RegExp(/^\/.*/))

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token: any, req: any, res: any) => {
  // console.log(token)
  const task = `task/${token.platformContext.custom.task}`
  lti.redirect(res, `/${task}`)
  // return res.sendFile(path.join(__dirname, './public/index.html'))
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token: any, req: any, res: any) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

router.post('/grade', async (req: any, res: any) => {
  try {
    const idtoken = res.locals.token // IdToken
    const score = req.body.grade // User numeric score sent in the body
    // Creating Grade object
    const gradeObj = {
      userId: idtoken.user,
      scoreGiven: score,
      scoreMaximum: 100,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded'
    }

    // Selecting linetItem ID
    let lineItemId = idtoken.platformContext.endpoint.lineitem // Attempting to retrieve it from idtoken
    if (!lineItemId) {
      const response = await lti.Grade.getLineItems(idtoken, { resourceLinkId: true })
      const lineItems = response.lineItems
      if (lineItems.length === 0) {
        // Creating line item if there is none
        console.log('Creating new line item')
        const newLineItem = {
          scoreMaximum: 100,
          label: 'Grade',
          tag: 'grade',
          resourceLinkId: idtoken.platformContext.resource.id
        }
        const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem)
        lineItemId = lineItem.id
      } else lineItemId = lineItems[0].id
    }

    // Sending Grade
    const responseGrade = await lti.Grade.submitScore(idtoken, lineItemId, gradeObj)
    return res.send(responseGrade)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send({ err: err.message })
  }
})

// Names and Roles route
router.get('/members', async (req: any, res: any) => {
  try {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token)
    if (result) return res.send(result.members)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Deep linking route
router.post('/deeplink', async (req: any, res: any) => {
  try {
    const resource = req.body

    const items = {
      type: 'ltiResourceLink',
      title: 'Ltijs Demo',
      custom: {
        name: resource.name,
        value: resource.value
      }
    }

    const form = await lti.DeepLinking.createDeepLinkingForm(res.locals.token, items, { message: 'Successfully Registered' })
    if (form) return res.send(form)
    return res.sendStatus(500)
  } catch (err) {
    console.log(err.message)
    return res.status(500).send(err.message)
  }
})

// Return available deep linking resources
router.get('/resources', async (req: any, res: any) => {
  const resources = [
    {
      name: 'Resource1',
      value: 'value1'
    },
    {
      name: 'Resource2',
      value: 'value2'
    },
    {
      name: 'Resource3',
      value: 'value3'
    }
  ]
  return res.send(resources)
})

// Get user and context information
router.get('/info', async (req: any, res: any) => {
  const token = res.locals.token
  const context = res.locals.context

  const info: any = { };
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context

  return res.send(info)
});

(async () => {
  const { taskGraph } = await import("./api/TaskGraphManager");
  const { replayRoutes } = await import("./api/Replay");
  lti.app.use("/api", taskGraph(router));
  lti.app.use("/api", replayRoutes(router));
})();

// Wildcard route to deal with redirecting to React routes
router.get('/*', (req: any, res: any) => {
  if (req.originalUrl === "/api/fetchTasklist") {
    const names = Object.values(tasks).map((task) => task.name);
    res.status(200).json(JSON.stringify(names));
  } else {
    res.sendFile(path.join(__dirname, './public/index.html'))
  }
})

// Setting up routes
lti.app.use(router);

// Setup function
const setup = async () => {
  await lti.deploy({ port: "8000" })

  /**
   * Register platform
   */
  const livePlatform = await lti.registerPlatform({
    url: 'https://bildungsportal.sachsen.de/opal',
    name: 'OPAL',
    clientId: 'OPALADIN_Live',
    authenticationEndpoint: 'https://bildungsportal.sachsen.de/opal/ltiauth',
    accesstokenEndpoint: 'https://bildungsportal.sachsen.de/opal/restapi/lti/token',
    authConfig: { method: 'JWK_SET', key: 'https://bildungsportal.sachsen.de/opal/restapi/lti/keys' }
  })

  const previewPlatform = await lti.registerPlatform({
    url: 'https://bildungsportal.sachsen.de/preview/opal',
    name: 'OPAL_Preview',
    clientId: 'OPALADIN_Preview',
    authenticationEndpoint: 'https://bildungsportal.sachsen.de/preview/opal/ltiauth/',
    accesstokenEndpoint: 'https://bildungsportal.sachsen.de/preview/opal/restapi/lti/token',
    authConfig: { method: 'JWK_SET', key: 'https://bildungsportal.sachsen.de/preview/opal/restapi/lti/keys' }
  })
}

setup()