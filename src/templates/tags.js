import React from "react"
import PropTypes from "prop-types"
import Layout from "../components/layout"
import { Link, graphql } from "gatsby"

const Tags = ({ pageContext, data, location }) => {
    const { tag } = pageContext
    const { edges, totalCount } = data.allMarkdownRemark
    const tagHeader = `Leogoesger on "${tag}"(${totalCount})`

    return (
        <Layout location={location} title={tagHeader}>

            <ol style={{ listStyle: `none` }}>
                {edges.map(({ node }) => {
                    const post = node
                    const { title } = node.frontmatter

                    return (
                        <li key={post.fields.slug}>
                            <article
                                className="post-list-item"
                                itemScope
                                itemType="http://schema.org/Article"
                            >
                                <header>
                                    <h2>
                                        <Link to={post.fields.slug} itemProp="url">
                                            <span itemProp="headline" style={{ color: 'var(--textLink)' }}>{title}</span>
                                        </Link>
                                    </h2>
                                    <small style={{ color: 'var(--textNormal)' }}>{post.frontmatter.date}</small>
                                </header>
                                <section>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: post.frontmatter.description || post.excerpt,
                                        }}
                                        itemProp="description"
                                        style={{ color: 'var(--textNormal)' }}
                                    />
                                </section>
                            </article>
                        </li>
                    )
                })}
            </ol>
            <Link to="/tags" style={{ color: 'var(--textLink)' }}>All tags</Link>
        </Layout>
    )
}
Tags.propTypes = {
    pageContext: PropTypes.shape({
        tag: PropTypes.string.isRequired,
    }),
    data: PropTypes.shape({
        allMarkdownRemark: PropTypes.shape({
            totalCount: PropTypes.number.isRequired,
            edges: PropTypes.arrayOf(
                PropTypes.shape({
                    node: PropTypes.shape({
                        frontmatter: PropTypes.shape({
                            title: PropTypes.string.isRequired,
                        }),
                        fields: PropTypes.shape({
                            slug: PropTypes.string.isRequired,
                        }),
                    }),
                }).isRequired
            ),
        }),
    }),
}
export default Tags
export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`