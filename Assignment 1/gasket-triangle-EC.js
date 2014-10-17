	var lastPressedDown;
	var canvas;
	var gl;
	var context;
	var totalRotation = 0;
	var points = [];
	var NumTimesToSubdivide = 5;

	/* The following code was taken from the author code samples found at:

		http://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SIXTH_EDITION/CODE/WebGL/7E/02/gasket2.js

	*/
	
	window.onload = function init()
	{
	    canvas = document.getElementById("c");  
	    gl = WebGLUtils.setupWebGL(canvas);
	    context = canvas.getContext("2d");
    
    	// Initialize the three corners of the gasket 

	    var vertices = [
	        vec2( -0.5, -0.5 ),
	        vec2(  0,  0.5 ),
	        vec2(  0.5, -0.5 )
	    ];

	    divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

	    // Configure WebGL

	    gl.viewport( 0, 0, canvas.width, canvas.height );
    	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    	// Initialize the shaders (found above)

	    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	    gl.useProgram( program );  

	    /* EXTRA CREDIT #1: Implement an application based color variable that can be passed through 
	    					to the fragment shader.*/

	    var colorLoc = gl.getUniformLocation(program, "uniformColor");
	    var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);
	    gl.uniform4fv(colorLoc, color);

	    /* EXTRA CREDIT #4 */ 
		var matrixLoc = gl.getUniformLocation(program, "rotationMatrix");
		var matrix = rotate(totalRotation, 0, 0, 1);
		gl.uniformMatrix4fv(matrixLoc, false, flatten(matrix));


		// Load the data into the GPU

	    var bufferId = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

	    // Associate our shader variables with our data buffer

	    var vPosition = gl.getAttribLocation( program, "vPosition" );
	    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vPosition );

	 	/* EXTRA CREDIT PARTSR 2 ~ 4 */

	    window.onkeydown = function(e){
			var key = e.keyCode ? e.keyCode : e.which;

		    /* EXTRA CREDIT #2: Implement a method where the keyboard is used (UP arrow, in this case)
    							to change that color variable and redisplay.*/

			if (key == 38) {

				//Focus is on the Sierpinski Gasket
				if (!lastPressedDown) {
					var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);
					var colorLoc = gl.getUniformLocation(program, "uniformColor");
					if (colorLoc != -1)
						gl.uniform4fv(colorLoc, color);

					render();

					// When displaying the Sierpinski Gasket, remove the Koch snowflake

					var m_canvas = document.getElementById("c");
					var m_container = m_canvas.parentNode;
					if (!m_container.firstChild) {
						var toDelete = document.getElementById("imageTemp");
						m_container.removeChild(imageTemp);
					}

					lastPressedDown = false;
				}

				//Focus is on the Koch snowflake
				else {
					//do nothing
				}
			}

			/* EXTRA CREDIT #3: Implement another function in your window similar to the Sierpinski Gasket, 
								another fractal perhaps? Provide a keyboard input option (DOWN) to switch 
								between the two on screen, please explain in your notes what function you 
								implemented */

			else if (key == 40) {

				//Focus switches to the Sierpinski Gasket
				if (lastPressedDown) {
					var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);
					var colorLoc = gl.getUniformLocation(program, "uniformColor");
					if (colorLoc != -1)
						gl.uniform4fv(colorLoc, color);

					render();

					// When displaying the Sierpinski Gasket, remove the Koch snowflake

					var m_canvas = document.getElementById("c");
					var m_container = m_canvas.parentNode;
					if (m_container.firstChild) {
						var toDelete = document.getElementById("imageTemp");
						m_container.removeChild(imageTemp);
					}

					lastPressedDown = false;
				}
				
				//Focus switches to the Koch snowflake
				else {

					lastPressedDown = true;

					// When displaying the Koch snowflake, hide the Sierpinski Gasket
					gl.clear( gl.COLOR_BUFFER_BIT );
					drawKochSnowflake();
				}
			}


			/* EXTRA CREDIT #4: Implement a rotation in the vertex shader and rotate the fractal via keyboard 
								by pressing the 'r' key. Rotation direction is up to you. */

			else if (key == 82) {

				//Focus is on the Sierpinski Gasket
				if (!lastPressedDown) {

					// Every keypress OR while r is held down, the fractal rotates 45 degrees along the z axis.
					totalRotation += 45;
					var matrixLoc = gl.getUniformLocation(program, "rotationMatrix");
					var matrix = rotate(totalRotation, 0, 0, 1);
					if (matrixLoc != -1)
						gl.uniformMatrix4fv(matrixLoc, false, flatten(matrix));

					render();
				}

				//Focus is on the Koch snowflake
				else{
					//do nothing
				}
			}
		}

	    render();
	};

	function triangle( a, b, c )
	{
	    points.push( a, b, c );
	}

	function divideTriangle( a, b, c, count )
	{

	    // check for end of recursion
	    
	    if ( count === 0 ) {
	        triangle( a, b, c );
	    }
	    else {
	    
	        //bisect the sides
	        
	        var ab = mix( a, b, 0.5 );
	        var ac = mix( a, c, 0.5 );
	        var bc = mix( b, c, 0.5 );

	        --count;

	        // three new triangles
	        
	        divideTriangle( a, ab, ac, count );
	        divideTriangle( c, ac, bc, count );
	        divideTriangle( b, bc, ab, count );
	    }
	}

	function render()
	{
		gl.clear( gl.COLOR_BUFFER_BIT );
	    gl.drawArrays( gl.TRIANGLES, 0, points.length );
	}

	W = 550; 
	H = 510;

	/* The following code used to create the fractal via paths was taken from Noam Sutskever:

	   http://www.cs.utoronto.ca/~noam/fractal.html

	*/ 

	function drawKochSnowflake(){
	   
	   	var main_canvas = document.getElementById("c");
	    var mcontext = main_canvas.getContext('2d');
	    var container = main_canvas.parentNode;

	    // Creates a new canvas to attach (as a child) to the existing canvas
	    var canvas = document.createElement('canvas');
	    canvas.id="imageTemp";
	    canvas.width=W;
	    canvas.height=H;
	    container.appendChild(canvas);
	    context = canvas.getContext('2d'); 
	    
	    context.beginPath();
	    context.stroke();
	    context.closePath();
	    
	    fractal([50,150], [500,150], 5);
	    fractal([270,490], [50,150],5);
	    fractal([500,150],[270,490],5);

	};

	function fractal(A, B, depth){

	    if (depth < 0){
	        return null;
	    }

	    var C = divide(add(multiply(A, 2), B), 3);
	    var D = divide(add(multiply(B, 2), A), 3);
	    var F = divide(add(A, B), 2);
	    
	    var V1 = divide(minus(F, A), lengthF(F, A));
	    var V2 = [V1[1], -V1[0]];

	    var E = add(multiply(V2, Math.sqrt(3)/6 * lengthF(B, A)), F);

	    DrawLine(A, B, "black");

	    if (depth !=0){
	        for (var i=0;i<10;i++)
	            DrawLine(C, D, "white");
	    };
	    
	    fractal(A, C, depth-1);
	    fractal(C, E, depth-1);
	    fractal(E, D, depth-1);
	    fractal(D, B, depth-1);

	};

	function multiply(v, num){
	    return [v[0]*num, v[1]*num];
	};

	function divide(v, num){
	    return [v[0]/num, v[1]/num];
	};
	 
	function add(a, b){
	    return [a[0]+b[0], a[1]+b[1]];
	};

	function minus(a, b){
	    return [a[0]-b[0], a[1]-b[1]];
	};

	function lengthF(a, b){
	    return Math.sqrt(Math.pow(a[0] - b[0],2) + Math.pow(a[1] - b[1],2));
	};

	function DrawLine(a, b, c){
	    context.beginPath();
	    context.strokeStyle = c;
	    context.moveTo(a[0], a[1]);
	    context.lineTo(b[0], b[1]);
	    context.stroke();
	    context.closePath();
	};
