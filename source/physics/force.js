import {defs, tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export class Force
{
    constructor(affected_bodies, force_vector, indefinite, duration = 0)
    {
        this.affected_bodies = affected_bodies;
        this.force_vector = force_vector;
        this.indefinite = indefinite;
        this.duration = duration;
    }
}