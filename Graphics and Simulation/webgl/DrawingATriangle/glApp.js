var vertexShader = [
  "precision mediump float;",
  "",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "",
  "varying vec3 fragColor;",
  "",
  "void main()",
  "{",
  "fragColor = vertColor;",
  "gl_Position = vec4(vertPosition, 0.0, 1.0);",
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
  console.log("hit");

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

  var triangleVertices = [
    // <x,y> <r,g,b>
    0.0,
    0.5,
    0.0,
    0.5,
    1.0,
    -0.5,
    -0.5,
    0.7,
    0.1,
    0.0,
    0.5,
    -0.5,
    0.9,
    1.0,
    0.6,
  ];

  // Create Vertex buffer object
  var triangleVBO = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, triangleVBO);

  // Binds data to currently bound buffer
  // Note: We have to ensure the floats being passed are 32bit, JS works in 64bit floats and this can cause issues, so we must cast it
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    glContext.STATIC_DRAW
  );

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
    2, // Elements being passed
    glContext.FLOAT, // Type of element
    glContext.FALSE, // Normalized data
    5 * Float32Array.BYTES_PER_ELEMENT, // Total size of elements being passed AKA: Stride
    0 // Offset to this data, as a multiple of the byte length of given type
  );

  // Specify layout
  glContext.vertexAttribPointer(
    colorAttributeLocation,
    3,
    glContext.FLOAT,
    glContext.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT // We have to offset by 2 for the <x, y> attributes that come before the RGB data
  );

  glContext.enableVertexAttribArray(positionAttributeLocation);
  glContext.enableVertexAttribArray(colorAttributeLocation);

  glContext.useProgram(program);
  // This uses the last bound buffer
  // Method of elements to skip, number of points to draw
  glContext.drawArrays(glContext.TRIANGLES, 0, 3);
};
