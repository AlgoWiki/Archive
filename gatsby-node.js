const path = require("path")

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query Files {
      allS3Object {
        nodes {
          Key
          Size
          LastModified
        }
      }
    }
  `)

  const hierarchy = {
    files: [],
    children: {},
    lastModified: null,
  }

  for (const file of result.data.allS3Object.nodes) {
    const parts = file.Key.split("/")
    const lastModified = new Date(file.LastModified)
    const fileName = parts[parts.length - 1]

    if (fileName === "index.html" || fileName.indexOf(".") < 0) {
      console.error(`Problematic filename: ${file.Key}`)
    }

    let cur = hierarchy
    for (let i = 0; i < parts.length; i++) {
      if (cur.lastModified === null || lastModified > cur.lastModified) {
        cur.lastModified = lastModified
      }
      if (i == parts.length - 1) {
        cur.files.push({
          name: parts[i],
          size: file.Size,
          lastModified: file.LastModified,
        })
      } else {
        if (!cur.children.hasOwnProperty(parts[i])) {
          cur.children[parts[i]] = {
            files: [],
            children: {},
            lastModified: null,
          }
        }
        cur = cur.children[parts[i]]
      }
    }
  }

  const indexTemplate = path.resolve(`src/templates/index.js`)
  const populatePages = (path, directory) => {
    createPage({
      path: path,
      component: indexTemplate,
      context: {
        directoryPath: path,
        files: directory.files,
        directories: Object.entries(directory.children).map(
          ([name, child]) => ({
            name,
            lastModified: child.lastModified,
          })
        ),
      },
    })

    for (const [name, child] of Object.entries(directory.children)) {
      populatePages(path + name + "/", child)
    }
  }

  populatePages("/", hierarchy)
}
