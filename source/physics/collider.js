import {tiny} from "../../include/common.js";
const {vec3} = tiny;

// Axis-Aligned Bounding Box (AABB) Collider struct.
export class AABBCollider
{
    constructor(x_size, y_size, z_size)
    {
        this.size = vec3(x_size, y_size, z_size);
        this.type = "AABB";
    }
}

// Sphere Collider struct.
export class SphereCollider
{
    constructor(radius)
    {
        this.radius = radius;
        this.type = "Sphere";
    }
}