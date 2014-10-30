# CS 174A: Intro to Computer Graphics
## HOMEWORK 2

### Andrew Kuang (004042464)

#### Environment Information
	Editor: Sublime Text
	Browser: Mozilla Firefox

#### What was implemented?

	(1) Get a simple WebGL element (canvas) to display without error.
	(2) Implementation of the various shader codes needed without error.
	(3) Display of eight cubes using perspective projection (+-10, +-10, +-10), each with a different color.
		Initial camera position encompasses all eight cubes.
		Pressing 'c' will cycle the color of all cubes on each keypress.
	(4) Implementation of camera navigation system.
			- Up/Down arrow: controls camera altitude
			- Left/Right arrow: controls camera azimuth
			- I/J/K/M: controls camera movement forward, left, right, and backwards respectively
			- R: resets the view back to the start position
	(5) Pressing 'n' and 'w' will make the horizontal field of view narrower/wider.
	(6) Implementation of the assignment in a clean and understandable manner with comments throughout the code.

#### What was not implemented?

	(5) The orthographic projection of a cross-hair in the center of the screen.


## Extra Credit

#### (1) Instance each of the cubes from the same data and implement the cube(s) as a single triangle strip [5 pts]

To do this, I simply changed the gl.drawArray parameter from gl.TRIANGLES to gl.TRIANGLE_STRIP. In order to use the same data, I used the code for a single cube, which I then projected at the desired locations (+-10, +-10, +-10) using a for loop and an array of positions.

#### (2) Smoothly, continuously, and individually either rotate or scale each of the cubes while your application is running. The rotation should be constant [10 pts]

To achieve continuous rotation, I created a variable rotateAmount which would increase by 5 degrees every time render() was called. To make this rotation continuous and smooth, I had to call render() every 50 ms using setInterval(). In order to prevent the cubes from rotating quicker on keypresses (because they would call render() between the 50ms intervals), I had to create a new function setRotationAmount() which would do the rotation every 50ms. 

#### (3) Implement your navigation system using quaternions [10 pts]

This was already done for me as the rotation functions in MV.js were implemented using quaternions.