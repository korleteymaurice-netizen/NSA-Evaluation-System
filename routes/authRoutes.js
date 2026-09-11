const r=require('express').Router();const c=require('../controllers/authController');const v=require('../middleware/validation');
r.get('/login',c.showLogin);r.post('/login',v.login,c.login);r.get('/register',c.showRegister);r.post('/register',v.registration,c.register);r.get('/logout',c.logout);module.exports=r;
