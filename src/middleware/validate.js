export function validate(fields) {
  return function (req, res, next) {
    for (const field of fields) {
      if (!req.body[field] || req.body[field].trim() === "") {
        return res.status(400).send(`Missing field: ${field}`);
      }
    }
    next();
  };
}

