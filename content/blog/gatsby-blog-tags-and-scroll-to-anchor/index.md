---
title: 'Build a Gatsby Blog Part III: Tags and Scroll to Anchor'
date: '2020-10-14T22:12:03.284Z'
draft: false
tags: ["coding"]
ogimage: '../gatsby-blog-basics/gatsby.png'
---

Continuing with Part I or II, we can add tags to allow users picking specific interested topics. Scroll to Anchor is helpful because some posts could get a bit too long to manually scroll. 

## Prerequisites 

* Have a working and deployed version of Gatsby site

## Topics

Feel free to skip the features you do not want or need. The demo below also shows the scroll to anchor feature as well.

 - [Tags](#tags)
 - [Scroll to Anchor](#scroll-to-anchor)

### Tags

Tags are useful when you want to create different topics in your blog. They are sorted for each blog. There are a few steps to make this happen.

#### Add tags to each post's header

```md
---
title: "A Trip To the Zoo"
tags: ["animals", "Chicago", "zoos"]
---
```

#### Create a Tag template to display a list of Posts for that tag

This page should look pretty familiar, it is a duplicate of our index page. The only difference is the header. Instead of showing the main header, we want to display the name of the tag, and the post counts of that tag.

![tag with header](./tag-header.png)

```js
// src/templates/tags.js
import React from "react"
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
```
#### Modify `gatsby-node.js` to render Tag page using that template

We are adding `/tags/tag-name` for each tags that is being used.

```js
const path = require(`path`)
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const tagTemplate = path.resolve("src/templates/tags.js")

  // Get all markdown blog posts sorted by date
  const result = await graphql(
    `
      {
        postsRemark: allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: ASC }
          limit: 1000
        ) {
          nodes {
            id
            fields {
              slug
            }
            frontmatter {
              tags
            }
          }
        }
        tagsGroup: allMarkdownRemark(limit: 2000) {
          group(field: frontmatter___tags) {
            fieldValue
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your blog posts`,
      result.errors
    )
    return
  }

  const posts = result.data.postsRemark.nodes
  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.fields.slug,
        component: blogPost,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }

  const tags = result.data.tagsGroup.group
  tags.forEach(tag => {
    createPage({
      path: `/tags/${_.kebabCase(tag.fieldValue)}/`,
      component: tagTemplate,
      context: {
        tag: tag.fieldValue,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
    }

    type Fields {
      slug: String
    }
  `)
}

```

At this point, you can verify it is working by directly visiting `localhost:8000/tags/animals`. It should display a list of posts that have tag `animals` listed.

#### Create a Tag component

We want to change the header to include all the tags you have, and click on each tag should redirect you to a list of posts with that tag.

```js
// src/components/tags.js
import React from "react"
import kebabCase from "lodash/kebabCase"
import { Link } from "gatsby"


const TagsComponent = ({group}) => {
  return (
    <ul style={{ flexWrap: "wrap", display: "flex", listStyleType: "none", margin: "0.5rem 0 0 0" }}>
      {group.sort((a, b) => a.fieldValue.localeCompare(b.fieldValue)).map((tag, idx) => (
        <Link key={tag.fieldValue} to={`/tags/${kebabCase(tag.fieldValue)}/`} style={{ textDecoration: "none", fontSize: 14, marginBottom: "0.5rem", marginRight: "0.4rem" }}>
          <button style={{ border: "none", padding: "4px 6px", backgroundColor: "var(--buttonBackground)", width: 80, color: "var(--buttonText)", fontWeight: "bold", cursor: "pointer" }}>
            {tag.fieldValue}
          </button>
        </Link>
      ))}
    </ul>
  )
}
export default TagsComponent
```

#### Add tags query in `bio.js` and display in header

Now all we need is to query the tags info, and pass it down to `<TagsComponent />`
```js
// bio.js
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
  ...
  return (
    <>
      <div className="bio" style={{ flexDirection: "column" }}>
        ...
        {data?.allMarkdownRemark?.group && <TagsComponent group={data?.allMarkdownRemark?.group} />}
      </div>
    </>
  )
```

That's it! You can modify the color with the global CSS file eaily to match the dark and bright theme.

### Scroll to Anchor

Install `gatsby-remark-autolink-headers`

```
npm install gatsby-remark-autolink-headers
```

Add to `gatsby-config.js`

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-autolink-headers`],
      },
    },
  ],
}
```

#### How to use

When you use header `#`, it will automatically add anchor to the header. To link to that section, you can use a regular link.

```
 [Tags](#tags)
```

Remember to use lower case with hyphen. If you have title `How to use`, the proper link would be `[Go to How to Use](#how-to-use)`.


## Reference

* [Github Repo](https://github.com/leogoesger/leogoesger.github.io)
* [Creating Tags Pages for Blog Posts](https://www.gatsbyjs.com/docs/adding-tags-and-categories-to-blog-posts/)