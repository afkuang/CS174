# CS 174A: Intro to Computer Graphics
## HOMEWORK 1

### Andrew Kuang (004042464)

#### Environment Information
	Editor: Sublime Text
	Browser: Mozilla Firefox

#### What was implemented?

	(1) Get a simple WebGL element (canvas) to display without error.
	(2) Implement the various shader codes needed to get primitives onto the screen as illustrated in the lecture and in Chapter 2 of the text.
	(3) Implement the Sierpinski Gasket algorithm from Chapter 2 of the text and display it on the canvas. Use the coordinates (-0.5, -0.5), (0.5, -0.5) and (0.0, 0.5) as the initial seed points of the algorithm.
	(4) Implement the assignment in a clean and understandable manner. You can use whatever coding style you prefer but your code must be readily understandable for grading (e.g. comments).

### Extra Credit

#### (1) Implement a application based color variable that can be passed through to the fragment shader. [10 pts]

		To do this, I used a uniform variable (uniformColor) and randomly assigned RGB values to the vector before passing it through to the fragment shader.

#### (2) Implement a method where the keyboard is used to change that color variable and redisplay. [5 pts]

		By adding an onkeydown() listener, I was able to make it such that the fragment shader receives a new set of randomized RGB values and re-renders the gasket on keypress (UP arrow key).

#### (3) Implement another function in your window similar to the Sierpinski Gasket, another fractal perhaps? Provide a keyboard input option to switch between the two on screen, please explain in your notes what function you implemented. [10 pts]

		The fractal I decided to implement was the Koch snowflake which is drawn in the drawKochSnowflake() function. The code that I used to implement this fractal was supplied by Noam Sutskever of the University of Toronto and can be found at: http://www.cs.utoronto.ca/~noam/fractal.html. Again, using the onkeydown() listener, I was able to display the fractal on a new canvas and disable the display of the Sierpinski gasket on keypress (DOWN arrow key). When pressed again, the new canvas is removed and the Sierpinski gasket is re-rendered with new random RGB values. 

#### (4) Implement a rotation in the vertex shader and rotate the fractal via keyboard by pressing the 'r' key. Rotation direction is up to you. [10 pts]

		The rotation of the fractal was implemented in much the same way as the color changing of the fractal. To do this, I used a uniform 4x4 matrix which was used to transform the vertex shader. Using the built-in rotate() function from MV.js, I set it such that pressing the 'r' key will rotate the fractal by 45 degrees counter-clockwise. In the event that the user continually holds down the 'r' key, the fractal will continue to rotate 45 degrees for the duration of they keypress.
