import React from 'react'
import { ThemeToggler } from 'gatsby-plugin-dark-mode'
import Toggle from 'react-toggle'
import './theme-toggler.css'
import { FaMoon, FaSun } from 'react-icons/fa'

export const ToggleBtn = () => (
    <ThemeToggler>
        {({ theme, toggleTheme }) => {

            return (
                <Toggle
                    checked={theme === 'dark' || !theme}
                    className="custom-classname"
                    icons={{
                        checked: <FaMoon color="yellow" />,
                        unchecked: <FaSun color="yellow" />,
                    }}
                    onChange={e => toggleTheme(theme === 'light' ? 'dark' : 'light')}
                />
            )
        }}
    </ThemeToggler>
)
