class Api {
  url = '';

  constructor(url) {
    this.url = url;
  }

  /* Create = POST */
  create(data) {
    const JSONData = JSON.stringify(data);
    console.log(`Sending ${JSONData} to ${this.url}`);

    const request = new Request(this.url, {
      method: 'POST',
      body: JSONData,
      headers: {
        'content-type': 'application/json'
      }
    });

    return fetch(request)
      .then((result) => result.json())
      .then((data) => data)
      .catch((err) => console.log(err));
  }

  /* Read = GET */
  getAll() {
    return fetch(this.url)
      .then((result) => result.json())
      .then((data) => data)
      .catch((err) => console.log(err));
  }

  /* Delete = DELETE */
  remove(id) {
    console.log(`Removing task with id ${id}`);
    /*  Fixa i server/app.js --> res.header('Access-Control-Allow-Methods', '*');, starta om server */

    return fetch(`${this.url}/${id}`, {
      method: 'DELETE'
    })
      .then((result) => result)
      .catch((err) => console.log(err));
  }

  /* update = PATCH */
  update(data) {
    console.log(`Updating task data with id ${data.id}`);                 // Logga att en updatering-sker
    console.log(`${this.url}/update/${data.id}`)                          // Logga vilken adress den kommunicerar med
    const req = new Request(`${this.url}/update/${data.id}`, {  // Skapa en ny Request
      method: 'PATCH',                                                    // method = PATCH
      body: JSON.stringify(data),                                         // body   = JSON-String av den in-passade data.
      headers: {                                                          // header
        'content-type': 'application/json'                                // content-type = JSON
      }
    })
    return fetch(req).then((res) => res).catch((e) => console.log(e))
  }
}
