import {tiny} from "../../include/common.js";
import {Contact} from "../collision/contact.js"
import {GJKCollision} from "../collision/gjk_collision.js";
import {EPA} from "../collision/epa.js";
import { collider_types } from "../collision/collider.js";
const {vec3, vec4, Mat4, Scene} = tiny;

// The PhysicsSim class handles all rigidbody physics simulation behavior, including
// applying forces, computing new positions/velocities as a result of applied forces,
// etc. Physics simulation is updated on a fixed timestep, separate from the animation
// framerate.
export class PhysicsSim extends Scene 
{
    #time_accumulator;
    #time_scale;
    #t;
    #dt;
    #steps_taken;

    #contact_constraints;
    #gjk_collision;
    #epa;

    #game_objects;
    #cached_rigidbodies_to_add;
    #cached_rigidbodies_to_remove;
    #cached_colliders_to_add;
    #cached_colliders_to_remove;
    #swap_demo;

    constructor() 
    {
        super();

        this.#time_accumulator = 0;
        this.#time_scale = 1;
        this.#t = 0;
        this.#dt = 1 / 20;
        this.#steps_taken = 0;

        this.#game_objects = new Map();
        this.#cached_rigidbodies_to_add = [];
        this.#cached_rigidbodies_to_remove = [];
        this.#cached_colliders_to_add = [];
        this.#cached_colliders_to_remove = [];
        this.#contact_constraints = new Map();

        this.#gjk_collision = new GJKCollision();
        this.#epa = new EPA();

        this.physics_demo_level = 1;
        this.#swap_demo = false;
    }

    // Abstract method that gets implemented in the derived scene.
    // Gets called once at start time.
    initialize(context, program_state) 
    {
        throw "IMPLEMENT INITIALIZE!";
    }

    fixed_update(frame_time)
    {
        // Add/remove cached game objects, and reset the caches.
        for (let go of this.#cached_rigidbodies_to_add)
        {
            this.#game_objects.set(go.name, go);
        }
        for (let go of this.#cached_rigidbodies_to_remove)
        {
            this.#game_objects.delete(go.name);
        }
        for (let go of this.#cached_colliders_to_add)
        {
            this.#game_objects.set(go.name, go);
        }
        for (let go of this.#cached_colliders_to_remove)
        {
            this.#game_objects.delete(go.name);
        }

        this.#cached_rigidbodies_to_add.length = 0;
        this.#cached_colliders_to_remove.length = 0;
        this.#cached_colliders_to_add.length = 0;
        this.#cached_colliders_to_remove.length = 0;

        frame_time = this.#time_scale * frame_time;
        
        // Limit the amount of time we will spend computing during this timestep if display lags:
        this.#time_accumulator += Math.min(frame_time, 0.1);
        // Repeatedly step the simulation until we're caught up with this frame:
        while (Math.abs(this.#time_accumulator) >= this.#dt)
        {
            // Step 1: Integrate applied accelerations to get nominal
            // object velocities.
            // Single step of the simulation for all game objects with Rigidbody components.
            for (let go of this.#game_objects.values())
            {
                // Skip if no Rigidbody component is present (i.e. if the GameObject
                // is just a Collider).
                if (!go.has_rigidbody_component())
                {
                    continue;
                }
                // Get the Rigidbody component of this GameObject.
                let rb = go.get_rigidbody_component();

                for (let force of rb.forces.values())
                {
                    // Remove forces whose duration has expired.
                    if (!force.indefinite && force.duration <= 0)
                    {
                        rb.forces.delete(force.name);
                    }
                    // Decrement force duration.
                    else if (!force.indefinite && force.duration > 0)
                    {
                        force.duration -= this.#dt;
                    }

                    // Skip force application of the rigidbody is kinematic.
                    if (rb.is_kinematic)
                    {
                        continue;
                    }

                    // Apply the current force to the non-kinematic rigidbody 
                    // it acts upon in order to determine a new tentative velocity
                    // prior to contact resolution.
                    const acceleration = force.force_vector.times(1 / rb.mass);
                    rb.velocity = rb.velocity.plus(acceleration.times(this.#dt));
                }
            }

            // Step 2: Collision detection - for now we just use spheres and boxes as the only
            // primitive and naively check for overlapping regions via an
            // O(n^2) algorithm. If we detect any overlap, create a contact constraint
            // object for those two objects. Note that the contact constraint can exist between
            // two rigidbodies, a rigidbody and a collider, and two colliders (need to account
            // for these possibilities later on!). Note that all rigidbodies must have colliders 
            // attached, but not all collider gameobjects need a rigidbody, hence why it's safe 
            // for us to just get each gameobject's collider component in this step.
            for (let i = 0; i < this.#game_objects.size; ++i)
            {
                let goi = this.#game_objects.get(Array.from(this.#game_objects.keys())[i]);
                let ci = goi.get_collider_component();
                for (let j = i + 1; j < this.#game_objects.size; ++j)
                {
                    let goj = this.#game_objects.get(Array.from(this.#game_objects.keys())[j]);
                    let cj = goj.get_collider_component();

                    // AABB-AABB collision detection. Uses more specialized/specific algorithm
                    // for faster/more precise results.
                    if (ci.type == collider_types.AABB && cj.type == collider_types.AABB)
                    {
                        // Check if the two boxes overlap.
                        if 
                        (
                            !(goi.position[0] - ci.size[0] <= goj.position[0] + cj.size[0] &&
                            goi.position[0] + ci.size[0] >= goj.position[0] - cj.size[0] &&
                            goi.position[1] - ci.size[1] <= goj.position[1] + cj.size[1] &&
                            goi.position[1] + ci.size[1] >= goj.position[1] - cj.size[1] &&
                            goi.position[2] - ci.size[2] <= goj.position[2] + cj.size[2] &&
                            goi.position[2] + ci.size[2] >= goj.position[2] - cj.size[2])
                        )
                        {
                            continue;
                        }

                        // Create new contact constraint.
                        let contact = new Contact();

                        // Get the point on box I that is closest to box J.
                        let pnt_on_i_clst_to_j = vec4(0, 0, 0, 1);
                        pnt_on_i_clst_to_j[0] = Math.max(goi.position[0] - ci.size[0], Math.min(goj.position[0], goi.position[0] + ci.size[0]));
                        pnt_on_i_clst_to_j[1] = Math.max(goi.position[1] - ci.size[1], Math.min(goj.position[1], goi.position[1] + ci.size[1]));
                        pnt_on_i_clst_to_j[2] = Math.max(goi.position[2] - ci.size[2], Math.min(goj.position[2], goi.position[2] + ci.size[2]));
                        // Get the point on box J that is closest to box I.
                        let pnt_on_j_clst_to_i = vec4(0, 0, 0, 1);
                        pnt_on_j_clst_to_i[0] = Math.max(goj.position[0] - cj.size[0], Math.min(goi.position[0], goj.position[0] + cj.size[0]));
                        pnt_on_j_clst_to_i[1] = Math.max(goj.position[1] - cj.size[1], Math.min(goi.position[1], goj.position[1] + cj.size[1]));
                        pnt_on_j_clst_to_i[2] = Math.max(goj.position[2] - cj.size[2], Math.min(goi.position[2], goj.position[2] + cj.size[2]));

                        contact.global_position_i = pnt_on_i_clst_to_j;
                        contact.global_position_j = pnt_on_j_clst_to_i;

                        contact.local_position_i = pnt_on_i_clst_to_j.minus(goi.position);
                        contact.local_position_j = pnt_on_j_clst_to_i.minus(goj.position);

                        let norms = [];
                        let dir = goj.position.minus(goi.position);

                        // We use the largest size dimensions for each AABB collider
                        // to determine the contact normal.
                        let max_size = vec3(
                            (ci.size[0] > cj.size[0]) ? ci.size[0] : cj.size[0],
                            (ci.size[1] > cj.size[1]) ? ci.size[1] : cj.size[1],
                            (ci.size[2] > cj.size[2]) ? ci.size[2] : cj.size[2]
                        );
                        
                        // Clamp on x-axis, check if dir penetrates the two AABB planes perpendicular to the x-axis.
                        if (dir[0] != 0)
                        {   
                            const alpha = Math.abs(max_size[0] / dir[0]);
                            if (Math.abs(alpha * dir[1]) <= max_size[1] && Math.abs(alpha * dir[2]) <= max_size[2])
                            {
                                if (dir[0] > 0)
                                {
                                    norms.push(vec4(1, 0, 0, 0));
                                }
                                else
                                {
                                    norms.push(vec4(-1, 0, 0, 0));
                                }
                            }
                        }
                        // Clamp on y-axis, check if dir penetrates the two AABB planes perpendicular to the y-axis.
                        if (dir[1] != 0)
                        {   
                            const alpha = Math.abs(max_size[1] / dir[1]);
                            if (Math.abs(alpha * dir[0]) <= max_size[0] && Math.abs(alpha * dir[2]) <= max_size[2])
                            {
                                if (dir[1] > 0)
                                {
                                    norms.push(vec4(0, 1, 0, 0));
                                }
                                else
                                {
                                    norms.push(vec4(0, -1, 0, 0));
                                }
                            }
                        }
                        // Clamp on z-axis, check if dir penetrates the two AABB planes perpendicular to the z-axis.
                        if (dir[2] != 0)
                        {   
                            const alpha = Math.abs(max_size[2] / dir[2]);
                            if (Math.abs(alpha * dir[0]) <= max_size[0] && Math.abs(alpha * dir[1]) <= max_size[1])
                            {
                                if (dir[2] > 0)
                                {
                                    norms.push(vec4(0, 0, 1, 0));
                                }
                                else
                                {
                                    norms.push(vec4(0, 0, -1, 0));
                                }
                            }
                        }
                        
                        for (let n of norms)
                        {
                            contact.normal = contact.normal.plus(n);
                        }
                        
                        if (contact.normal.norm() != 0)
                        {
                            contact.normal = contact.normal.to3().normalized().to4(false);
                        }

                        const key_array = [goi.name, goj.name];
                        this.#contact_constraints.set(key_array, contact);
                    }
                    // For all other collision detection we use the more general GJK+EPA method.
                    else
                    {
                        // Utilize GJK algorithm to determine if the two shapes are overlapping.
                        let gjk_result = this.#gjk_collision.is_colliding(goi, goj);
                        if (!gjk_result.are_colliding)
                        {
                            continue;
                        }

                        // If we find a valid collision, transform the resultant simplex
                        // into a 3-simplex and pass it on to the EPA to find the minimum
                        // translation vector (MTV) for resolving said collision.
                        gjk_result.simplex.transform_into_3_simplex();
                        let epa_result = this.#epa.solve(goi, goj, gjk_result.simplex);
                        if (epa_result == null)
                        {
                            continue;
                        }
                        
                        // Create a new contact constraint for the collision.
                        let contact = new Contact();
                        contact.normal = epa_result.axis.to4(false);
                        // Get the global positions of the deepest penetration points on each object.
                        contact.global_position_i = goi.position.plus(contact.normal.times(epa_result.dist));
                        contact.global_position_j = goj.position.plus(contact.normal.times(-epa_result.dist));
                        // Get the vectors pointing from the object center of mass to the point
                        // of deepest penetration in the object's local reference frame.
                        contact.local_position_i = contact.normal.times(epa_result.dist);
                        contact.local_position_j = contact.normal.times(-epa_result.dist);
                        const key_array = [goi.name, goj.name];
                        this.#contact_constraints.set(key_array, contact);
                    }
                }
            }

            // Step 3: Solve velocity constraint.
            for (let i = 0; i < 15; ++i)
            {
                // Apply tangential velocity constrain (i.e. friction).
                for (const [key, contact] of this.#contact_constraints)
                {
                    let goi = this.#game_objects.get(key[0]);
                    let goj = this.#game_objects.get(key[1]);
                    let rbi = goi.get_rigidbody_component();
                    let rbj = goj.get_rigidbody_component();

                    // Need to recalculate relative velocity because the previous step could have changed
                    // the object velocity. Make sure to take into account the fact that some of the
                    // game objects we iterate over are colliders only!
                    let friction = 0;
                    let relative_velocity = vec4(0, 0, 0, 0);
                    let effective_mass = 1;
                    if (rbi != null && rbj != null)
                    {
                        friction = (rbi.friction + rbj.friction) / 2;
                        relative_velocity = rbj.velocity.minus(rbi.velocity);
                        effective_mass = 1 / rbi.mass + 1 / rbj.mass;
                    }
                    else if (rbi != null && rbj == null)
                    {
                        friction = rbi.friction;
                        relative_velocity = rbi.velocity.times(-1);
                        effective_mass = 1 / rbi.mass + 1;
                    }
                    else if (rbi == null && rbj != null)
                    {
                        friction = rbj.friction;
                        relative_velocity = rbj.velocity;
                        effective_mass = 1 / rbj.mass + 1;
                    }

                    // Tangent impulse direction is the normalized projection of the relative velocity
                    // onto the tangential collision plane.
                    let tangent_impulse_dir = relative_velocity.minus(contact.normal.times(relative_velocity.dot(contact.normal)));
                    if (tangent_impulse_dir.norm() != 0)
                    {
                        tangent_impulse_dir = tangent_impulse_dir.normalized();
                    }
                    // Negate velocity components that lie in the plane normal
                    // to the collision (i.e. in the tangential plane) to simulate friction.
                    const tangent_velocity_magnitude = -relative_velocity.dot(tangent_impulse_dir);
                    let tangent_impulse_magnitude = tangent_velocity_magnitude / effective_mass;

                    // Clamp so that the accumulated friction impulse in the
                    // contact constraint is always between -max_friction and 
                    // max_friction.
                    const max_friction = friction * contact.normal_impulse_magnitude_sum;
                    const new_tangent_impulse_magnitude = Math.min(max_friction, Math.max(-max_friction, contact.tangent_impulse_magnitude_sum + tangent_impulse_magnitude));
                    tangent_impulse_magnitude = new_tangent_impulse_magnitude - contact.tangent_impulse_magnitude_sum;
                    contact.tangent_impulse_magnitude_sum = new_tangent_impulse_magnitude;
                    const tangent_impulse_vector = tangent_impulse_dir.times(tangent_impulse_magnitude);

                    // Only apply contact impulse to non-kinematic rigidbodies.
                    if (rbi != null && !rbi.is_kinematic)
                    {
                        rbi.velocity = rbi.velocity.minus(tangent_impulse_vector.times(1 / rbi.mass));
                    }
                    if (rbj != null && !rbj.is_kinematic)
                    {
                        rbj.velocity = rbj.velocity.plus(tangent_impulse_vector.times(1 / rbj.mass));
                    }
                }

                // Apply normal velocity constraint (i.e. reaction force that prevents
                // objects from phasing through one another).
                for (const [key, contact] of this.#contact_constraints)
                {
                    let goi = this.#game_objects.get(key[0]);
                    let goj = this.#game_objects.get(key[1]);
                    let rbi = goi.get_rigidbody_component();
                    let rbj = goj.get_rigidbody_component();

                    // Need to recalculate relative velocity because the previous step could have changed
                    // the object velocity. Make sure to take into account the fact that some of the
                    // game objects we iterate over are colliders only!
                    let restitution = 0;
                    let relative_velocity = vec4(0, 0, 0, 0);
                    let effective_mass = 1;
                    if (rbi != null && rbj != null)
                    {
                        restitution = rbi.restitution * rbj.restitution;
                        relative_velocity = rbj.velocity.minus(rbi.velocity);
                        effective_mass = 1 / rbi.mass + 1 / rbj.mass;
                    }
                    else if (rbi != null && rbj == null)
                    {
                        restitution = rbi.restitution ** 2;
                        relative_velocity = rbi.velocity.times(-1);
                        effective_mass = 1 / rbi.mass + 1;
                    }
                    else if (rbi == null && rbj != null)
                    {
                        restitution = rbj.restitution ** 2;
                        relative_velocity = rbj.velocity;
                        effective_mass = 1 / rbj.mass + 1;
                    }

                    // Compute impulse in normal direction.
                    const normal_velocity_magnitude = relative_velocity.dot(contact.normal);
                    let normal_impulse_magnitude = (-(1 + restitution) * normal_velocity_magnitude) / effective_mass;

                    // Clamp so that accumulated normal impulse stored in 
                    // the contact is always positive (otherwise collisions
                    // could mistakenly drive objects through one another).
                    const new_normal_impulse_magnitude = Math.max(contact.normal_impulse_magnitude_sum + normal_impulse_magnitude, 0);
                    normal_impulse_magnitude = new_normal_impulse_magnitude - contact.normal_impulse_magnitude_sum;
                    contact.normal_impulse_magnitude_sum = new_normal_impulse_magnitude;
                    const normal_impulse_vector = contact.normal.times(normal_impulse_magnitude);

                    // By convention the normal points away from rbi, so negate.
                    // Only apply contact impulse to non-kinematic rigidbodies.
                    if (rbi != null && !rbi.is_kinematic)
                    {
                        rbi.velocity = rbi.velocity.minus(normal_impulse_vector.times(1 / rbi.mass));
                    }
                    if (rbj != null && !rbj.is_kinematic)
                    {
                        rbj.velocity = rbj.velocity.plus(normal_impulse_vector.times(1 / rbj.mass));
                    }
                }
            }

            // Step 4: Clamp velocities of Rigidbodies so that they don't grow too large.
            for (const go of this.#game_objects.values())
            {
                if (!go.has_rigidbody_component())
                {
                    continue;
                }

                let rb = go.get_rigidbody_component();
                if (!rb.is_kinematic)
                {
                    if (rb.velocity.norm() > 10)
                    {
                        rb.velocity = rb.velocity.normalized().times(10);
                    }
                }
            }

            // Step 5: Integrate velocities of Rigidbodies to obtain new object positions.
            for (let go of this.#game_objects.values())
            {
                if (!go.has_rigidbody_component())
                {
                    continue;
                }

                let rb = go.get_rigidbody_component();
                if (!rb.is_kinematic)
                {
                    go.position = go.position.plus(rb.velocity.times(this.#dt));
                }
            }

            // Step 6: Apply position constraint to ensure that there is no object overlap.
            for (let i = 0; i < 3; ++i)
            {
                for (const [key, contact] of this.#contact_constraints)
                {
                    let goi = this.#game_objects.get(key[0]);
                    let goj = this.#game_objects.get(key[1]);
                    let rbi = goi.get_rigidbody_component();
                    let rbj = goj.get_rigidbody_component();

                    const separation = -Math.abs(contact.global_position_j.minus(contact.global_position_i).dot(contact.normal.times(-1)));

                    const steering_constant = 0.005; // Determined via trial-and-error.
                    const max_correction = -10; // Limit corrective force for position constraint resolution.
                    const slop = 1; // 1 pixel worth of penetration tolerance.

                    // Clamp to avoid over-correction.
                    const steering_force = Math.max(max_correction, Math.min(steering_constant * (separation + slop), 0));
                    let effective_mass = 1;
                    if (rbi != null && rbj != null)
                    {
                        effective_mass = 1 / rbi.mass + 1 / rbj.mass;
                    }
                    else if (rbi != null && rbj == null)
                    {
                        effective_mass = 1 / rbi.mass + 1;
                    }
                    else if (rbi == null && rbj != null)
                    {
                        effective_mass = 1 / rbj.mass + 1;
                    }
                    var impulse = contact.normal.times(-steering_force / effective_mass);
                    
                    // Update positions of rbi & rbj directly via "pseudo-impulse" (same impulse formula from above).
                    if (rbi != null && !rbi.is_kinematic) 
                    {
                        goi.position = goi.position.minus(impulse.times(1 / rbi.mass));
                    }
                
                    if (rbj != null && !rbj.is_kinematic) 
                    {
                        goj.position = goj.position.plus(impulse.times(1 / rbj.mass));
                    }
                }
            }

            // Clear all constraints since they've been solved for.
            this.#contact_constraints.clear();

            // De-couple our simulation time from our frame rate.
            this.#t += Math.sign(frame_time) * this.#dt;
            this.#time_accumulator -= Math.sign(frame_time) * this.#dt;
            this.#steps_taken++;
        }
    }

    // Abstract method that gets implemented in the derived scene. Gets
    // called once per frame and allows the developer to update non-physics
    // aspects of the scene (e.g. adding/deleting objects at runtime, 
    // triggering specific events, etc.).
    update(context, program_state) 
    {
        throw "IMPLEMENT UPDATE!";
    }

    // TODO: Maybe make this abstract function, and/or provide some base
    // UI functionality + allow each scene to have specialized user input.
    make_control_panel() 
    {
        // make_control_panel(): Create the buttons for interacting with simulation time.
        this.key_triggered_button("Speed up time", ["Shift", "T"], () => this.#time_scale *= 5);
        this.key_triggered_button("Slow down time", ["t"], () => this.#time_scale /= 5);
        this.key_triggered_button("Swap Physics Demo Level", ["s"], () => 
            {
                this.#swap_demo = true;
                if (this.physics_demo_level == 6)
                {
                    this.physics_demo_level = 1;
                }
                else
                {
                    this.physics_demo_level += 1;
                }
            }
        )
        this.new_line();
        this.live_string(box => {
            box.textContent = "Time scale: " + this.#time_scale
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = "Fixed simulation time step size: " + this.#dt
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = this.#steps_taken + " timesteps were taken so far."
        });
    }

    // Try to add a GameObject with a valid Rigidbody to the physics simulation.
    add_rigidbody(game_object)
    {
        if (game_object.has_rigidbody_component())
        {
            this.#cached_rigidbodies_to_add.push(game_object);
            if (game_object.has_collider_component())
            {
                this.#cached_colliders_to_add.push(game_object);
            }
        }
        else
        {
            console.log("WARNING: GameObject " + "\"" + game_object.get_name() + "\" does not have an attached RigidBody component.");
        }
    }

    // Try to remove a rigidbody, via its parent GameObject name, from the physics simulation.
    remove_rigidbody(name)
    {
        if (this.#game_objects.has(name))
        {
            let go = this.#game_objects.get(name);
            if (go.has_rigidbody_component() && go.has_collider_component())
            {
                this.#cached_rigidbodies_to_remove.push(this.#game_objects.get(name));
            }
            else
            {
                const s = "WARNING: Attempt to remove GameObject " + "\"" + name + "\"" +
                          "from the PhysicsSim object as a RigidBody failed; GameObject is " + 
                          "missing a Rigidbody and/or Collider component."
                console.log(s);
            }
        }
        else
        {
            console.log("WARNING: No GameObject " + "\"" + name + "\" exists in the PhysicsSim object.");
        }
    }

    // Try to add a GameObject with a valid Collider component ONLY to the physics simulation
    // (won't add GameObjects with both Rigidbody and collider components).
    add_collider(game_object)
    {
        if (game_object.has_collider_component() && !game_object.has_rigidbody_component())
        {
            this.#cached_colliders_to_add.push(game_object);
        }
        else if (!game_object.has_collider_component())
        {
            console.log("WARNING: GameObject " + "\"" + game_object.name + "\" does not have an attached Collider component.");
        }
        else if (game_object.has_collider_component() && game_object.has_rigidbody_component())
        {
            const s = "WARNING: Cannot add GameObject " +
                      "\"" + game_object.name + "\"" + 
                      "\" as a pure collider to the physics scene because " +
                      "it has an attached RigidBody component. " +
                      "Remove the Rigidbody component from this GameObject in order " +
                      "to add it as a Collider to the PhysicsSim object.";
            console.log(s);
        }
    }

    // Try to remove a collider, via its parent GameObject name, from the physics simulation.
    remove_collider(name)
    {
        if (this.#game_objects.has(name))
        {
            let go = this.#game_objects.get(name);
            if (!go.has_rigidbody_component() && go.has_collider_component())
            {
                this.#cached_colliders_to_remove.push(this.#game_objects.get(name));
            }
            else
            {
                const s = "WARNING: Attempt to remove GameObject " + "\"" + name + "\"" +
                          "from the PhysicsSim object as a Collider failed; GameObject is " + 
                          "either missing a Collider component or also contains a Rigidbody component."
                console.log(s);
            }
        }
        else
        {
            console.log("WARNING: No GameObject with name " + "\"" + name + "\" exists in the PhysicsSim object.");
        }
    }

    display(context, program_state) 
    {
        if (program_state.animation_delta_time == 0 || this.#swap_demo)
        {
            this.#swap_demo = false;
            this.#game_objects.clear();
            this.#cached_rigidbodies_to_add.length = 0;
            this.#cached_rigidbodies_to_remove.length = 0;
            this.#cached_colliders_to_add.length = 0;
            this.#cached_colliders_to_remove.length = 0;
            this.#contact_constraints.clear();
            this.initialize(context, program_state);
        }

        if (program_state.animate)
        {
            this.fixed_update(program_state.animation_delta_time);
            this.update(context, program_state);
        }

        for (let go of this.#game_objects.values())
        {
            // Only display RigidBodies (Collider-only GameObjects are invisible).
            if (!go.has_rigidbody_component())
            {
                continue;
            }
            let model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.translation(go.position[0], go.position[1], go.position[2], go.position[3]));
            model_transform = model_transform.times(Mat4.scale(go.scale[0], go.scale[1], go.scale[2]));

            if (go.shape != null)
            {
                go.shape.draw(context, program_state, model_transform, go.material);
            }
        }
    }
}