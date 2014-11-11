# CS 174A: Intro to Computer Graphics
## HOMEWORK 3

### Andrew Kuang (004042464)

#### Environment Information
	Editor: Sublime Text
	Browser: Mozilla Firefox

#### What was implemented?

	(1) Get a simple WebGL capable window to display without error.

	(2) Develop a function that generates the geometry for a sphere. Use a parameter to control the number of vertices that form the sphere. You can use the sphere generator in the book or find an alternative technique on the Internet.

	(3) Create a small solar system. One sun in the center with four orbiting planets. You choose a location (other than the world coordinate system origin) and diameter of the sun, the radius of each planet's orbit (keep them in the same plane), the diameter of each of the four planets and, finally, how fast each planet orbits around the sun - but each should move at a different speed.

	(4) Implement the sun as a point light source. You have already selected the diameter of the sun, however, if the sun is large the color should be warmer (reddish), if smaller the color should be colder (blueish). Each planet has a different appearance. First, there is an icy white, faceted, diamond-like planet (medium-low complexity sphere, flat shaded, specular highlight). Second, there is a swampy, watery green planet. (medium-low complexity sphere, Gouraud shaded, specular highlight). Third, there is a planet covered in clam smooth water (high complexity, Phong shaded, specular highlight) and finally a mud covered planet, brownish-orange with a dull appearance (medium-high complexity, no specular highlight)

	(5) Implement (re-use) your keyboard based navigation system from Assignment #2 to allow a user to fly around your solar system. Define and document a key to reset the view so that the entire solar system is visible - that view should be from above looking down at a 30 degree angle. This same view position should be used when your application starts.

		 Implementation of camera navigation system.
			- Up/Down arrow: controls camera altitude
			- Left/Right arrow: controls camera azimuth
			- I/J/K/M: controls camera movement forward, left, right, and backwards respectively
			- R: resets the view back to the start position
			- N/W: will make the horizontal field of view narrower/wider.

	(6) [PARTIALLY] Implement the Phong shading model to appropriately shade each of the planets as outlined above. It is up to you to figure out where the various parts of the shading model are best implemented (i.e. in the application, vertex shader or fragment shader).

## Extra Credit

#### (1) Add a moon orbiting around one of your planets. You decide on the moon's orbital speed, diameter, color and appearance. [15 points]

		There is a red moon orbiting around the icy planet on the outermost ring. 