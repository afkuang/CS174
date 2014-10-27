
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

var scale_cube = vec3(0.5, 0.5, 0.5);

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


var modelViewMatrix;

var viewMatrix;
var projectionMatrix;
var program;

var cubeColor = 0;

var cameraLRPos = 0;
var cameraUDPos = 0;
var cameraZoomIO = 25;

var eye = vec3(cameraZoomIO, 0, 0);
var at = vec3(0, cameraUDPos, cameraLRPos);
var up = vec3(0, 0, 1);

var l = -2;
var r = 2;
var b = -2;
var t = 2;
var n = -2;
var f = 2;


window.onload = function init()
{

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

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");


    viewMatrix = lookAt(eye, at, up);
    //projectionMatrix = ortho(l, r, b, t, n, f);
    projectionMatrix = perspective(90, 1, -1, 1);

    window.onkeydown = function(e){
        var key = e.keyCode ? e.keyCode : e.which;

        //Press 'c' to cycle the cubes' colors
        if (key == 67) {
            cubeColor++;
            render();
        }

        if (key == 37) {
            cameraLRPos--;
            at = vec3(0, cameraLRPos, cameraUDPos);
            viewMatrix = lookAt(eye, at, up);
            render();
        }

        if (key == 39) {
            cameraLRPos++;
            at = vec3(0, cameraLRPos, cameraUDPos);
            viewMatrix = lookAt(eye, at, up);
            render();
        }

        if (key == 38) {
            cameraUDPos--;
            at = vec3(0, cameraLRPos, cameraUDPos);
            viewMatrix = lookAt(eye, at, up);
            render();
        }

        if (key == 40) {
            cameraUDPos++;
            at = vec3(0, cameraLRPos, cameraUDPos);
            viewMatrix = lookAt(eye, at, up);
            render();
        }

        if (key == 73) {
            cameraZoomIO--;
            eye = vec3(cameraZoomIO, 0, 0);
            viewMatrix = lookAt(eye, at, up);
            render();
        }

        if (key == 77) {
            cameraZoomIO++;
            eye = vec3(cameraZoomIO, 0, 0);
            viewMatrix = lookAt(eye, at, up);
            render();
        }
    }

    render();
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


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i < 8; i++) {

        var colorLoc = gl.getUniformLocation(program, "vColor");
        var color = vec4(vertexColors[cubeColor % 8], 1.0);
        gl.uniform4fv(colorLoc, color);

        ctm = mat4();
        ctm = mult(ctm, projectionMatrix);
        ctm = mult(ctm, viewMatrix);
        ctm = mult(ctm, translate(translate_cubes[i]));
        ctm = mult(ctm, scale(scale_cube));
        gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
        gl.drawArrays( gl.TRIANGLES, 0, 36 );

        cubeColor++;
    }

}

