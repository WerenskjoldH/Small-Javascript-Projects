var vertexShader = [
  "precision mediump float;",
  "",
  "attribute vec3 vertPosition;",
  "attribute vec3 vertColor;",
  "",
  "uniform mat4 worldMatrix;",
  "uniform mat4 viewMatrix;",
  "uniform mat4 projectionMatrix;",
  "",
  "varying vec3 fragColor;",
  "",
  "void main()",
  "{",
  "fragColor = vertColor;",
  "mat4 pvwMatrix = projectionMatrix * viewMatrix * worldMatrix;", // Operations occur right to left
  "gl_Position = pvwMatrix * vec4(vertPosition, 1.0);",
  "}",
].join("\n");

var fragmentShader = [
  "precision mediump float;",
  "",
  "varying vec3 fragColor;",
  "",
  "void main()",
  "{",
  "gl_FragColor = vec4(fragColor, 1.0);",
  "}",
].join("\n");

var init = function () {

  var canvas = document.getElementById("glCanvas");
  var glContext = canvas.getContext("webgl");

  // These next two conditionals are to ensure the browser sets up the context correctly
  if (!glContext) {
    console.log("Using experimental webgl");
    glContext = canvas.getContext("experimental-webgl");
  }

  // If there is an issue, it will print an alert as a last ditch effort
  if (!glContext) {
    alert("WebGL Unsupported by browser.");
  }

  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;
  //   glContext.viewport(0, 0, window.innerWidth, window.innerHeight);

  // Enable Depth Test in OpenGL State Machine
  // This will enable depth testing in the rasterizer
  //    Compares pixel depth when deciding what to draw
  glContext.enable(glContext.DEPTH_TEST);

  // Enable Back Face Culling in OpenGL State Machine
  // This will prevent unnecessary calculations of culled faces
  glContext.enable(glContext.CULL_FACE);
  glContext.frontFace(glContext.CCW);
  glContext.cullFace(glContext.BACK);

  glContext.clearColor(0.5, 0.85, 0.8, 1.0);
  glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

  // Create the shader objects
  var vertShader = glContext.createShader(glContext.VERTEX_SHADER);
  var fragShader = glContext.createShader(glContext.FRAGMENT_SHADER);

  // Set shader source code
  glContext.shaderSource(vertShader, vertexShader);
  glContext.shaderSource(fragShader, fragmentShader);

  // Compile shaders
  glContext.compileShader(vertShader);
  glContext.compileShader(fragShader);

  if (!glContext.getShaderParameter(vertShader, glContext.COMPILE_STATUS)) {
    console.error("ERROR::COMPILING::Unable to compile VERTEX shader");
    return;
  }

  if (!glContext.getShaderParameter(fragShader, glContext.COMPILE_STATUS)) {
    console.error("ERROR::COMPILING::Unable to compile FRAGMENT shader");
    return;
  }

  // Attach and link the shaders to the shader program
  var program = glContext.createProgram();
  glContext.attachShader(program, vertShader);
  glContext.attachShader(program, fragShader);

  glContext.linkProgram(program);

  if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
    console.error("ERROR::LINKING::Unable to link shaders into program");
    return;
  }

  // This will ensure that the given program is able to run in the current OpenGL/WebGL state
  // As stated in documentation, this step is expensive and typically only used during the app development stage
  glContext.validateProgram(program);

  if (!glContext.getProgramParameter(program, glContext.VALIDATE_STATUS)) {
    console.error("ERROR::VALIDATION::Unable to validate shader program");
  }

  /// Create and set buffer

	var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
  ];
  
  var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

  // Create Vertex buffer object
  var boxVBO = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, boxVBO);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(boxVertices),
    glContext.STATIC_DRAW
  );

  // Index Buffer Object, states the order and which verticies make up the triangles
  var boxIndexBufferObject = glContext.createBuffer();
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject)
  glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), glContext.STATIC_DRAW);

  // Get a handle to the attribute locations
  var positionAttributeLocation = glContext.getAttribLocation(
    program,
    "vertPosition"
  );
  var colorAttributeLocation = glContext.getAttribLocation(
    program,
    "vertColor"
  );

  // Specify layout
  glContext.vertexAttribPointer(
    positionAttributeLocation, // Attribute location handle
    3, // Elements being passed
    glContext.FLOAT, // Type of element
    glContext.FALSE, // Normalized data
    6 * Float32Array.BYTES_PER_ELEMENT, // Total size of elements being passed AKA: Stride
    0 // Offset to this data, as a multiple of the byte length of given type
  );

  // Specify layout
  glContext.vertexAttribPointer(
    colorAttributeLocation,
    3,
    glContext.FLOAT,
    glContext.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT // We have to offset by 2 for the <x, y> attributes that come before the RGB data
  );

  glContext.enableVertexAttribArray(positionAttributeLocation);
  glContext.enableVertexAttribArray(colorAttributeLocation);

  // This sets the current program to our shader program in the OpenGL State Machine
  // This will bind the uniform calls to the current program
  glContext.useProgram(program);

  // Setup Matrices
  var worldMatrixUniformLocation = glContext.getUniformLocation(
    program,
    "worldMatrix"
  );
  var viewMatrixUniformLocation = glContext.getUniformLocation(
    program,
    "viewMatrix"
  );
  var projectionMatrixUniformLocation = glContext.getUniformLocation(
    program,
    "projectionMatrix"
  );

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projectionMatrix = new Float32Array(16);

  glMatrix.mat4.identity(worldMatrix);
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.perspective(
    projectionMatrix,
    glMatrix.glMatrix.toRadian(45),
    canvas.width / canvas.clientHeight,
    0.1,
    1000.0
  );

  glContext.uniformMatrix4fv(
    worldMatrixUniformLocation,
    glContext.FALSE,
    worldMatrix
  );
  glContext.uniformMatrix4fv(
    viewMatrixUniformLocation,
    glContext.FALSE,
    viewMatrix
  );
  glContext.uniformMatrix4fv(
    projectionMatrixUniformLocation,
    glContext.FALSE,
    projectionMatrix
  );

  var xRotMatrix = new Float32Array(16);
  var yRotMatrix = new Float32Array(16);

  var identityMatrix = new Float32Array(16);
  glMatrix.mat4.identity(identityMatrix);

  var angle = 0;
  var loop = function () {
    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    glMatrix.mat4.rotate(yRotMatrix, identityMatrix, angle, [0, 1, 0]);
    glMatrix.mat4.rotate(xRotMatrix, identityMatrix, angle / 2, [1, 0, 0]);
    glMatrix.mat4.mul(worldMatrix, xRotMatrix, yRotMatrix);

    glContext.uniformMatrix4fv(
      worldMatrixUniformLocation,
      glContext.FALSE,
      worldMatrix
    );

    glContext.clearColor(0.5, 0.85, 0.8, 1.0);
    glContext.clear(glContext.DEPTH_BUFFER_BIT | glContext.COLOR_BUFFER_BIT);

    // Method of elements to skip, number of points to draw
    glContext.drawElements(glContext.TRIANGLES, boxIndices.length, glContext.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };

  // Calls this function whenever this canvas is ready to draw
  // Only called if frame is in focus
  requestAnimationFrame(loop);
};
