const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

//midileWare
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0xslwlb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const cupponCollection = client.db("Skyline-Residency").collection("cuppon")
        const apartmentCollection = client.db("Skyline-Residency").collection("apartment")
        const agreementCollection = client.db("Skyline-Residency").collection("agreement")
        const userCollection = client.db("Skyline-Residency").collection("user")

        //jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' })
            res.send({ token })
        })

        const veryfyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'forbidding access' })
            }
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: 'forbidding access' })

                }
                req.decoded = decoded
                next()
            })
        }
        //cupon
        app.get('/cuppon', async (req, res) => {
            const result = await cupponCollection.find().toArray()
            res.send(result)
        })


        //apartment
        app.get('/apartment', async (req, res) => {
            const result = await apartmentCollection.find().toArray()
            res.send(result)
        })

        //agreement 
        //post agreement data
        app.post('/agreement', veryfyToken, async (req, res) => {
            const agreementData = req.body
            const result = await agreementCollection.insertOne(agreementData)
            res.send(result) 
        })

        //get all agreement data
        app.get('/agreement', async (req, res) => {
            const result = await agreementCollection.find().toArray()
            res.send(result)
        })

        //user
        //post user data
        app.post('/user', veryfyToken, async (req, res) => {
            const userData = req.body
            const result = await userCollection.insertOne(userData)
            res.send(result)
        })
        //get all user data
        app.get('/user', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        //get user role
        app.get('/user/:email', veryfyToken, async (req, res) => {
            const userEmail = req.params.email
            const quary = { email: userEmail }
            const data = await userCollection.findOne(quary)
            console.log(data)

            let role = 'user'
            if (data.role == 'admin') {
                role = 'admin'
            }
            if (data.role == 'member') {
                role = 'member'
            }
            console.log(role)
            res.send({ role })
        })




        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`The building is open ${port}`)
})