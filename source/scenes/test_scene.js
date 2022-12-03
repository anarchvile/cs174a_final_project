import {defs, tiny} from "../../include/common.js";
import {PhysicsSim} from "../physics/physics_simulation.js"
import {GameObject} from "../game/gameobject.js";
import {collider_types} from "../collision/collider.js";
import {Force} from "../physics/force.js";
const {vec3, vec4, color, Mat4, Light, Material} = tiny;

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
        // Switch this variable from 1 to 6 to get different physics demo levels.
        this.flag = false;
    }

    initialize(context, program_state)
    {
        if (this.physics_demo_level == 1)
        {
            // Test Scene 1 - Sphere-Sphere Collision in Free Space.
            let go1 = new GameObject("Sphere1", this.shapes.sphere, this.materials.plastic, vec4(-10, 0, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            go1.add_rigidbody_component();
            let f1 = new Force("Force1", vec4(0.2, 0, 0, 0), true);
            go1.get_rigidbody_component().forces.set(f1.name, f1);
            go1.add_collider_component(collider_types.Sphere, 2);
            this.add_rigidbody(go1);

            let go2 = new GameObject("Sphere2", this.shapes.sphere, this.materials.plastic.override({ color: color(0,1,0,1) }), vec4(10, 1, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            go2.add_rigidbody_component();
            let f2 = new Force("Force2", vec4(-0.2, 0, 0, 0), true);
            go2.get_rigidbody_component().forces.set(f2.name, f2);
            go2.add_collider_component(collider_types.Sphere, 2);
            this.add_rigidbody(go2);
        }
        else if (this.physics_demo_level == 2)
        {
            // Test Scene 2 - AABB-AABB Collision in Free Space.
            let go1 = new GameObject("Cube1", this.shapes.cube, this.materials.plastic, vec4(-10, 1, 0, 1), vec3(0, 0, 0), vec3(0.5, 2, 1));
            go1.add_rigidbody_component();
            let f1 = new Force("Force1", vec4(0.2, 0, 0, 0), true);
            go1.get_rigidbody_component().forces.set(f1.name, f1);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);

            let go2 = new GameObject("Cube2", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(10, 0, -0.5, 1), vec3(0, 0, 0), vec3(2.7, 3, 2));
            go2.add_rigidbody_component();
            let f2 = new Force("Force2", vec4(-0.2, 0, 0, 0), true);
            go2.get_rigidbody_component().forces.set(f2.name, f2);
            go2.add_collider_component(collider_types.AABB, go2.scale);
            this.add_rigidbody(go2);
        }
        else if (this.physics_demo_level == 3)
        {
            // Test Scene 3 - Friction (the average friction value between two rigidbodies is used for computation).
            let go1 = new GameObject("Cube1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(-19, -18, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 1.7, 0.5);
            go1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go1.get_rigidbody_component().add_force("Force2", vec4(0.5, 0, 0, 0), false, 3);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);

            let go2 = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go2.add_rigidbody_component(true);
            go2.add_collider_component(collider_types.AABB, go2.scale);
            this.add_rigidbody(go2);
            let go3 = new GameObject("Wall1", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(-21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go3.add_rigidbody_component(true);
            go3.add_collider_component(collider_types.AABB, go3.scale);
            this.add_rigidbody(go3);
            let go4 = new GameObject("Wall2", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 0, -21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go4.add_rigidbody_component(true);
            go4.add_collider_component(collider_types.AABB, go4.scale);
            this.add_rigidbody(go4);
            let go5 = new GameObject("Wall3", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go5.add_rigidbody_component(true);
            go5.add_collider_component(collider_types.AABB, go5.scale);
            this.add_rigidbody(go5);
            // Note that go9 is a collider-only gameobject (no rigidbody component)!
            let go6 = new GameObject("Wall4", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 0, 21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go6.add_collider_component(collider_types.AABB, go6.scale);
            this.add_collider(go6);
            let go7 = new GameObject("Ceiling", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go7.add_rigidbody_component(true);
            go7.add_collider_component(collider_types.AABB, go7.scale);
            this.add_rigidbody(go7);
        }
        else if (this.physics_demo_level == 4)
        {
            // Test Scene 4 - Complete scene with AABB and Spheres bouncing around in an enclosed box, with frictional effects as well.
            let go1 = new GameObject("Cube1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(0, 12.5, 0, 1), vec3(0, 0, 0), vec3(1, 2, 1));
            go1.add_rigidbody_component();
            //go1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go1.get_rigidbody_component().add_force("Force2", vec4(0.3, 0.7, 0, 0), false, 3);
            go1.get_rigidbody_component().restitution = 1.775;
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);
            let go2 = new GameObject("Cube2", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(2, 2, 0, 1), vec3(0, 0, 0), vec3(2, 1, 3));
            go2.add_rigidbody_component();
            //go2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go2.get_rigidbody_component().add_force("Force2", vec4(0, 0.3, 0.7, 0), false, 6);
            go2.get_rigidbody_component().restitution = 1.775;
            go2.add_collider_component(collider_types.AABB, go2.scale);
            this.add_rigidbody(go2);
            let go3 = new GameObject("Sphere1", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(0, 17.5, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go3.add_rigidbody_component();
            //go3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go3.get_rigidbody_component().add_force("Force2", vec4(0.5, 0, 0, 0), false, 3);
            go3.get_rigidbody_component().restitution = 1.775;
            go3.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go3);
            let go4 = new GameObject("Sphere2", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(3, 10, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go4.add_rigidbody_component();
            //go4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go4.get_rigidbody_component().add_force("Force2", vec4(-0.7, 0, -1, 0), false, 5);
            go4.get_rigidbody_component().restitution = 1.775;
            go4.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go4);

            let go5 = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go5.add_rigidbody_component(true);
            go5.add_collider_component(collider_types.AABB, go5.scale);
            this.add_rigidbody(go5);
            let go6 = new GameObject("Wall1", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(-21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go6.add_rigidbody_component(true);
            go6.add_collider_component(collider_types.AABB, go6.scale);
            this.add_rigidbody(go6);
            let go7 = new GameObject("Wall2", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 0, -21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go7.add_rigidbody_component(true);
            go7.add_collider_component(collider_types.AABB, go7.scale);
            this.add_rigidbody(go7);
            let go8 = new GameObject("Wall3", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go8.add_rigidbody_component(true);
            go8.add_collider_component(collider_types.AABB, go8.scale);
            this.add_rigidbody(go8);
            // Note that go9 is a collider-only gameobject (no rigidbody component)!
            let go9 = new GameObject("Wall4", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 0, 21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go9.add_collider_component(collider_types.AABB, go9.scale);
            this.add_collider(go9);
            let go10 = new GameObject("Ceiling", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, 21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go10.add_rigidbody_component(true);
            go10.add_collider_component(collider_types.AABB, go10.scale);
            this.add_rigidbody(go10);

            let go11 = new GameObject("Sphere3", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(-4, 11, 2, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go11.add_rigidbody_component();
            //go11.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go11.get_rigidbody_component().add_force("Force2", vec4(0, 0, -1, 0), false, 7);
            go11.get_rigidbody_component().restitution = 1.775;
            go11.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go11);
            let go12 = new GameObject("Sphere4", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), vec4(0, 17.5, 5, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go12.add_rigidbody_component();
            //go12.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go12.get_rigidbody_component().add_force("Force2", vec4(0.8, 0, -0.5, 0), false, 6);
            go12.get_rigidbody_component().restitution = 1.775;
            go12.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go12);
            let go13 = new GameObject("Cube3", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(5, 6, 0, 1), vec3(0, 0, 0), vec3(3, 2, 1));
            go13.add_rigidbody_component();
            //go13.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go13.get_rigidbody_component().add_force("Force2", vec4(-0.7, -0.2, -0.3, 0), false, 5);
            go13.get_rigidbody_component().restitution = 1.775;
            go13.add_collider_component(collider_types.AABB, go13.scale);
            this.add_rigidbody(go13);
            let go14 = new GameObject("Cube4", this.shapes.cube, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), vec4(-4, -5, 3, 1), vec3(0, 0, 0), vec3(0.4, 1.6, 1.4));
            go14.add_rigidbody_component();
            //go14.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go14.get_rigidbody_component().add_force("Force2", vec4(0, 1, -1, 0), false, 7);
            go14.get_rigidbody_component().restitution = 1.775;
            go14.add_collider_component(collider_types.AABB, go14.scale);
            this.add_rigidbody(go14);
        }
        else if (this.physics_demo_level == 5)
        {
            // Test Scene 5 - Stack of falling spheres.
            let go1 = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(50, 1, 50));
            go1.add_rigidbody_component(true);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);

            for (let i = 0; i < 10; ++i)
            {
                const name = "Sphere" + i.toString();
                let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(Math.random(), 3 * i, Math.random(), 1), vec3(0, 0, 0), vec3(1, 1, 1));
                go.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 1.1, 0.15);
                go.get_rigidbody_component().add_force("Gravity", vec4(0, -0.5, 0, 0), true);
                go.add_collider_component(collider_types.Sphere, go.scale[0]);
                this.add_rigidbody(go);
            }
        }
        else if (this.physics_demo_level == 6)
        {
            // Test Scene 5 - Stack of falling boxes.
            let go1 = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(50, 1, 50));
            go1.add_rigidbody_component(true);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);

            for (let i = 0; i < 10; ++i)
            {
                const name = "Box" + i.toString();
                const s = vec3(1 + 2 * Math.random(), 1 + 2 * Math.random(), 1 + 2 * Math.random());
                let go = new GameObject(name, this.shapes.cube, this.materials.plastic.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(Math.random(), 7 * i, Math.random(), 1), vec3(0, 0, 0), s);
                go.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0.95, 0.15);
                go.get_rigidbody_component().add_force("Gravity", vec4(0, -0.5, 0, 0), true);
                go.add_collider_component(collider_types.AABB, go.scale);
                this.add_rigidbody(go);
            }
        }
    }

    update(context, program_state)
    {
    }

    display(context, program_state)
    {
        if (!context.scratchpad.controls) 
        {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-2, 0, -80));
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 200);
        program_state.lights = [new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000)];

        super.display(context, program_state);
    }
}
