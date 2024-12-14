import express from "express";
import bodyparser from 'body-parser';
import fs from 'fs';
import axios from 'axios'

const app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('Public'));
app.use(express.json());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

const BLOG_FUNC_API_URL = 'http://localhost:4000/';


app.get('/view-blog', (req, res) => {
    let tempData = {};
    let rAllBlogData = [];
    const allBlogData = readBlogData(rAllBlogData);
    const fileTempData = fs.readFileSync('tempData', 'utf8');
    if (!!fileTempData.trim())
        tempData = JSON.parse(fileTempData);
    else 
        tempData = {};
    const blog = allBlogData.find(obj => obj.key == tempData.buttonKey);
    fs.writeFileSync('tempData', JSON.stringify({}));
    res.render('view-blog', { blog } );
});
app.get('/edit-blog', (req, res) => {
    let tempData = {};
    const fileTempData = fs.readFileSync('tempData', 'utf8');
    if(!!fileTempData.trim())
        tempData = JSON.parse(fileTempData);
    else 
        tempData = {};
    fs.writeFileSync('tempData', JSON.stringify({}));
    console.log(tempData)
    console.log(tempData.date)
    res.render('edit', { tempData })
});
app.get("/", (req, res) => {
    let rAllBlogData = [];
    const allBlogData = readBlogData(rAllBlogData);
    console.log(allBlogData)
    res.render("My-Blogs", { allBlogData } );
});
app.get('/add-blog', (req, res) => {
    res.render('add-blog')
});
app.get("/header-buttons", (req, res) => {
    const checker = req.query.btn;
    switch(checker){
        case "viewBlogs": 
            res.redirect("/");
            break;
        case "addBlog": 
            res.redirect("/add-blog");
            break;
    }
});



function readBlogData(rAllBlogData){
    try {
        const fileData = fs.readFileSync('blogData', 'utf8');
        if (!!fileData.trim()) {
            rAllBlogData = JSON.parse(fileData);
        }
    } catch {
        rAllBlogData = [];
    }
    return rAllBlogData;
};

app.post("/addblog-to-homePage", (req, res) => {
    let rAllBlogData = [];
    const { title, content, date, key } = req.body;
    if (!title || !content || !date || title.trim() == "" || content.trim() == "" || date == null)
        return res.status(400).json({ error: true });
    const newblogData = { title, content, date, key };
    const allBlogData = readBlogData(rAllBlogData);
    allBlogData.push(newblogData);
    fs.writeFileSync('blogData', JSON.stringify(allBlogData , null, 2));
    res.json({ redirectUrl: '/' });
});

app.post('/deleteBlog', (req, res) => {
    let rAllBlogData = [];
    const allBlogData = readBlogData(rAllBlogData);
    const buttonKey = req.body.dataKey;
    const newAllBlogData = allBlogData.filter((blogData) => blogData.key != buttonKey);
    fs.writeFileSync('blogData', JSON.stringify(newAllBlogData, null, 2));
    res.json({ success: true });
});

app.post('/show-blog-in-edit-page', (req, res) => {
    try {
        // const APIresponse = await axios.patch(BLOG_FUNC_API_URL+`edit-blog/${req.body.dataKey}`);
        // const blogData = APIresponse.data;
        const btnKey = req.body.dataKey;
        let rAllBlogData = [];
        const allBlogData = readBlogData(rAllBlogData);
        const blog = allBlogData.find((blog) => blog.key == btnKey);
        fs.writeFileSync('tempData', JSON.stringify(blog, null, 2));
        res.json({ redirectUrl: '/edit-blog', data: blog });
    } catch (error) {
        console.log("There an error here bod: " + error.message);
    }
});

app.post('/do-the-edit', async (req, res) => {
    const btnKey = req.body.btnKey;
    console.log(btnKey)
    const newTitle = req.body.newTitle;
    const newContent = req.body.newContent;
    const newDate = req.body.date;
    try {
        const APIresponse = await axios.patch(BLOG_FUNC_API_URL+`edit-blog`,{
            key: btnKey,
            newTitle: newTitle,
            newContent: newContent,
            newDate: newDate
        });
        const APImessage = (APIresponse.data.message);
        
        res.json({ success: true, message: APImessage, redirectUrl: '/' });
    } catch (error) {
        console.log("Error:",error)
    }
});

app.post('/view-blog-server', (req, res) => {
    const tempData = {};
    const buttonKey = req.body.dataKey;
    tempData.buttonKey = buttonKey;
    fs.writeFileSync('tempData', JSON.stringify(tempData, null, 2));
    res.json({ redirectUrl: `/view-blog` });
});
app.post('/search-func', (req, res) => {
    let rAllBlogData = [];
    const allBlogData = readBlogData(rAllBlogData);
    const input = (req.body.input).toLowerCase();
    const filteredData = allBlogData.filter(data => data.title.toLowerCase().includes(input));
    res.json({ filteredData });
});





app.listen(3000, () =>  {
    console.log("Server Is Running | http://localhost:3000");
});