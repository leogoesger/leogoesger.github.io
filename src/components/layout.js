import React from "react"
import { Link } from "gatsby"
import { ToggleBtn } from "./theme-toggler"

if (typeof window !== "undefined") {
  // eslint-disable-next-line global-require
  require("smooth-scroll")('a[href*="#"]')
  require("./solarizedlight.css")
  require("prismjs/plugins/line-numbers/prism-line-numbers.css")
}

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 style={{ color: "var(--textNormal)", fontSize: "1.4rem", margin: 0 }}>
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to="/"
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <Link
        className="header-link-home"
        to="/"
        style={{ color: "var(--textNormal)", fontSize: "1.4rem", margin: 0 }}
      >
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <header className="global-header">{header}</header>
          <a
            href="https://twitter.com/leog0esger"
            style={{
              textDecoration: "none",
              boxShadow: "none",
              height: 30,
              marginLeft: "0.4rem",
            }}
          >
            <img
              src={require("./twitter.png")}
              style={{ width: 30, height: 30, margin: 0 }}
              alt="twitter"
            />
          </a>
        </div>
        <ToggleBtn />
      </div>
      <main>{children}</main>
      <footer style={{ color: "var(--textNormal)" }}>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com" style={{ color: "var(--textLink)" }}>
          Gatsby
        </a>
      </footer>
    </div>
  )
}

export default Layout
