const express = require('express');
const mongo = require('mongoose');
const cors = require('cors');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

var cardSchema = mongo.Schema({
    id: Number,
    content: String,
    category: String,
    color: String,
    likes: {type: Number, default : 0},
    comments: {type: mongo.Schema.Types.ObjectId, ref: "Comment"}
});
var commentSchema = mongo.Schema({
    id: Number,
    category: String,
    content: String
})
var Card = mongo.model('Card', cardSchema);
var Comment = mongo.model('Comment', commentSchema);

mongo.connect(process.env.MONGODB_URL || 'mongodb://heroku_tzfr3cpv:nusukhl67orl3jl9t571pm3e4r@ds261648.mlab.com:61648/heroku_tzfr3cpv', {useNewUrlParser:true,  useUnifiedTopology: true });
mongo.set('useFindAndModify', false);

mongo.connection.on('error', (e)=>{console.error(e)});

app.get('/getcard/:category', async(req, res)=>{
    /*get category and return matching cards?*/
    let category = req.params.category;
    let response = await Card.find({ category: category });
    res.send(response);
})
app.post('/createcard', async (req,res)=>{
    let newCard = new Card();
    newCard._id = new mongo.Types.ObjectId();
    newCard.category = req.body.category;
    newCard.content = req.body.content;
    newCard.color = req.body.color;
    newCard.comments = newCard._id;

    await newCard.save((err) =>{
        if(err) return res.json({success: false, error: err});
        return res.json({ _id: newCard._id });
    });

});
app.options('/edit/:id', cors());
app.patch('/edit/:id', cors(), async (req, res)=>{
    /*match id and update*/
    let cardID = req.params.id;
    let card = await Card.findById(cardID);
    card.content = req.body.update; 
    try {
        await card.save();
      } catch (e) {
        return console.log(e);
      }
      return res.json({ _id: card._id });
      //res.send(card._id);
})
app.post('/updatelikes/:id', async (req, res) => {

    //Card.findOneAndUpdate({id: req.params.id}, {likes: req.body.likes}, ()=>{res.send()})
    Card.findOneAndUpdate({_id: req.params.id}, {$inc: {likes: 1}}).exec();
    // let cardID = req.params.id;
    // let card = await Card.findById(cardID);
    // card.likes = req.body.likes;
    // try{
    //     await card.save();
    // }catch(e){
    //     return console.log(e);
    // }
    //return res.json({ likes: card.likes });
})
app.delete('/deletecard/:id', async (req, res)=>{
    /*match id and delete*/

    let cardID = req.params.id;
    await Card.deleteOne({_id: cardID});
    res.send(cardID);
})
app.post('/submitcomments/:id', async(req, res)=>{
    /*match id category and return*/
    let newComment = new Comment();
    newComment._id = new mongo.Types.ObjectId();
    newComment.content = req.body.content;
    newComment.category = req.body.category;

    await newComment.save((err) =>{
        if(err) return res.json({success: false, error: err});
        return res.json({ _id: newComment._id });
    });

})
app.get('/getcomments/:id', async(req, res)=>{
    /*match id category and return*/
    Card.
  findOne({ _id: req.params.id }).
  populate('comments').
  exec(function (err, story) {
    if (err) return handleError(err);
    res.send(story);
    // prints "The author is Ian Fleming"
  });
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}
app.listen(port);
//app.listen(3001, () => console.log('Listening on port 3001!'));
