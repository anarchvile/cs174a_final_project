import {tiny} from "../../include/common.js";
import {collider_types, SphereCollider} from "../collision/collider.js";
import {AABBCollider} from "../collision/collider.js";
import {RigidBody} from "../physics/rigidbody.js";
const {vec4} = tiny;

export class GameObject
{
    #rigidbody;
    #collider;

    // Constructor for GameObject.
    constructor(name, shape, material, position, orientation, scale)
    {
        this.name = name; // string.
        this.shape = shape; // Shape object (e.g. cube, sphere, .OBJ file, etc.).
        this.material = material; // Material object.
        this.position = position; // vec4 where position[3] = 1.
        this.orientation = orientation; // vec3.
        this.scale = scale; // vec3.
        this.#rigidbody = null; //RigidBody object.
        this.#collider = null; // Collider object.
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
    add_rigidbody_component(is_kinematic = false, mass = 1, velocity = vec4(0, 0, 0, 0), restitution = 1.69, friction = 0.3)
    {
        if (this.#rigidbody != null)
        {
            console.log("WARNING: GameObject \"" + this.name + "\" already has an attached Rigidbody; this previous Rigidbody component will now be replaced by the new Rigidbody component.");
            this.#rigidbody = null;
            //delete this.#rigidbody;
        }

        this.#rigidbody = new RigidBody(is_kinematic, mass, velocity, restitution, friction);
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
        if (type != collider_types.AABB && type != collider_types.Sphere)
        {
            throw "ERROR: \"" + type + "\" is an invalid collider type; please choose \"" + 
                  collider_types.AABB + "\" or \"" + collider_types.Sphere + "\".";
        }

        if (this.#collider != null)
        {
            console.log("WARNING: GameObject " + this.name + " already has an attached Collider; this previous Collider component will now be replaced by the new Collider component.");
            //delete this.#collider;
            this.#collider = null;
        }

        if (type == collider_types.AABB)
        {
            this.#collider = new AABBCollider(size[0], size[1], size[2]);
        }
        else if (type == collider_types.Sphere)
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