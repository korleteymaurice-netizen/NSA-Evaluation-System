function flashMiddleware(req,res,next){
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  req.flash = (type, message) => { req.session.flash = { type, message }; };
  next();
}
function requireAuth(req,res,next){ if(!req.session.user) return res.redirect('/login'); next(); }
function requireStudent(req,res,next){ if(!req.session.user) return res.redirect('/login'); if(req.session.user.role !== 'STUDENT') return res.status(403).render('errors/403',{title:'Access Denied'}); next(); }
function requireAdmin(req,res,next){ if(!req.session.user) return res.redirect('/admin/login'); if(req.session.user.role !== 'ADMIN') return res.status(403).render('errors/403',{title:'Access Denied'}); next(); }
module.exports = { flashMiddleware, requireAuth, requireStudent, requireAdmin };
