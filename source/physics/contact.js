import {defs, tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export class Contact
{
    constructor()
    {
        // Contact point data.
        this.globalPositionI = vec4(0, 0, 0, 1);
        this.globalPositionJ = vec4(0, 0, 0, 1);
        this.localPositionI = vec4(0, 0, 0, 1);
        this.localPositionJ = vec4(0, 0, 0, 1);

        // These 3 vectors form an orthonormal basis.
        this.normal = vec4(0, 0, 0, 0); // Oriented to point from colliderA to colliderB.
        this.tangent1 = vec4(0, 0, 0, 0);
        this.tangent2 = vec4(0, 0, 0, 0);

        // Penetration depth.
        this.depth = 0; 

        // For clamping.
        this.normalImpulseSum = 0;
        this.tangentImpulseSum1 = 0;
        this.tangentImpulseSum2 = 0;

        this.closingVelocityI = vec4(0, 0, 0, 0);
        this.closingVelocityJ = vec4(0, 0, 0, 0);
    }
};