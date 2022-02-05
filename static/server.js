const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const { userInfo } = require("os");
const jwt = require("jsonwebtoken");
const uuid = require('uuid');



const JWT_SECRET = "hquedqhduw9uwqgefo347dj@64/hfshwiugr2eowi9ig6dhi8tgg";


mongoose.connect("mongodb://localhost:27017/login-app-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const app = express();
app.use("/", express.static(path.join(__dirname, "")));
app.use(bodyParser.json())

app.post('/api/change-password', async (req, res) => {
	const { token, newpassword: plainTextPassword } = req.body

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	try {
		const user = jwt.verify(token, JWT_SECRET)

		const _id = user.id

		const password = await bcrypt.hash(plainTextPassword, 10)

		await User.updateOne(
			{ _id },
			{
				$set: { password }
			}
		)
		res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: ';))' })
	}
})

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).lean()

    if(!user){
        return res.json({ status: "error", error: "Invalid username/password" })
    }

    if(await bcrypt.compare(password, user.password)){
        // the username, password combination is successful

        const token = jwt.sign(
            { 
            id: user._id, 
            email: user.email,

        }, 
        JWT_SECRET
        )
        return res.json({ status: "ok", data: token })
    }

    res.json({ status: "error", error: "Invalid username/password"})
});


app.post("/api/register", async (req, res) => {
    
    const { fullname, email, password: plainTextPassword, country } = req.body

    if (!email || typeof email !== "string"){
        return res.json({ status: "error", error: "Invalid email" })
    }

    if (!plainTextPassword|| typeof plainTextPassword !== "string"){
        return res.json({ status: "error", error: "Inavlid password"})
    }

    if(plainTextPassword.length < 5){
        return res.json({ status: "error", error: "Password too small. should atleast 6 characters." })

    }
    const password = await bcrypt.hash(plainTextPassword, 10);


    
    try{
        const response = await User.create({
            fullname,
            email,
            password,
            country,
           
        })
        console.log("User created succesfully: ", response);
    } catch(error)
    {
        if(error.code === 11000){
            return res.json({ status: "error", error: "Email already exists" })
        }
        throw error
    }

    res.json({ status: "ok" })
});




const mailchimp = require("@mailchimp/mailchimp_transactional")("3OWpc5X-VG5ZEuX1JWAsiw");

const message = {
    from_email: "info@aquicksoft.com",
    subject: "Hello world",
    text: "Thank you for registering! Please verify your email by clicking on this link. http://localhost:2100/email/verify?token=" + uuid.v4(),
    to: [
        {
            email: "charviverma1117@gmail.com",
            type: "to"
        }
    ]
};



async function run() {
    const response = await mailchimp.messages.send({
        message
    });
    console.log(response);
}
// run();



app.listen(2100, () => {
    console.log("server up at 2100");
});


// find user by email id