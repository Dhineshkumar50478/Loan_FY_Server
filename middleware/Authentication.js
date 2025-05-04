function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    try {
      const decoded = jwt.verify(token, "your_secret_key");
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  module.exports = authenticate;
  