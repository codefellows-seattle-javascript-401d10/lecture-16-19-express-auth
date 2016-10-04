##About
Basic authentication!

##Route Documentation

##`/api/signup` POST request
- The client should pass in the user name and password.
- The password is temporarily stored and turned into a scrambled hash
- A new user is generated using this information and a token is created for the user and sent back as a response from the server.
- The server should respond with `400 Bad Request` to failed request

##`/api/login` GET request
- The client should pass in the user name and password with a `basicAuth` header.
- If a user is found with the given user name, the given password is compared with the hashed password saved in the database.
- A token is generated for the authenticated user and sent back as the server's response.
- If the password is invalid, the server should respond with `401 Unauthorized`.
