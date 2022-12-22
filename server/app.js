const express = require('express');
const app = express();
const fs = require('fs/promises');

const PORT = 5000;

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
  });

app.get('/', async (req, res) => {

})

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await fs.readFile('./tasks.json');
    res.send(JSON.parse(tasks));
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const task = req.body;
    const listBuffer = await fs.readFile('./tasks.json');
    const currentTasks = JSON.parse(listBuffer);
    let maxTaskId = 1;
    if (currentTasks && currentTasks.length > 0) {
      maxTaskId = currentTasks.reduce(
        (maxId, currentElement) => (currentElement.id > maxId ? currentElement.id : maxId),
        maxTaskId
      );
    }
    const newTask = { id: maxTaskId + 1, ...task };
    const newList = currentTasks ? [...currentTasks, newTask] : [newTask];

    await fs.writeFile('./tasks.json', JSON.stringify(newList));
    res.send(newTask);
  } catch (error) {
    res.status(500).send({ error: error.stack });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  console.log(req);
  try {
    const id = req.params.id;
    const listBuffer = await fs.readFile('./tasks.json');
    const currentTasks = JSON.parse(listBuffer);
    if (currentTasks.length > 0) {
      await fs.writeFile('./tasks.json', JSON.stringify(currentTasks.filter((task) => task.id != id)));
      res.send({ message: `Uppgift med id ${id} togs bort` });
    } else {
      res.status(404).send({ error: 'Ingen uppgift att ta bort' });
    }
  } catch (error) {
    res.status(500).send({ error: error.stack });
  }
});

/**
 * Skapa en patch method path som låter oss uppdatera datan. (crUd)
 */
app.patch('/tasks/update/:id', async (req, res) => {
  try {
    const id = req.params.id;                                     // Plocka ut ID:t ifrån requesten
    const listBuffer = await fs.readFile('./tasks.json');    // Läs in tasks.json
    const currentTasks = JSON.parse(listBuffer);                  // Parse:a tasks.json till ett JSON-objekt
    if (currentTasks.length > 0) {                                // Om listan inte är tom
      currentTasks.filter((task) => task.id == id)                // Plocka ut JSON-elementet vars ID matchar ID:t ifrån requesten.
        .map((task) => {
          if (task.title != req.body.title) task.title = req.body.title;                          // By ut titel om annorlunda
          if (task.description != req.body.description) task.description = req.body.description;  // By ut description om annorlunda
          if (task.dueDate != req.body.dueDate) task.dueDate = req.body.dueDate;                  // By ut dueDate om annorlunda
          if (task.completed != req.body.completed) task.completed = req.body.completed;          // By ut completed om annorlunda
        })
      await fs.writeFile('./tasks.json', JSON.stringify(currentTasks)); // Skriv den uppdaterade currentTasks till Fil
      res.send({ message: `Uppgift med id ${id} uppdaterades` });     // Svara med att uppgiften uppdaterats.
    }
  } catch (e) {
    console.log(e)  // Om något går fel så logga felet.
  }
});

app.listen(PORT, () => console.log('Server running on http://localhost:5000'));
