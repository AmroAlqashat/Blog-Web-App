import express from "express";
import fs from 'fs';
import bodyparser from 'body-parser';

const app = express();
const port = 4000;

app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('Public'));
app.use(express.json());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
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

app.patch('/edit-blog', (req, res) => {
    let rAllBlogData = [];
    const { newTitle, newContent, newDate, key} = req.body;

    const allBlogData = readBlogData(rAllBlogData);
    const blog = allBlogData.find((blog) => blog.key == key);
    if((blog.title == newTitle) && (blog.content == newContent)){
        return res.json({ message: "You must change something!" });
    }
    const newBlog = {
        title: newTitle,
        content: newContent,
        key: key,
        edited_date: newDate
    }
    let index = allBlogData.findIndex((blog) => blog.key == key);
    allBlogData.splice(index, 1, newBlog);
    fs.writeFileSync('blogData', JSON.stringify(allBlogData , null, 2));
    res.json({ message: "Blog updated successfully!" });
});





app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});
