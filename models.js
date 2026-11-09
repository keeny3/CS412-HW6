function createCube() {
  const positions = new Float32Array([
    -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,   // front
     1, -1, -1,  -1, -1, -1,  -1,  1, -1,   1,  1, -1,   // back
    -1,  1,  1,   1,  1,  1,   1,  1, -1,  -1,  1, -1,   // top
    -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,   // bottom
     1, -1,  1,   1, -1, -1,   1,  1, -1,   1,  1,  1,   // right
    -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1    // left
  ]);
  const faceNormals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
  const normals = new Float32Array(faceNormals.flatMap(n => [...n, ...n, ...n, ...n]));

  // Tangent; bitangent = cross(N, T)
  const faceTangents = [[1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1]];
  const tangents = new Float32Array(faceTangents.flatMap(t => [...t, ...t, ...t, ...t]));

  const texCoords = new Float32Array(faceNormals.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1]));

  const indices = new Uint16Array([
     0,  1,  2,   0,  2,  3,   // front
     4,  5,  6,   4,  6,  7,   // back
     8,  9, 10,   8, 10, 11,   // top
    12, 13, 14,  12, 14, 15,   // bottom
    16, 17, 18,  16, 18, 19,   // right
    20, 21, 22,  20, 22, 23    // left
  ]);
  return { positions, normals, tangents, texCoords, indices };
}


function createCylinder(segments = 64, uRepeat = 3) {
  const positions = [], normals = [], tangents = [], texCoords = [], indices = [];

  // Side: theta grows with u, so T points along the circle and B = cross(N, T) points up
  for (let i = 0; i <= segments; i++) {
    const u = i / segments, theta = 2 * Math.PI * u;
    const s = Math.sin(theta), c = Math.cos(theta);
    for (const y of [-1, 1]) {
      positions.push(s, y, c);
      normals.push(s, 0, c);
      tangents.push(c, 0, -s);
      texCoords.push(u * uRepeat, (y + 1) / 2);
    }
  }
  for (let i = 0; i < segments; i++) {
    const k = 2 * i;
    indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
  }

  // Caps: planar mapping of x, z into the texture, T = +x on both
  for (const y of [1, -1]) {
    const center = positions.length / 3;
    positions.push(0, y, 0);
    normals.push(0, y, 0);
    tangents.push(1, 0, 0);
    texCoords.push(0.5, 0.5);
    for (let i = 0; i <= segments; i++) {
      const theta = 2 * Math.PI * i / segments;
      const s = Math.sin(theta), c = Math.cos(theta);
      positions.push(s, y, c);
      normals.push(0, y, 0);
      tangents.push(1, 0, 0);
      texCoords.push(0.5 + 0.5 * s, 0.5 - 0.5 * y * c);  // keeps cross(N, T) along +v
    }
    for (let i = 0; i < segments; i++) {
      const a = center + 1 + i, b = a + 1;
      if (y > 0) indices.push(center, a, b);
      else indices.push(center, b, a);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    tangents: new Float32Array(tangents),
    texCoords: new Float32Array(texCoords),
    indices: new Uint16Array(indices)
  };
}

function createSphere(radius, segments) {
    const positions = [];
    const normals = [];
    const indices = [];
    const texCoords = [];
    const tangents = [];

    // Generating vertices, normals, and texCoords
    for (let lat = 0; lat <= segments; lat++) {
        const theta = (lat * Math.PI) / segments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // Loop all the way around the ring (0 to 360 degrees)
        for (let lon = 0; lon <= segments; lon++) {
            const phi = (lon * 2 * Math.PI) / segments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // Spherical coordinate math
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            // Push X, Y, Z positions scaled by the radius
            positions.push(radius * x, radius * y, radius * z);

            normals.push(x,y,z);

            const u = 1.0 - (lon / segments);
            const v = 1.0 - (lat / segments);
            texCoords.push(u, v);

            tangents.push(-sinPhi, 0, cosPhi);
        }
      }

    // Generating indices
    for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
            // Find the 4 corners of our current grid segment quad
            const first  = (lat * (segments + 1)) + lon;
            const second = first + segments + 1;

            // Triangle 1: Top-Left, Bottom-Left, Top-Right
            indices.push(first, second, first + 1);

            // Triangle 2: Bottom-Left, Bottom-Right, Top-Right
            indices.push(second, second + 1, first + 1);
        }
    }
    
    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        tangents: new Float32Array(tangents),
        texCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices)
    };
  }

  function createPrism() {
    const positions = new Float32Array([
        // Front Face (Triangle)
        0.0, 1.0, 0.0,   -0.5, 0.0, 0.5,    0.5, 0.0, 0.5,
        // Right Face (Triangle)
        0.0, 1.0, 0.0,    0.5, 0.0, 0.5,    0.5, 0.0, -0.5,
        // Back Face (Triangle)
        0.0, 1.0, 0.0,    0.5, 0.0, -0.5,  -0.5, 0.0, -0.5,
        // Left Face (Triangle)
        0.0, 1.0, 0.0,   -0.5, 0.0, -0.5,  -0.5, 0.0, 0.5,
        // Base Triangle 1
        -0.5, 0.0, -0.5,   0.5, 0.0, -0.5,   0.5, 0.0, 0.5,
        // Base Triangle 2
        -0.5, 0.0, -0.5,   0.5, 0.0, 0.5,   -0.5, 0.0, 0.5
    ]);

    const pyramidFaceNormals = [
        [0.0, 0.447, 0.894],  // Front
        [0.894, 0.447, 0.0],  // Right
        [0.0, 0.447, -0.894], // Back
        [-0.894, 0.447, 0.0], // Left
        [0.0, -1.0, 0.0],     // Base 1 (Facing straight down)
        [0.0, -1.0, 0.0]      // Base 2 (Facing straight down)
    ];

    const normals = new Float32Array(
        pyramidFaceNormals.flatMap(n => [...n, ...n, ...n])
    );

    // --- ADDED: MANUALLY MAPPED UV TEXTURE COORDINATES ---
    // Triangles use a standard mapping: Apex is top-center, bottom vertices are left/right corners.
    // The square base unfolds flat onto the 2D texture.
    const texCoords = new Float32Array([
        // Front Face
        0.5, 1.0,   0.0, 0.0,   1.0, 0.0,
        // Right Face
        0.5, 1.0,   0.0, 0.0,   1.0, 0.0,
        // Back Face
        0.5, 1.0,   0.0, 0.0,   1.0, 0.0,
        // Left Face
        0.5, 1.0,   0.0, 0.0,   1.0, 0.0,
        // Base Triangle 1
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,
        // Base Triangle 2
        0.0, 0.0,   1.0, 1.0,   0.0, 1.0
    ]);

    // --- ADDED: MANUALLY MAPPED TANGENTS ---
    // Tangents point along the horizontal direction of the texture map (U-axis) for each face.
    const tangents = new Float32Array([
        // Front Face (U direction moves right along +X)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
        // Right Face (U direction moves deep along -Z)
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        // Back Face (U direction moves left along -X)
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        // Left Face (U direction moves forward along +Z)
        0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
        // Base Triangles (U direction aligns with standard world +X axis)
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0
    ]);

    const indices = new Uint16Array([
        0, 1, 2,     // Front
        3, 4, 5,     // Right
        6, 7, 8,     // Back
        9, 10, 11,   // Left
        12, 13, 14,  // Base triangle 1
        15, 16, 17   // Base triangle 2
    ]);

    // Make sure to return all 5 required properties so createMesh() can read them!
    return { positions, normals, texCoords, tangents, indices };
}

function createCone(radius = 1.0, height = 2.0, segments = 30) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const tangents = [];
    const indices = [];

    const halfH = height / 2.0;

    // --- 1. SIDE SURFACES (WALLS) ---
    // We loop 'segments' times. We duplicate vertices at the end seam so UVs wrap seamlessly.
    for (let i = 0; i <= segments; i++) {
        const ratio = i / segments;
        const theta = ratio * 2.0 * Math.PI;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        // Physical base point coordinates
        const bx = radius * cosTheta;
        const bz = radius * sinTheta;

        // Calculate a sloped normal vector facing outwards from the cone slant
        const slantAngle = Math.atan2(radius, height);
        const nyFactor = Math.sin(slantAngle);
        const nrFactor = Math.cos(slantAngle);
        const nx = cosTheta * nrFactor;
        const nz = sinTheta * nrFactor;

        // Tangent vector moves horizontally around the perimeter (U direction)
        const tx = -sinTheta;
        const tz = cosTheta;

        // Vertex A: The Base Ring point
        positions.push(bx, -halfH, bz);
        normals.push(nx, nyFactor, nz);
        texCoords.push(ratio, 0.0);
        tangents.push(tx, 0.0, tz);

        // Vertex B: The Tip (Apex) point 
        // We duplicate the apex for each slice so the UV coordinates interpolate cleanly
        positions.push(0.0, halfH, 0.0);
        normals.push(nx, nyFactor, nz);
        texCoords.push(ratio, 1.0);
        tangents.push(tx, 0.0, tz);
    }

    // Connect the side walls using index triangles
    for (let i = 0; i < segments; i++) {
        const baseIdx = i * 2;
        // Triangle connecting Base(i) -> Base(i+1) -> Apex(i)
        indices.push(baseIdx, baseIdx + 2, baseIdx + 1);
    }

    // --- 2. BOTTOM END CAP ---
    const bottomCenterIdx = positions.length / 3;
    // Flat circular base center vertex
    positions.push(0.0, -halfH, 0.0);
    normals.push(0.0, -1.0, 0.0);
    texCoords.push(0.5, 0.5);
    tangents.push(-1.0, 0.0, 0.0);

    const capStartIdx = positions.length / 3;
    // Generate an isolated ring of vertices for the flat bottom cap to keep lighting normals sharp
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2.0 * Math.PI;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        positions.push(radius * cosTheta, -halfH, radius * sinTheta);
        normals.push(0.0, -1.0, 0.0);
        
        // Planar circle layout mapping for flat texture coordinates
        texCoords.push(0.5 + 0.5 * cosTheta, 0.5 + 0.5 * sinTheta);
        tangents.push(-1.0, 0.0, 0.0);
    }

    // Connect cap ring positions to the base center coordinate
    for (let i = 0; i < segments; i++) {
        indices.push(bottomCenterIdx, capStartIdx + i, capStartIdx + i + 1);
    }

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        tangents: new Float32Array(tangents),
        texCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices)
    };
}


