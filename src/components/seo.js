/**
 * SEO component that queries for data with
 * Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"

function Seo({ title, children }) {
  return (
    <>
      <title>{title}</title>
      {children}
    </>
  )
}

export default Seo
