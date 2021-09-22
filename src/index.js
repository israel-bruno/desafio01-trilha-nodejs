const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid')


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const {username} = req.headers;
  const user = users.find(user=>user.username==username);

  if(!user)
    return res.status(400).json({error:{message:'User not found!'}})

  req.user = user;
  return next();
}
function checksExistsTodo(req, res, next){
  const {user} = req;
  const {id} = req.params;

  const todo = user.todos.find(todo=>todo.id === id)

  if(!todo)
    return res.status(404).json({error:{message:'Todo not found!'}})
  
  req.todo = todo;
  return next();
}

app.get('/users', (req, res)=>{
  return res.json(users);
})

app.post('/users', (req, res) => {
  const {name , username} = req.body;

  if(users.some(user=>user.username === username))
    return res.status(400).json({error:{message:"That username already in use!"}})
  
  const user = {
    name,
    username,
    id:uuidv4(),
    todos:[]
  }
  users.push(user);

  return res.status(201).json(user);
});


app.get('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req;

  return res.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req;
  const {title, deadline} = req.body;
  
  const todo = {
    id:uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline), //deadLine deve ser passada no formato ANO-MÊS-DIA
    created_at:new Date()
  }
  user.todos.push(todo);
  
  return res.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (req, res) => {
  const {todo} = req;
  const {title, deadline} = req.body;

  todo.title=title;
  todo.deadline=new Date(deadline);

  return res.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (req, res) => {
  const {todo} = req;
  todo.done = !todo.done;

  return res.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo,(req, res) => {
  const {user, todo} =req;
  user.todos.splice(user.todos.indexOf(todo), 1);

  return res.status(204).json();
});

module.exports = app;