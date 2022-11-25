import { Force } from "./force.js";

export class RigidBody 
{
    constructor(mass, velocity, is_kinematic)
    {
        this.mass = mass;
        this.is_kinematic = is_kinematic;
        this.velocity = velocity;
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