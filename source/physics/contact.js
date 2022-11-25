import {tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec4} = tiny;

export class Contact
{
    constructor()
    {
        // Contact point data.
        this.global_position_i = vec4(0, 0, 0, 1);
        this.global_position_j = vec4(0, 0, 0, 1);
        this.local_position_i = vec4(0, 0, 0, 1);
        this.local_position_j = vec4(0, 0, 0, 1);

        // These 3 vectors form an orthonormal basis.
        this.normal = vec4(0, 0, 0, 0); // Oriented to point from colliderA to colliderB.
        this.tangent_1 = vec4(0, 0, 0, 0);
        this.tangent_2 = vec4(0, 0, 0, 0);

        // Penetration depth.
        this.depth = 0; 

        // For clamping.
        this.normal_impulse_sum = 0;
        this.tangent_impulse_sum_1 = 0;
        this.tangent_impulse_sum_2 = 0;
    }
};