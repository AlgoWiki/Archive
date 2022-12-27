import * as React from "react"

import Seo from "../components/seo"

const NotFoundPage = () => (
  <>
    <h1>404: Not Found</h1>
    <p>Unfortunately we could not find what you were looking for.</p>
  </>
)

export const Head = () => <Seo title="404: Not Found" />

export default NotFoundPage
