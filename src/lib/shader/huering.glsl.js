export const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;


void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

export const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;

vec3 hueToRGB(float h){
    float kr = mod(5.0 + h * 6.0, 6.0);
    float kg = mod(3.0 + h * 6.0, 6.0);
    float kb = mod(1.0 + h * 6.0, 6.0);

    float r = 1.0 - max(min(kr, min(4.0 - kr, 1.0)), 0.0);
    float g = 1.0 - max(min(kg, min(4.0 - kg, 1.0)), 0.0);
    float b = 1.0 - max(min(kb, min(4.0 - kb, 1.0)), 0.0);

    return vec3(r, g, b);
}

void main() {
  float pi = 3.141592653589793238462643383279;

	// radius [0,1]
	vec2 uv_mid = 2.0 * (vUv - vec2(0.5, 0.5));
	float r = length(uv_mid);

  // zero outside of circle
  float mask_outside = smoothstep(0.99, 1.0, r);
  mask_outside = abs(mask_outside - 1.0);

  // zero inside of circle
  float mask_inside = smoothstep(0.96, 0.97, r);

  // calculate hue
  float h = atan(uv_mid[1], uv_mid[0]) + (240.0 * pi) / 180.0; // atan [-pi, pi] + pi = [0, 2pi]
  vec3 rgb = hueToRGB(h / (2.0 * pi));

	gl_FragColor = vec4(rgb[0], rgb[1], rgb[2], 1.0) * vec4(mask_outside * mask_inside, mask_outside * mask_inside, mask_outside * mask_inside, mask_outside * mask_inside);
}
`;
