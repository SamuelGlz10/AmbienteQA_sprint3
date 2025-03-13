// Controllers are the requests that are gonna be made by the routes to the server.
// This is the controller for the index route.

export const getIndex = (req, res) =>
  res.send(
    "Si ves esto, el API funciona. Usuario: admin, Contraseña: admining"
  );
export const getPing = (req, res) => res.send("Pong!");
