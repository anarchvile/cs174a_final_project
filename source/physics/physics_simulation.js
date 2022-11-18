import {defs, tiny} from "../../include/common.js";
import {Contact} from "./contact.js"
import { GJKCollision } from "./gjk_collision.js";
import { EPA } from "./epa.js";

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

        this.gjkCollision = new GJKCollision();
        this.epa = new EPA();
    }

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
            // Step 1: Integrate applied accelerations to get nominal
            // object velocities.
            // Single step of the simulation for all forces in the scene.
            for (var i = 0; i < this.forces.length; ++i)
            {
                // Remove forces whose duration has expired.
                if (!this.forces[i].indefinite && this.forces[i].duration <= 0)
                {
                    this.forces.splice(i--, 1);
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
                }

                if (this.forces[i].duration > 0)
                {
                    this.forces[i].duration -= this.dt;
                }
            }

            // Step 2: Collision detection - for now we just use spheres and boxes as the only
            // primitive and naively check for overlapping regions via an
            // O(n^2) algorithm. If we detect any overlap, create a contact constraint
            // object for those two objects. TODO: later split this into broad-phase and
            // narrow-phase collision detection steps, use more general collision detection
            // algorithms that work on a variety of complex shapes (not just boxes and spheres).
            for (var i = 0; i < this.rigidbodies.size; ++i)
            {
                let rbi = this.rigidbodies.get(Array.from(this.rigidbodies.keys())[i]);
                for (var j = i + 1; j < this.rigidbodies.size; ++j)
                {
                    let rbj = this.rigidbodies.get(Array.from(this.rigidbodies.keys())[j]);

                    let gjkResult = this.gjkCollision.is_colliding(rbi, rbj);
                    if (!gjkResult.areColliding)
                    {
                        continue;
                    }

                    // If we find a valid collision, transform the resultant simplex
                    // into a 3-simplex and pass it on to the EPA to find the minimum
                    // translation vector (MTV) for resolving said collision.
                    gjkResult.simplex.transform_into_3_simplex();
                    let epaResult = this.epa.solve(rbi, rbj, gjkResult.simplex);

                    // Create a new contact constraint for the collision.
                    let contact = new Contact();
                    contact.normal = epaResult.axis.to4(false);
                    // Get the global positions of the deepest penetration points on each object.
                    contact.globalPositionI = rbi.position.plus(contact.normal.times(epaResult.dist));
                    contact.globalPositionJ = rbj.position.plus(contact.normal.times(-epaResult.dist));
                    // Get the vectors pointing from the object center of mass to the point
                    // of deepest penetration in the object's local reference frame.
                    contact.localPositionI = contact.normal.times(epaResult.dist);
                    contact.localPositionJ = contact.normal.times(-epaResult.dist);
                    // Get the object velocities at collision.
                    contact.closingVelocityI = rbi.velocity;
                    contact.closingVelocityJ = rbj.velocity;

                    const key_array = [rbi.name, rbj.name];
                    this.contact_constraints.set(key_array, contact);
                }
            }

            // Step 3: Warm start for velocity constraint.
            

            // Step 4: Solve velocity constraint.
            for (var i = 0; i < 15; ++i)
            {
                for (const [key, contact] of this.contact_constraints)
                {
                    var rbi = this.rigidbodies.get(key[0]);
                    var rbj = this.rigidbodies.get(key[1]);

                    // Need to recalculate relative velocity because the previous step could have changed
                    // the object velocity.
                    //const relativeVelocity = point.getRelativeVelocity();
                    const relativeVelocity = rbj.velocity.minus(rbi.velocity);

                    //const effectiveMass = bodyA.inverseMass + bodyB.inverseMass + 
                    //                        bodyA.inverseInertia * aToContactNormal * aToContactNormal +
                    //                        bodyB.inverseInertia * bToContactNormal * bToContactNormal;
                    const effectiveMass = 1 / rbi.mass + 1 / rbj.mass;

                    //const restitution = bodyA.restitution * bodyB.restitution;
                    // restitution = 1 -> completely inelastic. restitution = 3 -> fully elastic.
                    const restitution = 2.99;
                    
                    // Compute impulse in normal direction
                    const normalVelocityMagnitude = relativeVelocity.dot(contact.normal);
                    let impulseMagnitude = (-(1 + restitution) * normalVelocityMagnitude) / effectiveMass;
                    
                    // Clamping based in Erin Catto's GDC 2014 talk
                    // Accumulated impulse stored in the contact is always positive (dV > 0)
                    // But deltas can be negative
                    const newImpulse = Math.max(contact.normalImpulseSum + impulseMagnitude, 0);
                    impulseMagnitude = newImpulse - contact.normalImpulseSum;
                    contact.normalImpulseSum = newImpulse;
                    const impulseVector = contact.normal.times(impulseMagnitude);
                    // By convention the normal points away from A, so negate
                    //contact.bodyA.applyImpulse(point.point, impulseVector.negate());
                    //contact.bodyB.applyImpulse(point.point, impulse);
                    //console.log(rbi.velocity, rbj.velocity, impulseVector);

                    if (!rbi.is_kinematic)
                    {
                        rbi.velocity = rbi.velocity.minus(impulseVector.times(1 / rbi.mass));
                    }
                    if (!rbj.is_kinematic)
                    {
                        rbj.velocity = rbj.velocity.plus(impulseVector.times(1 / rbj.mass));
                    }
                }
            }

            // Step 5: Integrate velocities to obtain new object positions.
            for (const key of this.rigidbodies.keys())
            {
                if (!this.rigidbodies.get(key).is_kinematic)
                {
                    this.rigidbodies.get(key).position = this.rigidbodies.get(key).position.plus(this.rigidbodies.get(key).velocity.times(this.dt));
                }
            }

            // Step 6: Apply position constraint to ensure that there is no object overlap.
            for (var i = 0; i < 3; ++i)
            {
                for (const [key, contact] of this.contact_constraints)
                {
                    var rbi = this.rigidbodies.get(key[0]);
                    var rbj = this.rigidbodies.get(key[1]);

                    const separation = -Math.abs(contact.globalPositionJ.minus(contact.globalPositionI).dot(contact.normal.times(-1)));

                    // Magic number by 0.01 seems to be a good amount
                    const steeringConstant = 0.01;
                    // Limit the amount of correction at once for stability
                    const maxCorrection = -5;
                    // Be tolerant of 1 pixel of overlap
                    const slop = 1;
                
                    // Clamp to avoid over-correction
                    // Remember that we are shooting for 0 overlap in the end
                    //const steeringForce = Math.clamp(steeringConstant * (separation + slop), maxCorrection, 0);
                    const steeringForce = Math.max(maxCorrection, Math.min(steeringConstant * (separation + slop), 0));
                    var impulse = contact.normal.times(-steeringForce / (1 / rbi.mass + 1 / rbj.mass));
                    // NOTE! Update positions of bodyA & bodyB directly by "pseudo-impulse", we still use the same impulse formula from above
                    if (!rbi.is_kinematic) 
                    {
                        rbi.position = rbi.position.plus(impulse.times(-1).times(1 / rbi.mass));
                        //bodyA.xf.rotation -= point.aToContact.cross(impulse) * bodyA.inverseInertia;
                    }
                
                    if (!rbj.is_kinematic) 
                    {
                        rbj.position = rbj.position.plus(impulse.times(1 / rbj.mass));
                        //bodyB.xf.rotation += point.bToContact.cross(impulse) * bodyB.inverseInertia;
                    }
                }
            }

            // TODO: Find a way to both decrease slop and reduce resulting jittering behavior,
            // add rotational dynamics, cache previous contact contraints to use for "warm
            // starts," see if we can make the restitution parameter less sensitive overall, 
            // add friction, implement GJB and EPA algorithms.

            /*
            // Constraint resolution - using the Sequential Impulse method, iterate through
            // all contact constraints and resolve them (i.e. apply appropriate velocities
            // to objects so that they push away from one another AND offset their positions
            // to resolve any penetrations).
            var idx = 0;
            while (idx < 1)
            {
                for (const [key, value] of this.contact_constraints)
                {
                    var rbi = this.rigidbodies.get(key[0]);
                    var rbj = this.rigidbodies.get(key[1]);

                    var beta = 0.1; // Extra energy term.
                    var Cr = 0; // Restitution.
                    var d = value.depth; // Penetration depth.
                    // b = Total bias term = (Baumgarte Stabilization) + (Restitution).
                    var b = (-(beta / this.dt) * d) + (Cr * (value.closingVelocityI.times(-1).plus(value.closingVelocityJ).dot(value.normal)));

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

                    var lambda_corrective = -1 * (J.times(V)[0][0] + b) / J.times(M_inv).times(J_T)[0][0]; // Tentative Lagrangian Multiplier.
                    var lambda_old = value.normalImpulseSum;
                    value.normalImpulseSum += lambda_corrective;
                    if (value.normalImpulseSum < 0)
                    {
                        value.normalImpulseSum = 0;
                    }
                    var lambda = value.normalImpulseSum - lambda_old;

                    var deltaV = M_inv.times(J_T).times(lambda);
                    V = V.plus(deltaV);

                    if (!this.rigidbodies.get(key[0]).is_kinematic)
                    {
                        this.rigidbodies.get(key[0]).velocity = vec4(V[0][0], V[1][0], V[2][0], 0);
                    }
                    if (!this.rigidbodies.get(key[1]).is_kinematic)
                    {
                        this.rigidbodies.get(key[1]).velocity = vec4(V[6][0], V[7][0], V[8][0], 0);
                    }
                }

                idx += 1;
            }*/
            
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
            model_transform = model_transform.times(Mat4.scale(b.size[0], b.size[1], b.size[2]));

            if (b.shape != null)
            {
                b.shape.draw(context, program_state, model_transform, b.material);
            }
        }
    }
}