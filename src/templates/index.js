import * as React from "react"
import dateFormat from "dateformat"

import Seo from "../components/seo"

const Index = ({ pageContext }) => {
  const { directoryPath, files, directories } = pageContext

  directories.sort((a, b) => {
    return a.name < b.name ? -1 : 1
  })
  files.sort((a, b) => {
    return a.name < b.name ? -1 : 1
  })

  return (
    <>
      <h1>Index of {directoryPath}</h1>
      <hr />
      <pre>
        <a href="../">../</a>
        {`\n`}
        {directories.map(directory => (
          <React.Fragment key={directory.name}>
            <a href={directory.name + "/"}>{directory.name}/</a>
            {new Array(51 - directory.name.length).join(" ")}
            {dateFormat(directory.lastModified, "dd-mmm-yyyy hh:MM")}
            {new Array(20).join(" ")}
            {`-\n`}
          </React.Fragment>
        ))}
        {files.map(file => (
          <React.Fragment key={file.name}>
            <a href={file.name}>{file.name}</a>
            {new Array(52 - file.name.length).join(" ")}
            {dateFormat(file.lastModified, "dd-mmm-yyyy hh:MM")}
            {new Array(21 - String(file.size).length).join(" ")}
            {file.size}
            {`\n`}
          </React.Fragment>
        ))}
      </pre>
      <hr />
    </>
  )
}

export const Head = ({ pageContext }) => (
  <Seo title={`Index of ${pageContext.directoryPath}`} />
)

export default Index
