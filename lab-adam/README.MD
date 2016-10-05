<title>Property Tracker v0.1</title>
<h1>An open API allowing authenticated users to create and modify properties around the USA</h1>


This API allows authenticated customers to perform CRUD operations on 'Properties' (houses).

To Run this app, fork/clone this rep, create a local repository and run "npm install" in the root directory. Tests can be run with "npm test". To start the server run "npm start."

<h1>Routes</h1>
<h2>Signup</h2>
New users can sign up at /api/signup. You must pass a valid (unique) username, email and password to pass authentication. You will be returned a token for future authentication.

<h2>Login</h2>
Login at /api/login with username and password.

<h2>Properties </h2>
<h3>Available CRUD Operations</h3>
<strong><em>Route path: /api/property/[:id]</em><strong>
- GET: takes an ID
- POST: takes a body JSON object with the properties listed below
- PUT: takes an ID and body JSON; modifies an existing object with the provided JSON.
- DELETE: takes an ID and deletes the object corresponding to the ID.

<h3>Property Attributes</h3>
<em>All of these properties are required in order to create a property.</em>
- "name", String
- "address", String
- "spareBedrooms", Number
- "description", String
<em>Additionally, each property will receive a 'created' and '\_id' property</em>
