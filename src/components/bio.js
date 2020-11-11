/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Image from "gatsby-image"
import TagsComponent from "./tags";

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50, quality: 95) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
      allMarkdownRemark(limit: 2000) {
        group(field: frontmatter___tags) {
          fieldValue
          totalCount
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  // const social = data.site.siteMetadata?.social

  const avatar = data?.avatar?.childImageSharp?.fixed

  return (
    <>
      <div className="bio" style={{ flexDirection: "column" }}>
        <div style={{ display: "flex" }}>
          {avatar && (
            <Image
              fixed={avatar}
              alt={author?.name || ``}
              className="bio-avatar"
              imgStyle={{
                borderRadius: `50%`,
              }}
            />
          )}
          {author?.name && (
            <p style={{ color: 'var(--textNormal)' }}>
              <strong>{author.name}</strong> {author?.summary || null}
              {` `}
              <Link to={`/about`} style={{ color: 'var(--textLink)' }}>
                More about me
              </Link>
            </p>
          )}
        </div>
        {data?.allMarkdownRemark?.group && <TagsComponent group={data?.allMarkdownRemark?.group} />}
      </div>
    </>
  )
}

export default Bio
