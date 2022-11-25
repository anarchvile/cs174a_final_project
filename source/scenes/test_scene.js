import {defs, tiny} from "../../include/common.js";
import {PhysicsSim} from "../physics/physics_simulation.js"
import {GameObject} from "../game/gameobject.js";
import {Force} from "../physics/force.js";

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
        /*let go1 = new GameObject("Sphere1", this.shapes.sphere, null, this.materials.plastic, vec4(-20, 1, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
        go1.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        let f1 = new Force("Force1", vec4(0.2, 0, 0, 0), true);
        go1.get_rigidbody_component().forces.set(f1.name, f1);
        go1.add_collider_component("Sphere", 2);
        this.add_rigidbody(go1);

        let go2 = new GameObject("Sphere2", this.shapes.sphere, null, this.materials.plastic.override({ color: color(0,1,0,1) }), vec4(0, 1, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
        go2.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        let f2 = new Force("Force2", vec4(-0.2, 0, 0, 0), true);
        go2.get_rigidbody_component().forces.set(f2.name, f2);
        go2.add_collider_component("Sphere", 2);
        this.add_rigidbody(go2);*/

        // Test Scene 2.
        /*let go1 = new GameObject("Cube1", this.shapes.cube, null, this.materials.plastic, vec4(-20, 0.5, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
        go1.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        let f1 = new Force("Force1", vec4(0.2, 0, 0, 0), true);
        go1.get_rigidbody_component().forces.set(f1.name, f1);
        go1.add_collider_component("AABB", vec3(2, 2, 2));
        this.add_rigidbody(go1);

        let go2 = new GameObject("Cube2", this.shapes.cube, null, this.materials.plastic.override({ color: color(0,1,0,1) }), vec4(0, 1, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
        go2.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        let f2 = new Force("Force2", vec4(-0.2, 0, 0, 0), true);
        go2.get_rigidbody_component().forces.set(f2.name, f2);
        go2.add_collider_component("AABB", vec3(2, 2, 2));
        this.add_rigidbody(go2);*/

        // Test Scene 3.
        let go11 = new GameObject("Cube1", this.shapes.cube, null, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(0, 12.5, 0, 1), vec3(0, 0, 0), vec3(1, 2, 1));
        go11.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go11.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), false, 5);
        go11.get_rigidbody_component().add_force("Force2", vec4(0.3, 0.7, 0, 0), false, 3);
        go11.add_collider_component("AABB", go11.scale);
        this.add_rigidbody(go11);
        let go14 = new GameObject("Cube4", this.shapes.cube, null, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(2, 2, 0, 1), vec3(0, 0, 0), vec3(2, 1, 3));
        go14.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go14.get_rigidbody_component().add_force("Force7", vec4(0, 0, 0, 0), false, 5);
        go14.get_rigidbody_component().add_force("Force8", vec4(0, 0.3, 0.7, 0), false, 6);
        go14.add_collider_component("AABB", go14.scale);
        this.add_rigidbody(go14);
        let go7 = new GameObject("Sphere1", this.shapes.sphere, null, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(0, 17.5, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
        go7.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go7.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), false, 5);
        go7.get_rigidbody_component().add_force("Force2", vec4(0.5, 0, 0, 0), false, 3);
        go7.add_collider_component("Sphere", 1);
        this.add_rigidbody(go7);
        let go8 = new GameObject("Sphere2", this.shapes.sphere, null, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(3, 10, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
        go8.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go8.get_rigidbody_component().add_force("Force3", vec4(0, -0.5, 0, 0), false, 5);
        go8.get_rigidbody_component().add_force("Force4", vec4(-0.7, 0, -1, 0), false, 5);
        go8.add_collider_component("Sphere", 1);
        this.add_rigidbody(go8);

        let go1 = new GameObject("Ground", this.shapes.cube, null, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
        go1.add_rigidbody_component(1, vec4(0, 0, 0, 0), true);
        go1.add_collider_component("AABB", vec3(20, 1, 20));
        this.add_rigidbody(go1);
        let go2 = new GameObject("Wall1", this.shapes.cube, null, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(-21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
        go2.add_rigidbody_component(1, vec4(0, 0, 0, 0), true);
        go2.add_collider_component("AABB", vec3(1, 20, 20));
        this.add_rigidbody(go2);
        let go3 = new GameObject("Wall2", this.shapes.cube, null, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 0, -21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
        go3.add_rigidbody_component(1, vec4(0, 0, 0, 0), true);
        go3.add_collider_component("AABB", vec3(20, 20, 1));
        this.add_rigidbody(go3);
        let go4 = new GameObject("Wall3", this.shapes.cube, null, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
        go4.add_rigidbody_component(1, vec4(0, 0, 0, 0), true);
        go4.add_collider_component("AABB", vec3(1, 20, 20));
        this.add_rigidbody(go4);
        // Note that go5 is a collider-only gameobject (no rigidbody component)!
        let go5 = new GameObject("Wall4", this.shapes.cube, null, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 0, 21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
        go5.add_collider_component("AABB", vec3(20, 20, 1));
        this.add_collider(go5);
        let go6 = new GameObject("Ceiling", this.shapes.cube, null, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
        go6.add_rigidbody_component(1, vec4(0, 0, 0, 0), true);
        go6.add_collider_component("AABB", vec3(20, 1, 20));
        this.add_rigidbody(go6);

        let go9 = new GameObject("Sphere3", this.shapes.sphere, null, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(-4, 11, 2, 1), vec3(0, 0, 0), vec3(1, 1, 1));
        go9.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go9.get_rigidbody_component().add_force("Force5", vec4(0, -0.5, 0, 0), false, 5);
        go9.get_rigidbody_component().add_force("Force6", vec4(0, 0, -1, 0), false, 7);
        go9.add_collider_component("Sphere", 1);
        this.add_rigidbody(go9);
        let go10 = new GameObject("Sphere4", this.shapes.sphere, null, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(0, 17.5, 5, 1), vec3(0, 0, 0), vec3(1, 1, 1));
        go10.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go10.get_rigidbody_component().add_force("Force7", vec4(0, -0.5, 0, 0), false, 5);
        go10.get_rigidbody_component().add_force("Force8", vec4(0.8, 0, -0.5, 0), false, 6);
        go10.add_collider_component("Sphere", 1);
        this.add_rigidbody(go10);
        let go12 = new GameObject("Cube2", this.shapes.cube, null, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(5, 6, 0, 1), vec3(0, 0, 0), vec3(3, 2, 1));
        go12.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go12.get_rigidbody_component().add_force("Force3", vec4(0, -0.5, 0, 0), false, 5);
        go12.get_rigidbody_component().add_force("Force4", vec4(-0.7, -0.2, -0.3, 0), false, 5);
        go12.add_collider_component("AABB", go12.scale);
        this.add_rigidbody(go12);
        let go13 = new GameObject("Cube3", this.shapes.cube, null, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), vec4(-4, -5, 3, 1), vec3(0, 0, 0), vec3(0.4, 1.6, 1.4));
        go13.add_rigidbody_component(1, vec4(0, 0, 0, 0), false);
        go13.get_rigidbody_component().add_force("Force5", vec4(0, -0.5, 0, 0), false, 5);
        go13.get_rigidbody_component().add_force("Force6", vec4(0, 1, -1, 0), false, 7);
        go13.add_collider_component("AABB", go13.scale);
        this.add_rigidbody(go13);
        
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
