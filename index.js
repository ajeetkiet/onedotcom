const express = require('express');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const users = require('./Db');
const roles = require('./Roles');
const secret = 'onedotcom';

const app = express();

const roleMap = ['ADMIN', 'SELLER', 'SUPPORTER', 'CUSTOMER'];

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const validateSignup = (req, res, next) => {
    //Validation
    const {username='', password='', role=''} = req.body;
    if(!username || !password || !role) {
        return res.status(404).send({
            message: 'Validation error'
        });
    }
    next();
}

const validateSignin = (req, res, next) => {
    //Validation
    const {username='', password=''} = req.body;
    if(!username || !password) {
        return res.status(404).send({
            message: 'Validation error'
        });
    }
    next();
}

const getUserByUsername = async (username = '') => {
    return new Promise((resolve, reject) => {
        users.findOne({ username: username }, function (err, doc) {
            if (err) return reject(true);
            return resolve(doc);
        })
    })
}

const insertUser = async (reqBody = '') => {
    return new Promise((resolve, reject) => {
        users.insert(reqBody, function (err, docs) {
            if (err) {
                return resolve(false);
            }
            return resolve(true);
        })
    })
}

const getToken = (user) =>{
    const payload = {
        role: user.role
    }
    const token = jwt.sign(payload, secret);
    return token;
}

const checkRoleValid = async (req, res, next) =>{
    let auth = req.headers['authorization'];
    const token = String(auth).split(' ')[1];
    const user = jwt.verify(token, secret);
    if(!user) {
        return res.status(401).send({
            message: "Invalid token"
        });
    }
    const role = String(user.role).replace(",","");
    const userRole = roles.find(obj => obj.role == role)
    const requestType = req.method;
    if(userRole) {
        const allowed = userRole.allowed;
        if(allowed.indexOf(requestType) >=0) {
            next();
        } else {
            return res.status(401).send({
                message: "Not authorized to access endpoint"
            });
        }
    } else {
        return res.status(401).send({
            message: "User role not valid"
        });
    }
}

const isValidRole = (role='') =>{
    role = String(role).replace(",","");
    return roleMap.indexOf(role) <0 ? false : true; 
}

app.post('/signup', validateSignup, async (req, res) => {
    const reqBody = {
        ...req.body,
        role: String(req.body.role).toUpperCase(),
        id: uuid.v4()
    };
    const isValid = isValidRole(reqBody.role);
    if(!isValid) {
        return res.status(404).send({
            message: 'Role is not supported'
        });
    }
    const exists = await getUserByUsername(reqBody.username)
    if (exists) {
        return res.status(412).send({
            message: 'User already exist'
        });
    }
    const userInserted = await insertUser(reqBody);
    if (!userInserted) {
        return res.status(404).send({
            message: 'Something went wrong'
        });
    }
    return res.status(201).send({
        message: "Signup successful"
    });
})

app.post('/signin', validateSignin, async(req, res) => {
    const reqBody = {
        ...req.body
    };
    const user = await getUserByUsername(reqBody.username);
    if (!user) {
        return res.status(412).send({
            message: 'User does not exist'
        });
    }
    const token = await getToken(user);
    return res.status(201).send({
        message: "Login successful",
        token: token
    });
})

//Restricted APIs below
app.post('/products', checkRoleValid, async (req, res) => {
    return res.status(201).send({
        message: "Product added successfully"
    });
})

app.patch('/products', checkRoleValid, async (req, res) => {
    return res.status(200).send({
        message: "Product updated successfully"
    });
})

app.put('/products', checkRoleValid, async (req, res) => {
    return res.status(200).send({
        message: "Product updated successfully"
    });
})

app.delete('/products', checkRoleValid, async (req, res) => {
    return res.status(200).send({
        message: "Product deleted successfully"
    });
})

app.get('/products', checkRoleValid, async (req, res) => {
    return res.status(200).send({
        message: "Products sent successfully"
    });
})


app.listen(3000, () => console.log("Server is listening on 3000"));