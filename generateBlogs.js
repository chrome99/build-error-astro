import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";

const numberOfPosts = 30000;

function main() {
  const blogDir = "src/content/blog";

  removeAllFiles(blogDir);

  for (let i = 0; i < numberOfPosts; i++) {
    const blogPost = generateBlogData();
    saveToMDX(blogPost, i + 1, blogDir);
  }
  console.log(`Generated ${numberOfPosts} blog posts`);
}

function removeAllFiles(dirPath) {
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.lstatSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });
}

function generateBlogData() {
  const title = capitalizeFirstLetter(faker.company.buzzPhrase());
  const author = faker.person.fullName();
  const publishDate = faker.date.between({
    from: "2020-01-01",
    to: new Date(),
  });
  const content = faker.lorem.paragraphs(15, "\n\n");

  return {
    title,
    author,
    publishDate,
    content,
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function saveToMDX(blogPost, index, blogDir) {
  const id = `${index}-${blogPost.title
    .replace(/ /g, "_")
    .replace(/\//g, "_")
    .toLowerCase()}`;
  const mdxContent = `---
id: ${id}
title: ${blogPost.title}
author: ${blogPost.author}
publishDate: ${blogPost.publishDate.toISOString()}
---

${blogPost.content}
`;

  fs.writeFileSync(path.join(blogDir, `${id}.mdx`), mdxContent);
}

main();
