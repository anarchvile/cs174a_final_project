import {tiny} from "../../include/common.js";
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
        this.normal = vec4(0, 0, 0, 0); // Oriented to point from collider i to collider j.

        // For clamping.
        this.normal_impulse_magnitude_sum = 0;
        this.tangent_impulse_magnitude_sum = 0;
    }
};