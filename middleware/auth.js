function requireAuth(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.redirect('/auth/login');
    }
  }
  
  module.exports = { requireAuth };
  