import {tiny} from "../../include/common.js";
import {Force} from "./force.js";
const {vec4} = tiny;

export class RigidBody 
{
    constructor(is_kinematic = false, mass = 1, velocity = vec4(0, 0, 0, 0), restitution = 1.69, friction = 0.3)
    {
        this.mass = mass; // float.
        this.velocity = velocity; // vec4 where velocity[3] = 0.
        this.restitution = restitution; // float.
        this.friction = friction; // float.
        this.is_kinematic = is_kinematic; // bool.
        this.forces = new Map();
    }

    // Apply a new force to the Rigidbody.
    add_force(name, force_vector, indefinite, duration = 0)
    {
        this.forces.set(name, new Force(name, force_vector, indefinite, duration));
    }

    // Apply an existing Force object to the Rigidbody.
    add_force_object(force)
    {
        this.forces.set(force.name, force);
    }

    // Remove a force, via name, from the Rigidbody.
    remove_force(force_name)
    {
        if (this.forces.has(force_name))
        {
            this.forces.delete(force_name);
        }
        else
        {
            console.log("WARNING: Rigidbody contains no force called \"" + force_name + "\".");
        }
    }

    // Remove all forces currently acting on the Rigidbody.
    clear_forces()
    {
        this.forces.clear();
    }
}