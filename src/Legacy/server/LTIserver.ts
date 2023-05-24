const path = require('path')

// Require Provider 
const lti = require('ltijs').Provider

// Setup provider
lti.setup('LTIKEY', // Key used to sign cookies and tokens
  { // Database configuration
    url: 'mongodb://localhost/',
    connection: { user: 'aladin', pass: 'aladin' }
  },
  { // Options
    appRoute: '/', loginRoute: '/login', // Optionally, specify some of the reserved routes
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to false if running in a production environment with https
  }
)

// Set lti launch callback
lti.onConnect((token:any , req:any, res: any) => {
  console.log(token)
  return res.send('It\'s alive!')
})

const setup = async () => {
  // Deploy server and open connection to the database
  await lti.deploy({ port: 8000 }) // Specifying port. Defaults to 3000

  // Register platform
  await lti.registerPlatform({
    url: 'https://bildungsportal.sachsen.de/opal/',
    name: 'OPAL',
    clientId: 'OPALClient',
    authenticationEndpoint: 'https://bildungsportal.sachsen.de/opal/auth',
    accesstokenEndpoint: 'https://bildungsportal.sachsen.de/opal/token',
    authConfig: { method: 'JWK_SET', key: 'https://bildungsportal.sachsen.de/opal/keyset' }
  })
  console.log("listening on port 8000")
}

setup()