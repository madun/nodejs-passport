const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

// handle register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } =  req.body;

    let errors = [];
    // check required field
    if(!name || !email || !password || !password2){
        errors.push({ msg: 'Please fill in all Fields' });
    }

    // check password match
    if(password !== password2){
        errors.push({ msg: 'Password do not match' });
    }

    // check password length
    if(password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // validation passed
        User.findOne({ email: email })
            .then(user => {
                if(user) {
                    // user exist
                    errors.push({ msg: 'Email has already taken' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // hash password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            // set password to hash
                            newUser.password = hash;
                            // save user
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'Your are now registered! Lets login');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                        }))
                }
            });
    }
})

// handle login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// handle logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Your are logout');
    res.redirect('/users/login');
})

module.exports = router;