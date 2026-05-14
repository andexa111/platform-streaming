"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-12 h-6" />

  return (
    <div className="flex items-center scale-[0.5] md:scale-[0.6] -mx-6 md:-mx-4">
      <style jsx>{`
        .theme {
          display: flex;
          align-items: center;
          -webkit-tap-highlight-color: transparent;
        }

        .theme__toggle-wrap {
          position: relative;
          margin: 0 0.75em;
        }

        .theme__toggle {
          background-color: hsl(48, 90%, 85%);
          border-radius: 25% / 50%;
          box-shadow: 0 0 0 0.125em rgba(0,0,0,0.05);
          padding: 0.25em;
          width: 6em;
          height: 3em;
          -webkit-appearance: none;
          appearance: none;
          transition: background-color 0.3s ease-in-out, box-shadow 0.15s ease-in-out, transform 0.3s ease-in-out;
          cursor: pointer;
          outline: none;
        }

        .theme__toggle:before {
          background-color: hsl(48, 90%, 55%);
          border-radius: 50%;
          content: "";
          display: block;
          width: 2.5em;
          height: 2.5em;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme__toggle:checked {
          background-color: hsl(198, 90%, 15%);
        }

        .theme__toggle:checked:before {
          background-color: hsl(198, 90%, 55%);
          transform: translateX(3em);
        }

        .theme__icon {
          display: block;
          position: absolute;
          top: 0.75em;
          left: 0.75em;
          width: 1.5em;
          height: 1.5em;
          pointer-events: none;
          transition: 0.3s;
        }

        .theme__toggle:checked ~ .theme__icon {
          transform: translateX(3em);
        }

        .theme__icon-part {
          position: absolute;
          border-radius: 50%;
          box-shadow: 0.4em -0.4em 0 0.5em hsl(0,0%,100%) inset;
          top: calc(50% - 0.5em);
          left: calc(50% - 0.5em);
          width: 1em;
          height: 1em;
          transition: 0.3s ease-in-out;
          transform: scale(0.5);
        }

        .theme__icon-part ~ .theme__icon-part {
          background-color: hsl(0,0%,100%);
          border-radius: 0.05em;
          top: 50%;
          left: calc(50% - 0.05em);
          transform-origin: 50% 0;
          width: 0.1em;
          height: 0.2em;
        }

        /* Sun Rays Positions */
        .theme__icon-part:nth-child(2) { transform: rotate(0deg) translateY(0.5em); }
        .theme__icon-part:nth-child(3) { transform: rotate(45deg) translateY(0.45em); }
        .theme__icon-part:nth-child(4) { transform: rotate(90deg) translateY(0.45em); }
        .theme__icon-part:nth-child(5) { transform: rotate(135deg) translateY(0.45em); }
        .theme__icon-part:nth-child(6) { transform: rotate(180deg) translateY(0.45em); }
        .theme__icon-part:nth-child(7) { transform: rotate(225deg) translateY(0.45em); }
        .theme__icon-part:nth-child(8) { transform: rotate(270deg) translateY(0.5em); }
        .theme__icon-part:nth-child(9) { transform: rotate(315deg) translateY(0.5em); }

        /* Moon State */
        .theme__toggle:checked ~ .theme__icon .theme__icon-part:nth-child(1) {
          box-shadow: 0.2em -0.2em 0 0.2em hsl(0,0%,100%) inset;
          transform: scale(1);
          top: 0.25em;
          left: 0.25em;
        }

        .theme__toggle:checked ~ .theme__icon .theme__icon-part ~ .theme__icon-part {
          opacity: 0;
        }
      `}</style>

      <label htmlFor="theme-toggle" className="theme">
        <span className="theme__toggle-wrap">
          <input 
            id="theme-toggle" 
            className="theme__toggle" 
            type="checkbox" 
            role="switch" 
            name="theme"
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          <span className="theme__icon">
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
            <span className="theme__icon-part" />
          </span>
        </span>
      </label>
    </div>
  )
}
