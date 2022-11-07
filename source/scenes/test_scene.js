import {defs, tiny} from "../../include/common.js";
import {PhysicsSim} from "../physics/physics_simulation.js"
import {RigidBody} from "../physics/rigidbody.js";
import {Force} from "../physics/force.js"

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export class Test_Scene extends PhysicsSim
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
        this.rigidbodies.set("Sphere1", new RigidBody(this.shapes.sphere, this.materials.plastic, "Sphere1", vec4(-20, 1, 0, 1), vec4(0, 0, 0, 0), 1, 2, "sphere"));
        this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0,1,0,1) }), "Sphere2", vec4(0, 0, 0, 1), vec4(0, 0, 0, 0), 1, 2, "sphere", false));
        this.forces.push(new Force(["Sphere1"], vec4(0.2, 0, 0, 0), true));
        this.forces.push(new Force(["Sphere2"], vec4(-0.2, 0, 0, 0), true));

        //this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), "Sphere2", vec4(0, 30, 0, 1), vec4(0, 0, 0, 0), 1, 2, "sphere", false));
        //this.rigidbodies.set("Ground", new RigidBody(this.shapes.sphere, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Ground", vec4(0, 0, 0, 1), vec4(0, 0, 0, 0), 1, 10, "sphere", true));
        //this.forces.push(new Force(["Sphere2"], vec4(0, -0.2, 0, 0), true));
        //this.forces.push(new Force(["Ground"], vec4(0, 0.2, 0, 0), true));
    }
}
