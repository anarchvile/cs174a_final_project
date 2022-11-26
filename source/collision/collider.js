import {defs, tiny} from "../../include/common.js";
const {vec3} = tiny;

export var collider_types = {AABB: "AABB", Sphere: "Sphere"};

// Axis-Aligned Bounding Box (AABB) Collider struct.
export class AABBCollider
{
    constructor(x_size, y_size, z_size)
    {
        this.size = vec3(x_size, y_size, z_size);
        this.type = collider_types.AABB;
        this.points = new defs.Cube().arrays.position;
    }
}

// Sphere Collider struct.
export class SphereCollider
{
    constructor(radius)
    {
        this.radius = radius; // float.
        this.type = collider_types.Sphere;
        this.points = new defs.Subdivision_Sphere(4).arrays.position;
    }
}