import {defs, tiny} from "../../include/common.js";
import {PhysicsSim} from "../physics/physics_simulation.js"
import {RigidBody} from "../physics/rigidbody.js";
import {Force} from "../physics/force.js"

// Pull these names into this module's scope for convenience:
const { Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene } = tiny;
export class TestScene extends PhysicsSim
{
    constructor() 
    {
        super();
        this.shapes = 
        {
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
        };
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: color(1,0,0,1)}),
        };
    }

    initialize(context, program_state)
    {
        // Test Scene 1.
        /*this.rigidbodies.set("Sphere1", new RigidBody(this.shapes.sphere, this.materials.plastic, "Sphere1", vec4(-20, 1, 0, 1), vec4(0, 0, 0, 0), 1, vec3(2, 2, 2), "sphere"));
        this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0,1,0,1) }), "Sphere2", vec4(0, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(2, 2, 2), "sphere", false));
        this.forces.push(new Force(["Sphere1"], vec4(0.2, 0, 0, 0), true));
        this.forces.push(new Force(["Sphere2"], vec4(-0.2, 0, 0, 0), true));*/

        // Test Scene 2.
        /*this.rigidbodies.set("Ground", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Ground", vec4(0, -21, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Wall1", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall1", vec4(-21, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        this.rigidbodies.set("Wall2", RigidBody.createCollider("Wall2", this.shapes.cube.arrays.position, vec4(0, 0, 20, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
        this.rigidbodies.set("Wall3", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall3", vec4(21, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        this.rigidbodies.set("Wall4", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall4", vec4(0, 0, -21, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
        this.rigidbodies.set("Ceiling", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Ceiling", vec4(0, 21, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Sphere1", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Sphere1", vec4(0, 17.5, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));
        this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Sphere2", vec4(3, 10, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));
        this.rigidbodies.set("Sphere3", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Sphere3", vec4(-4, 11, 2, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));
        this.rigidbodies.set("Sphere4", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Sphere4", vec4(0, 17.5, 5, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));

        this.forces.push(new Force(["Sphere1"], vec4(0, -0.5, 0, 0), false, 5));
        this.forces.push(new Force(["Sphere2"], vec4(0, -0.5, 0, 0), false, 5));
        this.forces.push(new Force(["Sphere3"], vec4(0, -0.5, 0, 0), false, 5));
        this.forces.push(new Force(["Sphere4"], vec4(0, -0.5, 0, 0), false, 5));

        this.forces.push(new Force(["Sphere1"], vec4(0.5, 0, 0, 0), false, 3));
        this.forces.push(new Force(["Sphere2"], vec4(-0.7, 0, -1, 0), false, 5));
        this.forces.push(new Force(["Sphere3"], vec4(0, 0, -1, 0), false, 7));
        this.forces.push(new Force(["Sphere4"], vec4(0.8, 0, -0.5, 0), false, 6));*/

        // Test Scene 3.
        this.rigidbodies.set("Ground", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Ground", vec4(0, -21, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Wall1", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall1", vec4(-21, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        this.rigidbodies.set("Wall2", RigidBody.createCollider("Wall2", this.shapes.cube.arrays.position, vec4(0, 0, 20, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
        this.rigidbodies.set("Wall3", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall3", vec4(21, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        this.rigidbodies.set("Wall4", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall4", vec4(0, 0, -21, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
        this.rigidbodies.set("Ceiling", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Ceiling", vec4(0, 21, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Cube1", new RigidBody(this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Cube1", vec4(0, 17.5, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "cube", false));
        this.rigidbodies.set("Cube2", new RigidBody(this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Cube2", vec4(0, 10, 0.1, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "cube", false));
        this.rigidbodies.set("Cube3", new RigidBody(this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Cube3", vec4(-0.1, 5, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "cube", false));
        this.rigidbodies.set("Cube4", new RigidBody(this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Cube4", vec4(0.1, 0, 0.1, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "cube", false));
        
        this.forces.push(new Force(["Cube1"], vec4(0, -0.5, 0, 0), true, 5));
        this.forces.push(new Force(["Cube2"], vec4(0, -0.5, 0, 0), true, 5));
        this.forces.push(new Force(["Cube3"], vec4(0, -0.5, 0, 0), true, 5));
        this.forces.push(new Force(["Cube4"], vec4(0, -0.5, 0, 0), true, 5));

        //this.forces.push(new Force(["Cube1"], vec4(0.5, 0, 0, 0), false, 3));
        //this.forces.push(new Force(["Cube2"], vec4(-0.7, 0, -1, 0), false, 5));
        //this.forces.push(new Force(["Cube3"], vec4(0, 0, -1, 0), false, 7));
        //this.forces.push(new Force(["Cube4"], vec4(0.8, 0, -0.5, 0), false, 6));
    }

    display(context, program_state)
    {
        if (!context.scratchpad.controls) 
        {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-2, -7, -65));
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 200);
        program_state.lights = [new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000)];

        super.display(context, program_state);
    }
}
