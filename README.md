PhysioFlow AI

Video Demo: <URL HERE>

Description:

PhysioFlow AI is an interactive, browser-based physical fitness dashboard built for the Binnovative PhysTech 2026 Hackathon. It serves as a personal bio-analytics companion that lets users log any physical activity, visualize trends in their training, analyze their posture in real time using a simulated AI skeleton-tracking engine, and explore a clickable muscle map loaded with sport-specific recovery and stretching protocols. The entire application runs in the browser with zero external JavaScript libraries — all charts, animations, and canvas rendering were written from scratch using native Web APIs.

Project Structure & File Descriptions

index.html

This file is the complete structural shell of the application. All four views of the app — Dashboard, Log Activity, Posture AI Guide, and Recovery Map — are defined here as <section> elements inside a single HTML document. Only one view is visible at any given time; navigation is handled by toggling CSS classes rather than loading new pages, which gives the app a fast, fluid single-page application (SPA) feel without any framework overhead.

The sidebar navigation uses data-target attributes on each button, which the JavaScript routing system reads to determine which view to activate. The Recovery Map view contains two hand-crafted inline SVGs representing the anterior (front) and posterior (back) of the human body. Each anatomical region is drawn as a <path> element with a data-muscle attribute, making it trivially easy for the JavaScript module to attach click handlers and load the correct rehabilitation data.

style.css

The stylesheet drives the entire visual identity of PhysioFlow AI — a dark-mode, neon-accented "cyber health" aesthetic using custom CSS properties (variables) for a consistent color palette of electric cyan, neon purple, amber, and emerald green. Layout is handled with CSS Grid and Flexbox throughout, including the sidebar + main content split, the dashboard stats grid, and the two-column layouts for the Posture and Recovery views. Glassmorphism card styles (backdrop-filter: blur) give depth to each panel. Glow effects on stat cards, animated pulse indicators, and smooth view transitions (opacity + translateY) are all handled in CSS, keeping animation logic out of JavaScript wherever possible.

app.js

This is the central controller and the most important file in the project. It maintains a single in-memory state object that holds all activity logs, notifications, and the current day streak. Every other module receives data from or reports back to this state.

Key responsibilities include the view routing system (switchView / activateView), which animates between views and ensures the posture webcam is properly shut down when navigating away. The activity logging form features live-updating sliders for duration and intensity, and an automatic calorie estimator that uses a category-weighted formula (duration × baseKcalPerMin × intensityMultiplier) to suggest a realistic burn figure as the user adjusts inputs. On submission, the new entry is prepended to the state array and all dependent UI components — recent log list, history panel, summary cards, and charts — are refreshed immediately. The delete system uses event delegation on the history container, avoiding the need to attach individual listeners to every rendered log card.

charts.js

Rather than importing Chart.js or any third-party library, both data visualizations in the Dashboard are drawn entirely using the HTML5 Canvas 2D API. The line chart plots daily calorie burn over the past 7 days using cubic Bézier curves for smooth interpolation, a purple-to-cyan gradient fill beneath the line, and high-DPI support via devicePixelRatio scaling. The radar chart displays balance across the four activity categories (Fitness, Cardio, Flexibility, Recreation), with concentric polygon grid lines, radial spokes, and a filled data polygon normalized to a 0–100 scale weighted by both frequency and session duration. Both charts animate from 0 to full data using a requestAnimationFrame loop over roughly 25 frames.

The decision to write these charts by hand, rather than using a library, was deliberate. It kept the bundle dependency-free, gave full control over the exact visual style needed to match the app's aesthetic, and was a meaningful technical challenge.

posture.js

This module simulates an AI-powered pose estimation and coaching system. Since integrating a real machine learning model (such as TensorFlow.js with MoveNet or MediaPipe Pose) would be a significant scope increase and introduce heavy dependencies, the design choice was made to build a high-fidelity simulation engine instead. Joint positions for 14 body landmarks are calculated mathematically using Math.sin(simTime) oscillations that produce realistic, looping movement cycles for three exercises: a deep squat (hips descend, knees splay outward), Yoga Warrior II (wide stance, arms extended, subtle sway), and a forearm plank (horizontal body with micro-tremors simulating core fatigue).

On every animation frame, the module draws a scanner grid overlay, renders neon green "bones" between joint pairs with a glow shadow, places purple joint node circles at each landmark, and calls the biomechanics analyzer. The angle calculator uses Math.atan2 to compute the angle at a vertex joint from three landmark coordinates — the same trigonometric method used in real pose estimation pipelines. The analyzer evaluates form quality every 90 frames and appends timestamped coaching messages to a scrollable sidebar feed. The module also supports genuine webcam input via getUserMedia, overlaying the skeleton canvas directly on the live video feed.

recovery.js

The Recovery Map module pairs a clickable SVG anatomical diagram with a curated database of 12 muscle groups. Each entry in muscleDatabase contains a sport-contextualized description of why that muscle matters and one or two detailed stretch protocols with hold durations, step-by-step execution notes, and injury-prevention tips tied to specific activities (e.g., shin splints in runners, rotator cuff impingement in climbers, lower back spasms in gardeners). Clicking any highlighted region on the SVG fires a handler that reads the data-muscle attribute, looks up the database entry, and dynamically renders the stretch cards into the sidebar panel. Anterior and posterior view toggling swaps which SVG is visible while clearing any active muscle selection to avoid stale state.

Design Philosophy

Every design decision in PhysioFlow AI prioritized a polished, cohesive user experience built on web fundamentals. Using ES6 modules (import/export) kept the code organized and maintainable without a build tool. The single in-memory state pattern in app.js made data flow predictable — all reads and writes go through one place, and re-rendering any component is a simple function call. The choice to simulate AI rather than import a real model kept the project self-contained, fast-loading, and fully functional in any modern browser with no installation required.
