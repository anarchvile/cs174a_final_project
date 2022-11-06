import {defs, tiny} from "../../include/common.js";
import {PhysicsSim} from "../physics/physics_simulation.js"
import {Cube} from "../geometry/geometry.js"
import {RigidBody} from "../physics/rigidbody.js";
import {Force} from "../physics/force.js"

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export class Test_Scene extends PhysicsSim
{
    constructor() 
    {
        super();
        this.shapes = { 'cube': new Cube() };
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: color(1,0,0,1)}),
        };
    }

    initialize(context, program_state)
    {
        this.rigidbodies.set("Cube1", new RigidBody(this.shapes.cube, this.materials.plastic, "Cube1", Mat4.identity(), vec4(0, 0, 0, 0), 1));
        
        let body_names = [];
        for (let b of this.rigidbodies.values())
        {
            body_names.push(b.name);
        }

        this.forces.push(new Force(body_names, vec4(0, -0.1, 0, 0), true, -1));
    }
}
