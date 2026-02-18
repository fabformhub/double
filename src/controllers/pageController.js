export const about = (req, res) => {
  res.render("about", { title: "About" });
};

export const contact = (req, res) => {
  res.render("contact", { title: "Contact" });
};

