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

                    /*let gjkResult = this.gjkCollision.is_colliding(rbi, rbj);
                    if (!gjkResult.areColliding)
                    {
                        continue;
                    }

                    // If we find a valid collision, transform the resultant simplex
                    // into a 3-simplex and pass it on to the EPA to find the minimum
                    // translation vector (MTV) for resolving said collision.
                    gjkResult.simplex.transform_into_3_simplex();
                    let epaResult = this.epa.solve(rbi, rbj, gjkResult.simplex);

                    if (epaResult == null)
                    {
                        continue;
                    }

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
                    contact.closingVelocityJ = rbj.velocity;*/

                    // Sphere-sphere collision
                    if ((rbi.type == "sphere" && rbj.type == "sphere") || (rbi.type == "sphere" && rbj.type == "cube") || (rbi.type == "cube" && rbj.type == "sphere"))
                    {
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

                        if (epaResult == null)
                        {
                            continue;
                        }

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
                        const key_array = [rbi.name, rbj.name];
                        this.contact_constraints.set(key_array, contact);
                    }
                    /*if (rbi.type == "sphere" && rbj.type == "sphere")
                    {
                        const penVec = rbj.position.minus(rbi.position);
                        if (penVec.to3().norm() >= rbi.size[0] + rbj.size[0])
                        {
                            continue;
                        }

                        let contact = new Contact();
                        // The contact normal always points from RB i to RB j (for sign consistency).
                        // Get the global positions of the deepest penetration points on each
                        // object.
                        contact.globalPositionI = rbi.position.plus(penVec);
                        contact.globalPositionJ = rbj.position.minus(penVec);
                        // Get the vectors pointing from the object center of mass to the point
                        // of deepest penetration in the object's local reference frame.
                        contact.localPositionI = penVec;
                        contact.localPositionJ = penVec.times(-1);

                        contact.normal = penVec.to3();
                        if (contact.normal.norm() != 0)
                        {
                            contact.normal = contact.normal.normalized();
                        }
                        contact.normal = contact.normal.to4(false);

                        const key_array = [rbi.name, rbj.name];
                        this.contact_constraints.set(key_array, contact);
                    }
                    else if (rbi.type == "sphere" && rbj.type == "cube")
                    {
                        // Get box closest point to sphere center by clamping.
                        let clstBoxPnt = vec4(0, 0, 0, 1);
                        clstBoxPnt[0] = Math.max(rbj.position[0] - rbj.size[0], Math.min(rbi.position[0], rbj.position[0] + rbj.size[0]));
                        clstBoxPnt[1] = Math.max(rbj.position[1] - rbj.size[1], Math.min(rbi.position[1], rbj.position[1] + rbj.size[1]));
                        clstBoxPnt[2] = Math.max(rbj.position[2] - rbj.size[2], Math.min(rbi.position[2], rbj.position[2] + rbj.size[2]));
                        // Check if the closest point we determined above is inside
                        // the sphere.
                        const distance = Math.sqrt((clstBoxPnt[0] - rbi.position[0])**2 + (clstBoxPnt[1] - rbi.position[1])**2 + (clstBoxPnt[2] - rbi.position[2])**2);
                        if (distance > rbi.size[0])
                        {
                            continue;
                        }

                        let contact = new Contact();
                        // Get the global positions of the deepest penetration points on each
                        // object.
                        contact.globalPositionI = rbi.position.plus(clstBoxPnt.to3().normalized().times(rbi.size[0]).to4(false));
                        contact.globalPositionJ = clstBoxPnt;
                        // Get the vectors pointing from the object center of mass to the point
                        // of deepest penetration in the object's local reference frame.
                        contact.localPositionI = clstBoxPnt.to3().normalized().times(rbi.size[0]).to4(true);
                        contact.localPositionJ = clstBoxPnt.minus(rbj.position);
                        contact.normal = contact.globalPositionJ.minus(contact.globalPositionI).to3();
                        if (contact.normal.norm() != 0)
                        {
                            contact.normal = contact.normal.normalized();
                        }
                        contact.normal = contact.normal.to4(false);

                        const key_array = [rbi.name, rbj.name];
                        this.contact_constraints.set(key_array, contact);
                    }
                    else if (rbi.type == "cube" && rbj.type == "sphere")
                    {
                        // Get box closest point to sphere center by clamping.
                        let clstBoxPnt = vec4(0, 0, 0, 1);
                        clstBoxPnt[0] = Math.max(rbi.position[0] - rbi.size[0], Math.min(rbj.position[0], rbi.position[0] + rbi.size[0]));
                        clstBoxPnt[1] = Math.max(rbi.position[1] - rbi.size[1], Math.min(rbj.position[1], rbi.position[1] + rbi.size[1]));
                        clstBoxPnt[2] = Math.max(rbi.position[2] - rbi.size[2], Math.min(rbj.position[2], rbi.position[2] + rbi.size[2]));
                        // Check if the closest point we determined above is inside
                        // the sphere.
                        const distance = Math.sqrt((clstBoxPnt[0] - rbj.position[0])**2 + (clstBoxPnt[1] - rbj.position[1])**2 + (clstBoxPnt[2] - rbj.position[2])**2);
                        if (distance > rbj.size[0])
                        {
                            continue;
                        }
                        
                        let contact = new Contact();
                        // Get the global positions of the deepest penetration points on each
                        // object.
                        contact.globalPositionI = clstBoxPnt;
                        contact.globalPositionJ = rbj.position.plus(clstBoxPnt.to3().normalized().times(rbj.size[0]).to4(false));
                        // Get the vectors pointing from the object center of mass to the point
                        // of deepest penetration in the object's local reference frame.
                        contact.localPositionI = clstBoxPnt.minus(rbi.position);
                        contact.localPositionJ = clstBoxPnt.to3().normalized().times(rbj.size[0]).to4(true);
                        contact.normal = contact.globalPositionI.minus(contact.globalPositionJ).to3();
                        if (contact.normal.norm() != 0)
                        {
                            contact.normal = contact.normal.normalized();
                        }
                        contact.normal = contact.normal.to4(false);

                        const key_array = [rbi.name, rbj.name];
                        this.contact_constraints.set(key_array, contact);
                    }*/
                    else if (rbi.type == "cube" && rbj.type == "cube")
                    {
                        // Check if the two boxes overlap.
                        if 
                        (
                            !(rbi.position[0] - rbi.size[0] <= rbj.position[0] + rbj.size[0] &&
                            rbi.position[0] + rbi.size[0] >= rbj.position[0] - rbj.size[0] &&
                            rbi.position[1] - rbi.size[1] <= rbj.position[1] + rbj.size[1] &&
                            rbi.position[1] + rbi.size[1] >= rbj.position[1] - rbj.size[1] &&
                            rbi.position[2] - rbi.size[2] <= rbj.position[2] + rbj.size[2] &&
                            rbi.position[2] + rbi.size[2] >= rbj.position[2] - rbj.size[2])
                        )
                        {
                            continue;
                        }

                        let contact = new Contact();

                        // Get the point on box I that is closest to box J.
                        let pntOnIClstToJ = vec4(0, 0, 0, 1);
                        pntOnIClstToJ[0] = Math.max(rbi.position[0] - rbi.size[0], Math.min(rbj.position[0], rbi.position[0] + rbi.size[0]));
                        pntOnIClstToJ[1] = Math.max(rbi.position[1] - rbi.size[1], Math.min(rbj.position[1], rbi.position[1] + rbi.size[1]));
                        pntOnIClstToJ[2] = Math.max(rbi.position[2] - rbi.size[2], Math.min(rbj.position[2], rbi.position[2] + rbi.size[2]));
                        // Get the point on box J that is closest to box I.
                        let pntOnJClstToI = vec4(0, 0, 0, 1);
                        pntOnJClstToI[0] = Math.max(rbj.position[0] - rbj.size[0], Math.min(rbi.position[0], rbj.position[0] + rbj.size[0]));
                        pntOnJClstToI[1] = Math.max(rbj.position[1] - rbj.size[1], Math.min(rbi.position[1], rbj.position[1] + rbj.size[1]));
                        pntOnJClstToI[2] = Math.max(rbj.position[2] - rbj.size[2], Math.min(rbi.position[2], rbj.position[2] + rbj.size[2]));

                        contact.globalPositionI = pntOnIClstToJ;
                        contact.globalPositionJ = pntOnJClstToI;

                        contact.localPositionI = pntOnIClstToJ.minus(rbi.position);
                        contact.localPositionJ = pntOnJClstToI.minus(rbj.position);

                        //contact.normal = rbi.velocity.minus(rbj.velocity);
                        
                        let norms = [];
                        let dir = rbj.position.minus(rbi.position);

                        // Clamp on x-axis, check if dir penetrates the two AABB planes perpendicular to the x-axis.
                        if (dir[0] != 0)
                        {   
                            const alpha = Math.abs(rbi.size[0] / dir[0]);
                            if (Math.abs(alpha * dir[1]) <= rbi.size[1] && Math.abs(alpha * dir[2]) <= rbi.size[2])
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
                            const alpha = Math.abs(rbi.size[1] / dir[1]);
                            if (Math.abs(alpha * dir[0]) <= rbi.size[0] && Math.abs(alpha * dir[2]) <= rbi.size[2])
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
                            const alpha = Math.abs(rbi.size[2] / dir[2]);
                            if (Math.abs(alpha * dir[0]) <= rbi.size[0] && Math.abs(alpha * dir[1]) <= rbi.size[1])
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

                        const key_array = [rbi.name, rbj.name];
                        this.contact_constraints.set(key_array, contact);
                    }
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
                    let restitution = 0;
                    if (rbi.type == "cube" && rbj.type == "cube")
                    {
                        restitution = 3;
                    }
                    else
                    {
                        restitution = 2.99;
                    }

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
                    // By convention the normal points away from rbi, so negate

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

            // Step 5: Clamp velocities so that they don't grow too large.
            for (const key of this.rigidbodies.keys())
            {
                let rb = this.rigidbodies.get(key);
                if (!rb.is_kinematic)
                {
                    if (rb.velocity.norm() > 10)
                    {
                        rb.velocity = rb.velocity.normalized().times(10);
                    }
                }
            }

            // Step 6: Integrate velocities to obtain new object positions.
            for (const key of this.rigidbodies.keys())
            {
                let rb = this.rigidbodies.get(key);
                if (!rb.is_kinematic)
                {
                    rb.position = rb.position.plus(rb.velocity.times(this.dt));
                }
            }

            // Step 7: Apply position constraint to ensure that there is no object overlap.
            for (var i = 0; i < 3; ++i)
            {
                for (const [key, contact] of this.contact_constraints)
                {
                    var rbi = this.rigidbodies.get(key[0]);
                    var rbj = this.rigidbodies.get(key[1]);

                    const separation = -Math.abs(contact.globalPositionJ.minus(contact.globalPositionI).dot(contact.normal.times(-1)));

                    // Spheres
                    // Magic number by 0.01 seems to be a good amount
                    const steeringConstant = 0.001;
                    // Limit the amount of correction at once for stability
                    const maxCorrection = -10;
                    // Be tolerant of 1 pixel of overlap
                    const slop = 1;
                    // Cubes
                    // Magic number by 0.01 seems to be a good amount
                    //const steeringConstant = 0.001;
                    // Limit the amount of correction at once for stability
                    //const maxCorrection = -10;
                    // Be tolerant of 1 pixel of overlap
                    //const slop = 1;
                
                    // Clamp to avoid over-correction
                    // Remember that we are shooting for 0 overlap in the end
                    //const steeringForce = Math.clamp(steeringConstant * (separation + slop), maxCorrection, 0);
                    const steeringForce = Math.max(maxCorrection, Math.min(steeringConstant * (separation + slop), 0));
                    var impulse = contact.normal.times(-steeringForce / (1 / rbi.mass + 1 / rbj.mass));
                    
                    // Update positions of rbi & rbj directly by "pseudo-impulse", we still use the same impulse formula from above
                    if (!rbi.is_kinematic) 
                    {
                        rbi.position = rbi.position.minus(impulse.times(1 / rbi.mass));
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
            // add friction.

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