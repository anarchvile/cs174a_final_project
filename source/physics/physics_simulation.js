import {defs, tiny} from "../../include/common.js";
import {Contact} from "./contact.js"

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene, Matrix} = tiny;

// The PhysicsSim class handles all rigidbody physics simulation behavior, including
// applying forces, computing new positions/velocities as a result of applied forces,
// etc. Physics simulation is updated on a fixed timestep, separate from the animation
// framerate.
export class PhysicsSim extends Scene 
{
    constructor() 
    {
        super();
        Object.assign(this, {time_accumulator: 0, time_scale: 1, t: 0, dt: 1 / 20, steps_taken: 0});
        this.rigidbodies = new Map();
        this.forces = [];
        this.contact_constraints = new Map();
        this.end = false;
    }
    // TODO: Initialize(context, program_state). Add all objects to scene.
    initialize(context, program_state) 
    {
        throw "IMPLEMENT!";
    }

    fixed_update(frame_time) 
    {
        if (this.end)
        {
            return;
        }

        frame_time = this.time_scale * frame_time;
        
        // Limit the amount of time we will spend computing during this timestep if display lags:
        this.time_accumulator += Math.min(frame_time, 0.1);
        // Repeatedly step the simulation until we're caught up with this frame:
        while (Math.abs(this.time_accumulator) >= this.dt) 
        {
            // Single step of the simulation for all forces in the scene.
            for (var i = 0; i < this.forces.length; ++i)
            {
                // Remove forces whose duration has expired.
                if (!this.forces[i].indefinite && this.forces[i].duration <= 0)
                {
                    this.forces.splice(--i, 1);
                    continue;
                }
                // Each force keeps track of the rigid bodies it acts on.
                // Apply said force to each of these rigid bodies in order
                // to determine a new tentative velocity prior to contact
                // resolution.
                for (let body_name of this.forces[i].affected_bodies)
                {
                    var rb = this.rigidbodies.get(body_name);
                    // Don't apply any forces to kinematic objects.
                    if (rb.is_kinematic)
                    {
                        continue;
                    }
                    var acceleration = this.forces[i].force_vector.times(1 / rb.mass);
                    rb.velocity = rb.velocity.plus(acceleration.times(this.dt));
                    //rb.position = rb.position.plus(rb.velocity.times(this.dt));
                }

                if (this.forces[i].duration > 0)
                {
                    this.forces[i].duration -= this.dt;
                }
            }
            // Collision detection - for now we just use spheres and boxes as the only
            // primitive and naively check for overlapping regions via an
            // O(n^2) algorithm. If we detect any overlap, create a contact constraint
            // object for those two objects. TODO: later split this into broad-phase and
            // narrow-phase collision detection steps, use more general collision detection
            // algorithms that work on a variety of complex shapes (not just boxes and spheres).
            for (var i = 0; i < this.rigidbodies.size; ++i)
            {
                var rbi = this.rigidbodies.get(Array.from(this.rigidbodies.keys())[i]);
                for (var j = i + 1; j < this.rigidbodies.size; ++j)
                {
                    var rbj = this.rigidbodies.get(Array.from(this.rigidbodies.keys())[j]);
                    // Sphere-sphere collision
                    if (rbi.type == "sphere" && rbj.type == "sphere")
                    {
                        var deltaPos = rbj.position.minus(rbi.position);
                        var centerDistanceSq = deltaPos.dot(deltaPos);
                        var combinedRadiiSq = (rbi.size + rbj.size)**2;
                        // Skip if the two objects don't intersect/collide.
                        if (centerDistanceSq > combinedRadiiSq)
                        {
                            continue;
                        }
                        // If the two objects overlap, create a new Contact constraint object
                        // that stores collision information that we'll use to resolve necessary
                        // collision behavior later (by directly manipulating the object velocities
                        // via a Sequential Impulse iteration, as will be seen later).
                        var contact = new Contact();
                        // The contact normal always points from RB i to RB j (for sign consistency).
                        contact.normal = deltaPos.times(1 / Math.sqrt(centerDistanceSq));
                        // Get the global positions of the deepest penetration points on each
                        // object.
                        contact.globalPositionI = rbi.position.plus(contact.normal.times(rbi.size));
                        contact.globalPositionJ = rbj.position.plus(contact.normal.times(-rbj.size));
                        // Get the vectors pointing from the object center of mass to the point
                        // of deepest penetration in the object's local reference frame.
                        contact.localPositionI = contact.normal.times(rbi.size);
                        contact.localPositionJ = contact.normal.times(-rbj.size);

                        const key_array = [rbi.name, rbj.name];
                        this.contact_constraints.set(key_array, contact);
                    }
                    else
                    {
                        if (rbi.type == "sphere" && rbj.type == "cube")
                        {
                            // Get box closest point to sphere center by clamping.
                            var clstBoxPnt = vec4(0, 0, 0, 1);
                            clstBoxPnt[0] = Math.max(rbj.position[0] - rbj.size / 2, Math.min(rbi.position[0], rbj.position[0] + rbj.size / 2));
                            clstBoxPnt[1] = Math.max(rbj.position[1] - rbj.size / 2, Math.min(rbi.position[1], rbj.position[1] + rbj.size / 2));
                            clstBoxPnt[2] = Math.max(rbj.position[2] - rbj.size / 2, Math.min(rbi.position[2], rbj.position[2] + rbj.size / 2));
                            // Check if the closest point we determined above is inside
                            // the sphere.
                            var distance = Math.sqrt((clstBoxPnt[0] - rbi.position[0])**2 + (clstBoxPnt[1] - rbi.position[1])**2 + (clstBoxPnt[2] - rbi.position[2])**2);
                            console.log(clstBoxPnt);
                            if (distance > rbi.size + rbj.size / 2)
                            {
                                continue;
                            }
                            // If the closest point on the box is inside the sphere, create a new
                            // Contact constraint object.
                            var contact = new Contact();
                            // The contact normal always points from RB i to RB j (for sign consistency),
                            // and in this case will point from the sphere's center towards the closest
                            // penetrating point on the cube.
                            contact.normal = clstBoxPnt.minus(rbi.position).times(1 / distance);
                            // Get the global positions of the deepest penetration points on each
                            // object.
                            contact.globalPositionI = rbi.position.plus(contact.normal.times(rbi.size));
                            contact.globalPositionJ = clstBoxPnt;
                            // Get the vectors pointing from the object center of mass to the point
                            // of deepest penetration in the object's local reference frame.
                            contact.localPositionI = contact.normal.times(rbi.size);
                            contact.localPositionJ = clstBoxPnt.minus(rbj.position);

                            const key_array = [rbi.name, rbj.name];
                            this.contact_constraints.set(key_array, contact);
                        }
                        else if (rbi.type == "cube" && rbj.type == "sphere")
                        {
                            console.log("CASE 2");

                            // Get box closest point to sphere center by clamping.
                            var clstBoxPnt = vec4(0, 0, 0, 1);
                            clstBoxPnt[0] = Math.max(rbi.position[0] - rbi.size / 2, Math.min(rbj.position[0], rbi.position[0] + rbi.size / 2));
                            clstBoxPnt[1] = Math.max(rbi.position[1] - rbi.size / 2, Math.min(rbj.position[1], rbi.position[1] + rbi.size / 2));
                            clstBoxPnt[2] = Math.max(rbi.position[2] - rbi.size / 2, Math.min(rbj.position[2], rbi.position[2] + rbi.size / 2));

                            // Check if the closest point we determined above is inside
                            // the sphere.
                            const distance = Math.sqrt((clstBoxPnt[0] - rbj.position[0])**2 + (clstBoxPnt[1] - rbj.position[1])**2 + (clstBoxPnt[2] - rbj.position[2])**2);
                            if (distance > rbj.size)
                            {
                                continue;
                            }
                            // If the closest point on the box is inside the sphere, create a new
                            // Contact constraint object.
                            var contact = new Contact();
                            // The contact normal always points from RB i to RB j (for sign consistency),
                            // and in this case will point from the sphere's center towards the closest
                            // penetrating point on the cube.
                            contact.normal = rbj.position.minus(clstBoxPnt).times(1 / distance);
                            // Get the global positions of the deepest penetration points on each
                            // object.
                            contact.globalPositionI = clstBoxPnt;
                            contact.globalPositionJ = rbj.position.plus(contact.normal.times(rbj.size));
                            // Get the vectors pointing from the object center of mass to the point
                            // of deepest penetration in the object's local reference frame.
                            contact.localPositionI = clstBoxPnt.minus(rbi.position);
                            contact.localPositionJ = contact.normal.times(rbj.size);

                            const key_array = [rbi.name, rbj.name];
                            this.contact_constraints.set(key_array, contact);
                        }
                    }
                }
            }

            // Constraint resolution - using the Sequential Impulse method, iterate through
            // all contact constraints and resolve them (i.e. apply appropriate velocities
            // to objects so that they push away from one another AND offset their positions
            // to resolve any penetrations).
            for (const [key, value] of this.contact_constraints)
            {
                var rbi = this.rigidbodies.get(key[0]);
                var rbj = this.rigidbodies.get(key[1]);

                var beta = 0.1;
                var Cr = 1; // Restitution.
                // b = Total bias term = (Baumgarte Stabilization) + (Restitution).
                var b = (-beta / this.dt * value.globalPositionJ.minus(value.globalPositionI).dot(value.normal.times(-1))) + (Cr * (rbi.velocity.times(-1).plus(rbj.velocity).dot(value.normal))); // Restitution.

                var V = Matrix.of
                (
                    [rbi.velocity[0]], [rbi.velocity[1]], [rbi.velocity[2]], [0], [0], [0], [rbj.velocity[0]], [rbj.velocity[1]], [rbj.velocity[2]], [0], [0], [0]
                ); // Concactenated velocity vector, 12x1.
                
                var n = value.normal.to3();
                var rixn = value.localPositionI.to3().times(-1).cross(n);
                var rjxn = value.localPositionJ.to3().cross(n);
                var J = Matrix.of
                (
                    [n.times(-1)[0], n.times(-1)[1], n.times(-1)[2], rixn[0], rixn[1], rixn[2], n[0], n[1], n[2], rjxn[0], rjxn[1], rjxn[2]]
                ); // Jacobian matrix, 1x12.
                var J_T = Matrix.of
                (
                    [n.times(-1)[0]], [n.times(-1)[1]], [n.times(-1)[2]], [rixn[0]], [rixn[1]], [rixn[2]], [n[0]], [n[1]], [n[2]], [rjxn[0]], [rjxn[1]], [rjxn[2]]
                );

                var M_inv = Matrix.of
                (
                    [1 / rbi.mass, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1 / rbi.mass, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1 / rbi.mass, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 1 / rbj.mass, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 1 / rbj.mass, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 1 / rbj.mass, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                ); // Inverse mass matrix, 12x12. TODO: More general inverse computation

                var numerator = -1 * (J.times(V)[0][0] + b);
                var denominator = J.times(M_inv).times(J_T);
                var lambda_tentative = numerator / denominator; // Tentative Lagrangian Multiplier.

                var deltaV = M_inv.times(J_T).times(lambda_tentative);
                V = V.plus(deltaV);

                // TODO: FIX THIS!!!
                if (!this.rigidbodies.get(key[0]).is_kinematic)
                {
                    this.rigidbodies.get(key[0]).velocity = vec4(V[0][0], V[1][0], V[2][0], 0);
                }
                if (!this.rigidbodies.get(key[1]).is_kinematic)
                {
                    this.rigidbodies.get(key[1]).velocity = vec4(V[6][0], V[7][0], V[8][0], 0);
                }
            }
            
            // Update all rigidbody positions after the constraints have been solved for.
            for (const [key, value] of this.rigidbodies)
            {
                if (this.rigidbodies.get(key).is_kinematic)
                {
                    continue;
                }
                this.rigidbodies.get(key).position = this.rigidbodies.get(key).position.plus(this.rigidbodies.get(key).velocity.times(this.dt));
            }

            // Clear all constraints since they've been solved-for.
            this.contact_constraints.clear();

            // TODO: Maybe expose another method for applying forces here
            // that gets implemented in the derived scenes (maybe for handling
            // user input that affects objects, adding timed events that apply
            // forces to some objects, etc.).

            // De-couple our simulation time from our frame rate.
            this.t += Math.sign(frame_time) * this.dt;
            this.time_accumulator -= Math.sign(frame_time) * this.dt;
            this.steps_taken++;
        }

        // Store an interpolation factor for how close our frame fell in between
        // the two latest simulation time steps, so we can correctly blend the
        // two latest states and display the result.
        let alpha = this.time_accumulator / this.dt;
        //for (let b of this.bodies) b.blend_state(alpha);
    }

    // TODO: Maybe make this abstract function, and/or provide some base
    // UI functionality + allow each scene to have specialized user input.
    make_control_panel() 
    {
        // make_control_panel(): Create the buttons for interacting with simulation time.
        this.key_triggered_button("Speed up time", ["Shift", "T"], () => this.time_scale *= 5);
        this.key_triggered_button("Slow down time", ["t"], () => this.time_scale /= 5);
        this.new_line();
        this.live_string(box => {
            box.textContent = "Time scale: " + this.time_scale
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = "Fixed simulation time step size: " + this.dt
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = this.steps_taken + " timesteps were taken so far."
        });
    }

    display(context, program_state) 
    {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-2, -7, -65));
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100);
        program_state.lights = [new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000)];

        if (program_state.animation_delta_time == 0)
        {
            this.initialize(context, program_state);
        }

        if (program_state.animate)
        {
            this.fixed_update(program_state.animation_delta_time);
        }

        for (let b of this.rigidbodies.values())
        {
            let model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.translation(b.position[0], b.position[1], b.position[2], b.position[3]));
            model_transform = model_transform.times(Mat4.scale(b.size, b.size, b.size));
            b.shape.draw(context, program_state, model_transform, b.material);
        }
    }
}