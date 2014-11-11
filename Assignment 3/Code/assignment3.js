var canvas;
var gl;

var index = 0;
var numPlanets = 7;

var UDangle = -30;
var LRangle = 0;
var LRpos = 0;
var UDpos = 20;
var distanceOut = -5;

var pointsArray = [];
var spheresArray = [];
var normalsArray = [];

//Use the translate matrix to place the spheres
var translateMatrix = [
    vec3(0, 0, 10), //upper right
    vec3(-70, 0, 10), //upper middle
    vec3(20, 0, 10), //upper left
    vec3(50, 0, 10), //lower right
    vec3(-35, 0, 10), //lower left
    vec3(-10, 0, 0) //upper middle
];

//Use the size matrix to change each shape's size
var sizeMatrix = [
    vec3(8, 8, 8),
    vec3(3, 3, 3),
    vec3(2, 2, 2),
    vec3(5, 5, 5),
    vec3(4, 4, 4),
    vec3(2, 2, 2)
];

//Use the divide matrix to determine the complexity of the sphere
var divideMatrix = [
    5, 1, 2, 6, 3, 0
];

//Use the orbit position matrix to keep track of where the spheres are in orbit 
var orbitPositionMatrix = [
    0, 0, 0 , 0, 0, 0
];

//Use the orbit speed matrix to set each sphere's orbiting speed
var orbitSpeedMatrix = [
    2, -1, 3, -2, 1, 5
];

//Set up perspective parameters
var near = 0.1;
var far = 150.0;
var fovy = 90.0;
var aspect;

//Taken from author sample code, used in tetrahedron
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//Set up point lighting values
var lightPosition = vec4(0.0, 0.0, -5.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.5, 0.5, 0.5, 0.5 );
var lightSpecular = vec4( 0.2, 0.2, 0.2, 0.0 );

//Used to set each sphere's ambience characteristics
var materialAmbientMatrix = [
    vec4( 1.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 0.0, 0.0, 1.0, 1.0 ),
    vec4( 0.5, 0.5, 0.4, 1.0 ),
    vec4( 1.0, 0.0, 1.0, 1.0 )
];

//Used to set each sphere's diffusion characteristics
var materialDiffuseMatrix = [
    vec4( 0.8, 0.5, 0.0, 1.0 ),
    vec4( 0.0, 0.9, 0.8, 1.0 ),
    vec4( 0.3, 0.7, 0.2, 1.0 ),
    vec4( 0.0, 0.4, 0.6, 1.0 ),
    vec4( 0.2, 0.1, 0.05, 1.0),
    vec4( 0.8, 0.5, 0.0, 1.0 )
];

//Used to set each sphere's specular characteristics
var materialSpecularMatrix = [
    vec4( 1.0, 0.5, 0.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 ),
    vec4( 0.7, 0.5, 0.6, 1.0 ),
    vec4( 0.7, 0.5, 0.6, 1.0 ),
    vec4( 0.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 0.5, 0.0, 1.0 )
];

var materialShininess = 10.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var program;

//Triangle code used as base primitive to create spheres
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t1, t2));
     normal = vec4(normal);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    //Set up canvas 

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    aspect = canvas.width/canvas.height;
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    spheresArray.push(pointsArray.length);

    //Define vertices for each sphere and keep track of where they begin/end for future reference
    for (var i = 0; i < numPlanets; i++){
        tetrahedron(va, vb, vc, vd, divideMatrix[i]);
        spheresArray.push(pointsArray.length);
    }

    //Set up buffers (sample code taken from author)
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    //Configure light position and shininess 
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    // Listen for keypress
    // RECYCLED CODE FROM ASSIGNMENT 2
    window.onkeydown = function(e){
        var key = e.keyCode ? e.keyCode : e.which;

        //Everything with angles (azimuth/altitude) moves at 1 degree per keypress.
        //Everything with positions (left/right/forwared/backward) moves at 0.25 units per keypress.


        //On 'r' keypress, reset the view
        /*if (key == 82){

            orbitPositionMatrix = [
                0, 0, 0 , 0, 0
            ];

            translateMatrix = [
                vec3(0, 0, 10), //upper right
                vec3(-70, 0, 10), //upper middle
                vec3(20, 0, 10), //upper left
                vec3(50, 0, 10), //lower right
                vec3(-35, 0, 10), //lower left
            ];

            //Reset perspective parameters
            var near = 0.1;
            var far = 150.0;
            var fovy = 90.0;
            var aspect;

            //Reset angles and position of camera
            var UDangle = -30;
            var LRangle = 0;
            var LRpos = 0;
            var UDpos = 20;
            var distanceOut = -5;

        }*/

        //On 'left arrow' keypress, rotate world right 1 degree (aka camera rotating left)
        if (key == 37) {
            LRangle -=1;
        }

        //On 'right arrow' keypress, rotate world left 1 degree (aka camera rotating right)
        else if (key == 39) {
            LRangle += 1;
        }

        //On 'up arrow' keypress, rotate world down 1 degree (aka camera rotating up)
        else if (key == 38) {
            UDangle -= 1;
        }

        //On 'down arrow' keypress, rotate world up 1 degree (aka camera rotating down)
        else if (key == 40) {
            UDangle += 1;
        }

        //On 'i' keypress, move world forward 0.25 units (aka camera zooming in)
        else if (key == 73) {
            distanceOut += 0.25;
        }

        //On 'm' keypress, move world backward 0.25 units (aka camera zooming out)
        else if (key == 77) {
            distanceOut -= 0.25;
        }

        //On 'j' keypress, move world to the right 0.25 units (aka camera to the left)
        else if (key == 74) {
            LRpos += 0.25;
        }

        //On 'k' keypress, move world to the left 0.25 units (aka camera to the right)
        else if (key == 75) {
            LRpos -= 0.25;
        }

        //On 'n' keypress, modify FOV by -1 degree (closer)
        else if (key == 78) {
            fovy -= 1;
            projectionMatrix = perspective(fovy, aspect, -1, 1);
        }

        //On 'w' keypress, modify FOV by +1 degree (further)
        else if (key == 87) {
            fovy += 1;
            projectionMatrix = perspective(fovy, aspect, -1, 1);
        }

    }

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    for (var j = 0; j < numPlanets-1; j++) {

        orbitPositionMatrix[j] += orbitSpeedMatrix[j];
        orbitPositionMatrix[j] = orbitPositionMatrix[j] % 360;

        modelViewMatrix = mat4();
        projectionMatrix = mat4();
        projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
        //Zoom out to view all spheres
        modelViewMatrix = mult(modelViewMatrix, translate(0, 0, -75));
        //Used for Azimuth/Altitude control
        modelViewMatrix = mult(modelViewMatrix, rotate(UDangle, 1, 0, 0));
        modelViewMatrix = mult(modelViewMatrix, rotate(LRangle, 0, 1, 0));
        //Used for camera control
        modelViewMatrix = mult(modelViewMatrix, translate(LRpos, UDpos, distanceOut));

        if (j == 5){
            modelViewMatrix = mult(modelViewMatrix, rotate(orbitPositionMatrix[1], 0, 0, 1))
            modelViewMatrix = mult(modelViewMatrix, translate(translateMatrix[1]));
        }

        //Rotate each sphere
        modelViewMatrix = mult(modelViewMatrix, rotate(orbitPositionMatrix[j], 0, 0, 1));

        //Move each sphere to its position around the sun
        modelViewMatrix = mult(modelViewMatrix, translate(translateMatrix[j]));

        //Resize each sphere to specified size
        modelViewMatrix = mult(modelViewMatrix, scale(sizeMatrix[j]));
        
        //For each sphere, calculate the necessary products using the sphere's specific characteristics
        ambientProduct = mult(lightAmbient, materialAmbientMatrix[j]);
        diffuseProduct = mult(lightDiffuse, materialDiffuseMatrix[j]);
        specularProduct = mult(lightSpecular, materialSpecularMatrix[j]);

        gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
        gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );  

        //Draw each sphere, using the vertices specified earlier (when calling tetrahedron)
        gl.drawArrays( gl.TRIANGLES, spheresArray[j], spheresArray[j+1]-spheresArray[j]);
    }

    window.requestAnimFrame(render);
}
