import  express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('<h1>Classify Server</h1>');
    res.send('<p>Even more HTML</p>');
});

app.post('/classify', async(req, res) => {

    let source = req
    console.log(source);
    res.send('Hello POST');
})

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));