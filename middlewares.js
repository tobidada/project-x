import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).send("Unauthorized Action");
      }
      next();
    });
  } else {
    res.status(401).json({ error: "Unauthorized Action" });
  }
};

const isVerifiedClient = (req, res, next) => {
  const apiSecret = req.headers["api-secret"];

  if (apiSecret && apiSecret === process.env.API_SECRET) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized Action" });
  }
};

export { isAuthenticated, isVerifiedClient };
