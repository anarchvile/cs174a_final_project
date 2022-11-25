import { SphereCollider } from "../physics/collider.js";
import { AABBCollider } from "../physics/collider.js";
import { RigidBody } from "../physics/rigidbody.js";

export class GameObject
{
    #rigidbody;
    #collider;

    constructor(name, shape, vertices, material, position, orientation, scale)
    {
        this.name = name;
        this.shape = shape;
        this.vertices = [];
        if (shape != null)
        {
            for (let i = 0; i < shape.arrays.position.length; ++i)
            {
                this.vertices.push(shape.arrays.position[i].to4(true));
            }
        }
        else
        {
            for (let i = 0; i < vertices.length; ++i)
            {
                if (vertices[i].length == 3)
                {
                    this.vertices.push(vertices[i].to4(true));
                }
                else
                {
                    this.vertices.push(vertices[i]);
                }
            }
        }
        this.material = material;
        this.position = position;
        this.orientation = orientation;
        this.scale = scale;
        this.#rigidbody = null;
        this.#collider = null;
    }

    // Check to see if the GameObject has a Rigidbody component.
    has_rigidbody_component()
    {
        return this.#rigidbody != null;
    }

    // Get the attached Rigidbody component.
    get_rigidbody_component()
    {
        return this.#rigidbody;
    }

    // Add a new rigidbody component to the GameObject (can only have one).
    add_rigidbody_component(mass, velocity, is_kinematic)
    {
        if (this.#rigidbody != null)
        {
            console.log("WARNING: GameObject \"" + this.name + "\" already has an attached Rigidbody; this previous Rigidbody component will now be replaced by the new Rigidbody component.");
            this.#rigidbody = null;
            //delete this.#rigidbody;
        }

        this.#rigidbody = new RigidBody(mass, velocity, is_kinematic);
    }

    // Remove the rigidbody component on the GameObject (if it exists).
    remove_rigidbody_component()
    {
        if (this.#rigidbody != null)
        {
            //delete this.#rigidbody;
            this.#rigidbody = null;
        }
    }

    // Check to see if the GameObject has a collider component.
    has_collider_component()
    {
        return this.#collider != null;
    }

    // Get the attached collider component.
    get_collider_component()
    {
        return this.#collider;
    }

    // Add a collider component to the GameObject (can only have one).
    add_collider_component(type, size)
    {
        if (type != "AABB" && type != "Sphere")
        {
            throw "ERROR: \"" + type + "\" is an invalid collider type; please choose \"AABB\" or \"Sphere\"";
        }

        if (this.#collider != null)
        {
            console.log("WARNING: GameObject " + this.name + " already has an attached Collider; this previous Collider component will now be replaced by the new Collider component.");
            //delete this.#collider;
            this.#collider = null;
        }

        if (type == "AABB")
        {
            this.#collider = new AABBCollider(size[0], size[1], size[2]);
        }
        else if (type == "Sphere")
        {
            this.#collider = new SphereCollider(size);
        }
    }

    // Remove the collider component on GameObject (if it exists).
    remove_collider_component()
    {
        if (this.#collider != null)
        {
            //delete this.#collider;
            this.#collider = null;
        }
    }
}