const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g2lboph.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db('Kids-Universe-DB').collection('toys')

    const indexKey= {name: 1, category: 1};
    const indexOptions= {name: "nameCategory"};
    const result = await toysCollection.createIndex(indexKey, indexOptions);

    app.get('/jobSearchByTitle/:text', async(req, res)=>{
      const searchText = req.params.text;
      const result = await toysCollection.find({
        $or: [
          {title:{ $regex: searchText, $options: "i"}},
          {category:{ $regex: searchText, $options: "i"}}
        ]
      })
      .toArray();
      res.send(result)
    })
    
    // Read DATA: Toys
    app.get('/toys', async(req, res)=>{
        const cursor = toysCollection.find();
        const result = await cursor.limit(20).toArray()
        res.send(result)
    })
    
    app.get('/categories', async(req, res) =>{
      const cursor = categories.find();
      const result = await cursor.toArray()
      res.send(result)
    })
    // Toy by ID
    app.get('/toys/:id', async(req, res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result)
    })
    // Post Toys:
    app.post('/toys', async(req, res)=>{
      const newToy = req.body;
      console.log(newToy)
      const result = await toysCollection.insertOne(newToy)
      res.send(result)
    })
    // Find Data by Email
    app.get('/my/:email', async(req, res)=>{
      const result = await toysCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(result)
    })
    // update toy
    app.get('/toys/:id', async(req, res)=>{
      const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const result = await toysCollection.deleteOne(query);
     res.send(result)
    })
    // update
    app.put('/toys/:id', async(req, res)=>{
      const id =req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options ={ upsert: true }
      const updatedToy = req.body;
      const toy ={
        $set:{
          toyName: updatedToy.toyName,
          toyPhoto: updatedToy.toyPhoto,
          sellerName: updatedToy.sellerName,
          sellerEmail: updatedToy.sellerEmail,
          sellerPicture: updatedToy.sellerPicture,
          category: updatedToy.category,
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          details: updatedToy.details
        }
      }
      const result = await toysCollection.updateOne(filter, toy, options)
      res.send(result)
    })
    // sorting
    app.get('/ascending', async(req, res)=>{

    })
    // delete toy from db
    app.delete('/toys/:id', async(req, res)=>{
     const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const result = await toysCollection.deleteOne(query);
     res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.log);

app.get('/', (req, res)=>{
    res.send('KIDS SERVER IS RUNNUNG')
})
app.listen(port, ()=>{
    console.log(`kids are running on: ${port}`) 
})