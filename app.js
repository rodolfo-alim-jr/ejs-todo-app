const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
const _ = require('lodash')

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

const items = []

// const connection = mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true })
const connection = mongoose.connect('mongodb+srv://junalim90:Nba2k10nba2k10$@cluster0.qokmk.mongodb.net/todolistDB', { useNewUrlParser: true })

if(connection) {
    console.log('Successfully connected to the database')
}

// Create schema
const itemsSchema = {
    name: String
}

// Create model
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: 'do laundry'
})

const item2 = new Item({
    name: 'wash clothes'
})

const item3 = new Item({
    name: 'study web development'
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model('List', listSchema)


app.get('/', (req, res) => {
    Item.find({},(err,el) => {
        if(err) {
            console.log('error finding items')
        } else {
            if (el.length === 0){
                Item.insertMany(defaultItems, (err) => {
                    if(err) {
                        console.log('Error inserting the records')
                    } else {
                        console.log('Records inserted successfully')
                    }
                })
            } else {
                res.render('home', {
                    pageTitle: 'Today',
                    todos: el
                })
            }
        }
    })
})

app.get('/:listName', (req, res) => {
    const listName = _.capitalize(req.params.listName)

    List.findOne({name: listName}, (err, results) => {
        if(results){
            console.log('List already exists')

            res.render('home', {
                pageTitle: results.name,
                todos: results.items
            })
        } else {
            const list = new List({
                name: listName,
                items: defaultItems
            })
            list.save()
            res.redirect('/' + listName) 
        }
    })
})

app.post('/', (req,res) => {
    const item = req.body.taskItem
    const listName = req.body.list

    const newItem = new Item({
        name: item
    })

    if(listName === 'Today'){
        newItem.save()
        res.redirect('/')
    } else {
        List.findOne({name: listName},(err, results) => {
            if(results){
                results.items.push(newItem)
                results.save()
                res.redirect('/' + listName)
            }
        })
    }


})

app.post('/delete', (req, res) => {
    const checkedItem = req.body.checkbox
    const listName = req.body.listName

    if(listName === 'Today'){
        Item.deleteOne({_id: checkedItem},(err) => {
            if(err) {
                console.log('error deleting item')
            } else {
                console.log('item deleted successfully')
                res.redirect('/')
            }
        })
    } else {
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItem}}},(err, results) => {
            console.log('item deleted')
            res.redirect('/' + listName)
        })
    }


})


app.listen(3000, () => {
    console.log('Server connected to port 3000')
})