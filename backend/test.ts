fetch('http://localhost:3000/swagger').then(async r => console.log(r.status, await r.text())).catch(e => console.error(e));
