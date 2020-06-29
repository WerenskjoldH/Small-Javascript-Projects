var gl;

var initGLProg = function () {
  loadTextResource("stdShader.vt", function (vsErr, vsText) {
    if (vsErr) {
      alert("ERROR::RESOURCE::Unable to get vertex shader");
      console.error(vsErr);
    } else {
      loadTextResource("stdShader.fr", function (fsErr, fsText) {
        if (fsErr) {
          alert("ERROR::RESOURCE::Unable to get fragment shader");
          console.error(fsErr);
        } else {
          loadJSON("floatingIsland.json", function (modelErr, modelObj) {
            if (modelErr) {
              //alert("ERROR::RESOURCE::Unable to get model");
              console.error(modelErr);
            } else {
              loadImage("islandTexture.png", function (imageErr, imageObj) {
                if (imageErr) {
                  alert("ERROR::RESOURCE::Unable to get island texture");
                  console.error(imageErr);
                } else {
                  runGLProg(vsText, fsText, modelObj, imageObj);
                }
              });
            }
          });
        }
      });
    }
  });
};

var runGLProg = function (
  vertexShaderRef,
  fragmentShaderRef,
  modelRef,
  textureRef
) {
  var canvas = document.getElementById("glCanvas");
  var gl = canvas.getContext("webgl");

  // These next two conditionals are to ensure the browser sets up the context correctly
  if (!gl) {
    console.log("Using experimental webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  // If there is an issue, it will print an alert as a last ditch effort
  if (!gl) {
    alert("WebGL Unsupported by browser.");
  }

  //   canvas.width = window.innerWidth;
  //   canvas.height = window.innerHeight;
  //   gl.viewport(0, 0, window.innerWidth, window.innerHeight);

  // Enable Depth Test in OpenGL State Machine
  // This will enable depth testing in the rasterizer
  //    Compares pixel depth when deciding what to draw
  gl.enable(gl.DEPTH_TEST);

  // Enable Back Face Culling in OpenGL State Machine
  // This will prevent unnecessary calculations of culled faces
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  gl.clearColor(0.5, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create the shader objects
  var vertShader = gl.createShader(gl.VERTEX_SHADER);
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Set shader source code
  gl.shaderSource(vertShader, vertexShaderRef);
  gl.shaderSource(fragShader, fragmentShaderRef);

  // Compile shaders
  gl.compileShader(vertShader);
  gl.compileShader(fragShader);

  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.error("ERROR::COMPILING::Unable to compile VERTEX shader");
    return;
  }

  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error("ERROR::COMPILING::Unable to compile FRAGMENT shader");
    return;
  }

  // Attach and link the shaders to the shader program
  var program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR::LINKING::Unable to link shaders into program");
    return;
  }

  // This will ensure that the given program is able to run in the current OpenGL/WebGL state
  // As stated in documentation, this step is expensive and typically only used during the app development stage
  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR::VALIDATION::Unable to validate shader program");
  }

  /// Create and set buffer
  var islandVertices = modelRef.meshes[0].vertices;
  var islandIndices = [].concat.apply([], modelRef.meshes[0].faces);
  var islandTexCoords = modelRef.meshes[0].texturecoords[0];

  // Create Vertex buffer object
  var islandVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, islandVertexBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(islandVertices),
    gl.STATIC_DRAW
  );

  // Create Texture Coords buffer object
  var islandTextureCoordsBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, islandTextureCoordsBufferObject);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(islandTexCoords),
    gl.STATIC_DRAW
  );

  // Index Buffer Object, states the order and which verticies make up the triangles
  var islandIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, islandIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(islandIndices),
    gl.STATIC_DRAW
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, islandVertexBufferObject);
  // Get a handle to the attribute locations
  var positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
  // Specify layout
  gl.vertexAttribPointer(
    positionAttributeLocation, // Attribute location handle
    3, // Elements being passed
    gl.FLOAT, // Type of element
    gl.FALSE, // Normalized data
    3 * Float32Array.BYTES_PER_ELEMENT, // Total size of elements being passed AKA: Stride
    0 // Offset to this data, as a multiple of the byte length of given type
  );
  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, islandTextureCoordsBufferObject);
  var texCoordAttributeLocation = gl.getAttribLocation(program, "vertTexCoord");
  // Specify layout
  gl.vertexAttribPointer(
    texCoordAttributeLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0 // We have to offset by 2 for the <x, y> attributes that come before the RGB data
  );
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  /// Create Texture

  var islandTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, islandTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    textureRef
  );

  console.log(textureRef);

  gl.bindTexture(gl.TEXTURE_2D, null);

  // This sets the current program to our shader program in the OpenGL State Machine
  // This will bind the uniform calls to the current program
  gl.useProgram(program);

  // Setup Matrices
  var worldMatrixUniformLocation = gl.getUniformLocation(
    program,
    "worldMatrix"
  );
  var viewMatrixUniformLocation = gl.getUniformLocation(program, "viewMatrix");
  var projectionMatrixUniformLocation = gl.getUniformLocation(
    program,
    "projectionMatrix"
  );

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projectionMatrix = new Float32Array(16);

  glMatrix.mat4.identity(worldMatrix);
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, -12], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.perspective(
    projectionMatrix,
    glMatrix.glMatrix.toRadian(45),
    canvas.width / canvas.clientHeight,
    0.1,
    1000.0
  );

  gl.uniformMatrix4fv(worldMatrixUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(viewMatrixUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(
    projectionMatrixUniformLocation,
    gl.FALSE,
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
    glMatrix.mat4.rotate(xRotMatrix, identityMatrix, -90, [1, 0, 0]);
    glMatrix.mat4.mul(worldMatrix, yRotMatrix, xRotMatrix);

    gl.uniformMatrix4fv(worldMatrixUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0.5, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, islandTexture);

    // Method of elements to skip, number of points to draw
    gl.drawElements(gl.TRIANGLES, islandIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };

  // Calls this function whenever this canvas is ready to draw
  // Only called if frame is in focus
  requestAnimationFrame(loop);
};
