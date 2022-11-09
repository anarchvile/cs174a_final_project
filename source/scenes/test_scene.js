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
        //this.rigidbodies.set("Sphere1", new RigidBody(this.shapes.sphere, this.materials.plastic, "Sphere1", vec4(-20, 1, 0, 1), vec4(0, 0, 0, 0), 1, vec3(2, 2, 2), "sphere"));
        //this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0,1,0,1) }), "Sphere2", vec4(0, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(2, 2, 2), "sphere", false));
        //this.forces.push(new Force(["Sphere1"], vec4(0.2, 0, 0, 0), true));
        //this.forces.push(new Force(["Sphere2"], vec4(-0.2, 0, 0, 0), true));

        this.rigidbodies.set("Ground", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Ground", vec4(0, -21, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Wall1", new RigidBody(this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), "Wall1", vec4(-21, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        // Note that we can create "null" rigidbodies (essentially "invisible" rigibodies that don't get rendered to screen,
        // but still function like regular rigidbodies).
        this.rigidbodies.set("Wall2", new RigidBody(null, this.materials.plastic.override({color: color(1, 1, 0, 0.1)}), "Wall2", vec4(0, 0, 20, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
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
        this.forces.push(new Force(["Sphere4"], vec4(0.8, 0, -0.5, 0), false, 6));

        //this.forces.push(new Force(["Ground"], vec4(0, 0.2, 0, 0), true));
        
    }
}
