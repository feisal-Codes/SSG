const fs = require("fs");
const path = require("path");
const marked = require("marked");

const pagesDirectory = path.join(__dirname, "src", "markdown");
const templatesDirectory = path.join(__dirname, "src", "templates");
const destinationDirectory = path.join(__dirname, "public");

const staticGenerator = (
  pagesDirectory,
  templatesDirectory,
  destinationDirectory
) => {
  try {
    let pagesFileNames = fs.readdirSync(pagesDirectory);
    let pagePaths = pagesFileNames.map(name => path.join(pagesDirectory, name));
    pagePaths.forEach(pagePath => {
      // Read markdown page

      let page = fs.readFileSync(pagePath, { encoding: "utf-8" });

      //extract page metadata and content

      let results = /^---(.*?)---/s.exec(page);
      let pageContent = page.replace(results[0], "");
      let metadata = JSON.parse(results[1]);

      //parse markdown to html

      let htmlPage = marked.parse(pageContent);

      // Read  template corresponding to our page

      let template = fs.readFileSync(
        path.join(templatesDirectory, metadata.template),
        { encoding: "utf-8" }
      );

      // Inject  values into the template

      let staticPage = templatize(template, {
        title: metadata.title,
        author: metadata.author,
        date: metadata.date,
        content: htmlPage,
        link: path.join("/public/homepage.html"),
        homepage: path.join("/public/homepage.html"),
        about: path.join("/public/about.html"),
        article1: path.join("/public/article1.html"),
        error: path.join("/public/error.html"),
      });

      // create the destination directory if it that does exist
      //save the html results to the destination directory

      if (!fs.existsSync(destinationDirectory))
        fs.mkdirSync(destinationDirectory, { recursive: true });

      fs.writeFileSync(
        path.join(destinationDirectory, `${path.parse(pagePath).name}.html`),
        staticPage
      );
    });
  } catch (e) {
    console.log(e);
  }
};

//method that searches and injects corresponding values into the template

const templatize = (template, data) => {
  try {
    let matches = template.matchAll(/\{\{(.*?)\}\}/g);

    for (let match of matches) {
      let title = match[1];
      let value = data[title];
      template = template.replace(match[0], value);
    }

    return template;
  } catch (e) {
    console.log(e);
  }
};

staticGenerator(pagesDirectory, templatesDirectory, destinationDirectory);
