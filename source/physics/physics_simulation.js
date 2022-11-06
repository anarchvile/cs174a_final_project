import {defs, tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

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
    }
    // TODO: Initialize(context, program_state). Add all objects to scene.
    initialize(context, program_state) 
    {
        throw "IMPLEMENT!";
    }

    fixed_update(frame_time) 
    {
        frame_time = this.time_scale * frame_time;

        // Limit the amount of time we will spend computing during this timestep if display lags:
        this.time_accumulator += Math.min(frame_time, 0.1);
        // Repeatedly step the simulation until we're caught up with this frame:
        while (Math.abs(this.time_accumulator) >= this.dt) 
        {
            // Single step of the simulation for all bodies:
            for (let f of this.forces)
            {
                if (f.indefinite)
                {
                    for (let body_name of f.affected_bodies)
                    {
                        let rb = this.rigidbodies.get(body_name);
                        let acceleration = f.force_vector.times(1 / rb.mass);
                        rb.velocity = rb.velocity.plus(acceleration.times(this.dt));
                        let dPos = rb.velocity.times(this.dt);
                        let T = Mat4.translation(dPos[0], dPos[1], dPos[2]);
                        rb.position = rb.position.times(T);
                    }
                }
                else
                {

                }
            }
            

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
            program_state.set_camera(Mat4.translation(5, 0, -30));
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
            b.shape.draw(context, program_state, b.position, b.material);
        }
    }
}