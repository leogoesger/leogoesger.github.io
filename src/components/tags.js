import React from "react"
import PropTypes from "prop-types"
import kebabCase from "lodash/kebabCase"
import { Link } from "gatsby"


const TagsComponent = ({
    group
}) => {
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
TagsComponent.propTypes = {
    data: PropTypes.shape({
        allMarkdownRemark: PropTypes.shape({
            group: PropTypes.arrayOf(
                PropTypes.shape({
                    fieldValue: PropTypes.string.isRequired,
                    totalCount: PropTypes.number.isRequired,
                }).isRequired
            ),
        }),
        site: PropTypes.shape({
            siteMetadata: PropTypes.shape({
                title: PropTypes.string.isRequired,
            }),
        }),
    }),
}
export default TagsComponent
