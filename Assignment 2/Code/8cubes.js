
var canvas;
var gl;
var length = 0.5;

var vertexColors = [
    [ 0.0, 0.3, 0.2, 1.0 ], //black
    [ 1.0, 0.0, 0.0, 1.0 ], //red
    [ 1.0, 1.0, 0.0, 1.0 ], //yellow
    [ 0.0, 1.0, 0.0, 1.0 ], //green
    [ 0.0, 0.0, 1.0, 1.0 ], //blue
    [ 1.0, 0.0, 1.0, 1.0 ], //magenta
    [ 1.0, 1.0, 1.0, 1.0 ], //white
    [ 0.0, 1.0, 1.0, 1.0 ]  //cyan
];

var crossHair = [
    vec3(0, 1, -1),
    vec3(0, -1, -1),
    vec3(1, 0, -1),
    vec3(-1, 0, -1),
];

var translate_cubes = [
    vec3(-10, 10, 10),
    vec3(10, -10, 10),
    vec3(10, 10, 10),
    vec3(10, 10, -10),
    vec3(-10, -10, 10),
    vec3(-10, 10, -10),
    vec3(10, -10, -10),
    vec3(-10, -10, -10)
];

var scale_ch = vec3( 0.05, 0.05, 0.05 );

var modelViewMatrix;
var projectionMatrix;
var projectionMatrixLocation;
var program;

var cubeColor = 0;
var rotationAmount = 0;

// Original camera position
var LRpos = 0;
var UDpos = 0;
var distanceOut = -45;
var FOV = 90;
var LRangle = 0;
var UDangle = 0;

// Defined globally so that it works in render()
var vPosition;
var vBuffer;
var chBuffer;
var displayCH = false;

var l = -2;
var r = 2;
var b = -2;
var t = 2;
var n = -2;
var f = 2;


window.onload = function init()
{

    // Set up WebGL canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    vertices = [
        vec3(  length,   length, length ), //vertex 0
        vec3(  length,  -length, length ), //vertex 1
        vec3( -length,   length, length ), //vertex 2
        vec3( -length,  -length, length ),  //vertex 3 
        vec3(  length,   length, -length ), //vertex 4
        vec3(  length,  -length, -length ), //vertex 5
        vec3( -length,   length, -length ), //vertex 6
        vec3( -length,  -length, -length )  //vertex 7   
    ];

    var points = [];
    Cube(vertices, points);

    //Create fragment and vertex shaders
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // create crosshair buffer (use to switch between the squares and crosshair)
    chBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, chBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(crossHair), gl.STATIC_DRAW );

    // Grabbing uniform variables for future modifications
    projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

    //projectionMatrix = ortho(l, r, b, t, n, f);
    //perspective(FOV, aspect ratio, near, far)
    projectionMatrix = perspective(90, canvas.width/canvas.height, -1, 1);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, flatten(projectionMatrix));

    // Listen for keypress
    window.onkeydown = function(e){
        var key = e.keyCode ? e.keyCode : e.which;

        //Everything with angles (azimuth/altitude) moves at 1 degree per keypress.
        //Everything with positions (left/right/forwared/backward) moves at 0.25 units per keypress.

        //Problem 3: On 'c' keypress, cycle through the cube color once
        if (key == 67) {
            cubeColor++;
            render();
        }

        //Problem 4: On 'left arrow' keypress, rotate world right 1 degree (aka camera rotating left)
        else if (key == 37) {
            LRangle -=1;
            render();
        }

        //Problem 4: On 'right arrow' keypress, rotate world left 1 degree (aka camera rotating right)
        else if (key == 39) {
            LRangle += 1;
            render();
        }

        //Problem 4: On 'up arrow' keypress, rotate world down 1 degree (aka camera rotating up)
        else if (key == 38) {
            UDangle -= 1;
            render();
        }

        //Problem 4: On 'down arrow' keypress, rotate world up 1 degree (aka camera rotating down)
        else if (key == 40) {
            UDangle += 1;
            render();
        }

        //Problem 4: On 'i' keypress, move world forward 0.25 units (aka camera zooming in)
        else if (key == 73) {
            distanceOut += 0.25;
            render();
        }

        //Problem 4: On 'm' keypress, move world backward 0.25 units (aka camera zooming out)
        else if (key == 77) {
            distanceOut -= 0.25;
            render();
        }

        //Problem 4: On 'j' keypress, move world to the right 0.25 units (aka camera to the left)
        else if (key == 74) {
            LRpos += 0.25;
            render();
        }

        //Problem 4: On 'k' keypress, move world to the left 0.25 units (aka camera to the right)
        else if (key == 75) {
            LRpos -= 0.25;
            render();
        }

        //Problem 4: On 'r' keypress, reset the view to start position
        else if (key == 82){

            translate_cubes = [
                vec3(-10, 10, 10),
                vec3(10, -10, 10),
                vec3(10, 10, 10),
                vec3(10, 10, -10),
                vec3(-10, -10, 10),
                vec3(-10, 10, -10),
                vec3(10, -10, -10),
                vec3(-10, -10, -10)
            ];

            //Reset camera position
            LRpos = 0;
            UDpos = 0;
            distanceOut = -30;  

            //Reset camera angle (azimuth/altitude)
            LRangle = 0;
            UDangle = 0;

            render();
        }

        //Problem 5: On 'n' keypress, modify FOV by -1 degree (closer)
        else if (key == 78) {
            FOV -= 1;
            projectionMatrix = perspective(FOV, canvas.width/canvas.height, -1, 1);
            render();
        }

        //Problem 5: On 'w' keypress, modify FOV by +1 degree (further)
        else if (key == 87) {
            FOV += 1;
            projectionMatrix = perspective(FOV, canvas.width/canvas.height, -1, 1);
            render();
        }

        //Problem 5: On 'h' keypress, toggle cross hair display on and off
        else if (key == 72) {
            //Toggle crosshair on and off
            displayCH = !displayCH;
            render();
        }
    }

    render();

    //Continuously call render (thus rotating the cubes) every 50 ms
    setInterval(render, 50);
    setInterval(increaseRotationAmount, 50);

}

function Cube(vertices, points){
    Quad(vertices, points, 0, 1, 2, 3);
    Quad(vertices, points, 4, 0, 6, 2);
    Quad(vertices, points, 4, 5, 0, 1);
    Quad(vertices, points, 2, 3, 6, 7);
    Quad(vertices, points, 1, 5, 3, 7);
    Quad(vertices, points, 6, 7, 4, 5);
}

function Quad( vertices, points, v1, v2, v3, v4){
    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}

/*  Every time render is called, the cubes will be rotated 5 degrees (resulting in spinning cubes)

    This function was made (instead of changing rotationAmount inside render()) in order to maintain 
    constant rotation speed even when there are keypresses */

function increaseRotationAmount(){
    rotationAmount += 5;
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Extra Credit 1: Implement each cube from the same data
    for (var i = 0; i < 8; i++) {

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        // Grab color, set different color per cube
        var colorLoc = gl.getUniformLocation(program, "vColor");
        var color = vec4(vertexColors[cubeColor % 8], 1.0);
        gl.uniform4fv(colorLoc, color);

        ctm = mat4();

        //Problem 4: Altitude Control
        ctm = mult(ctm, rotate(UDangle, 1, 0, 0));

        //Problem 4: Azimuth Control
        ctm = mult(ctm, rotate(LRangle, 0, 1, 0));

        //Problem 3: Displaying 8 cubes 
        ctm = mult(ctm, translate(translate_cubes[i]));

        //Problem 4: Camera (U/D/L/R) Control
        ctm = mult(ctm, translate(LRpos, UDpos, distanceOut));

        //Extra Credit 2: Continuous, smooth cube rotation
        ctm = mult(ctm, rotate(rotationAmount, 0, 1, 0));

        gl.uniformMatrix4fv(projectionMatrixLocation, false, flatten(projectionMatrix))
        gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));

        //Extra Credit 1: Implement cubes using a single triangle strip
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 36 );
        cubeColor++;
    }

    /* Crosshair display currently not working
    if (displayCH) {
        gl.bindBuffer( gl.ARRAY_BUFFER, chBuffer );
      
        vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        projectionMatrix = ortho( 1, -1, -1, 1, -1, 1 );
        gl.uniformMatrix4fv(projectionMatrixLocation, false, flatten(projectionMatrix));

        var chMat = mat4();
        chMat = (chMat, scale(scale_ch));
        gl.uniformMatrix4fv(modelViewMatrix, false, flatten(chMat));

        gl.drawArrays(gl.LINES, 0, 4);
    } */

}

