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
        this.test_scene = 5; // Switch from 1 to 4 for different test cases.
        this.flag = false;
        this.bullet_idx = 0;
        this.ground;

        this.rigidbodies = [];
    }

    initialize(context, program_state)
    {
        if (this.test_scene == 1)
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
        else if (this.test_scene == 2)
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
        else if (this.test_scene == 3)
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
        else if (this.test_scene == 4)
        {
            // Test Scene 4 - Complete scene with AABB and Spheres bouncing around in an enclosed box, with frictional effects as well.
            let go1 = new GameObject("Cube1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(0, 12.5, 0, 1), vec3(0, 0, 0), vec3(1, 2, 1));
            go1.add_rigidbody_component();
            go1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go1.get_rigidbody_component().add_force("Force2", vec4(0.3, 0.7, 0, 0), false, 3);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);
            let go2 = new GameObject("Cube2", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(2, 2, 0, 1), vec3(0, 0, 0), vec3(2, 1, 3));
            go2.add_rigidbody_component();
            go2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go2.get_rigidbody_component().add_force("Force2", vec4(0, 0.3, 0.7, 0), false, 6);
            go2.add_collider_component(collider_types.AABB, go2.scale);
            this.add_rigidbody(go2);
            let go3 = new GameObject("Sphere1", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(0, 17.5, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go3.add_rigidbody_component();
            go3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go3.get_rigidbody_component().add_force("Force2", vec4(0.5, 0, 0, 0), false, 3);
            go3.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go3);
            let go4 = new GameObject("Sphere2", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(3, 10, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go4.add_rigidbody_component();
            go4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go4.get_rigidbody_component().add_force("Force2", vec4(-0.7, 0, -1, 0), false, 5);
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
            go11.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go11.get_rigidbody_component().add_force("Force2", vec4(0, 0, -1, 0), false, 7);
            go11.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go11);
            let go12 = new GameObject("Sphere4", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), vec4(0, 17.5, 5, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go12.add_rigidbody_component();
            go12.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true, 5);
            go12.get_rigidbody_component().add_force("Force2", vec4(0.8, 0, -0.5, 0), false, 6);
            go12.add_collider_component(collider_types.Sphere, 1);
            this.add_rigidbody(go12);
            let go13 = new GameObject("Cube3", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(5, 6, 0, 1), vec3(0, 0, 0), vec3(3, 2, 1));
            go13.add_rigidbody_component();
            go13.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go13.get_rigidbody_component().add_force("Force2", vec4(-0.7, -0.2, -0.3, 0), false, 5);
            go13.add_collider_component(collider_types.AABB, go13.scale);
            this.add_rigidbody(go13);
            let go14 = new GameObject("Cube4", this.shapes.cube, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), vec4(-4, -5, 3, 1), vec3(0, 0, 0), vec3(0.4, 1.6, 1.4));
            go14.add_rigidbody_component();
            go14.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go14.get_rigidbody_component().add_force("Force2", vec4(0, 1, -1, 0), false, 7);
            go14.add_collider_component(collider_types.AABB, go14.scale);
            this.add_rigidbody(go14);
        }
        else if (this.test_scene == 5)
        {
            // Test Scene 5 - A stack of bricks to shoot bullets at.
            this.ground = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({color: color(1, 1, 0, 1)}), vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(40, 1, 20));
            this.ground.add_rigidbody_component(true);
            this.ground.add_collider_component(collider_types.AABB, this.ground.scale);
            this.add_rigidbody(this.ground);

            let go1 = new GameObject("Cube1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(0, 12.5, 11, 1), vec3(0, 0, 0), vec3(1, 2, 1));
            go1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            go1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);
            let go2 = new GameObject("Cube2", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(0, 2, 10, 1), vec3(0, 0, 0), vec3(2, 1, 3));
            go2.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            go2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go2.add_collider_component(collider_types.AABB, go2.scale);
            this.add_rigidbody(go2);
            let go3 = new GameObject("Cube3", this.shapes.cube, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(-0.3, 6, 10, 1), vec3(0, 0, 0), vec3(3, 2, 1));
            go3.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            go3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go3.add_collider_component(collider_types.AABB, go3.scale);
            this.add_rigidbody(go3);
            let go4 = new GameObject("Cube4", this.shapes.cube, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), vec4(0, -5, 10.1, 1), vec3(0, 0, 0), vec3(0.4, 1.6, 1.4));
            go4.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            go4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go4.add_collider_component(collider_types.AABB, go4.scale);
            this.add_rigidbody(go4);

            this.rigidbodies.push(go1);
            this.rigidbodies.push(go2);
            this.rigidbodies.push(go3);
            this.rigidbodies.push(go4);
        }
    }

    update(context, program_state)
    {
        // Do some update stuff...
        if (this.test_scene == 4 && program_state.animation_time >= 5000 && !this.flag)
        {
            //this.remove_rigidbody("Cube3");
            //this.remove_rigidbody("Sphere1");
            //this.remove_collider("Wall1"); // This should fail.
            //this.remove_rigidbody("Wall4"); // This should fail.
            //this.remove_collider("Wall4");
            this.flag = true;
        }
        else if (this.test_scene == 5)
        {
            // For example, spawn in boxes to shoot at every-so-often,
            // or remove objects that fall off the scene.
            for (let i = this.rigidbodies.length - 1; i >= 0; --i)
            {
                if (this.rigidbodies[i].position[1] < -100)
                {
                    this.remove_rigidbody(this.rigidbodies[i].name);
                    this.rigidbodies.splice(i, 1);
                }
            }
            console.log(this.rigidbodies.length);
        }
    }

    shoot(controls)
    {
        if (controls.fire)
        {
            const name = "Bullet" + this.bullet_idx.toString();
            const gravity = -0.5;
            const speed = 10;
            const radius = 1;

            // Spawn new "bullet."
            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 1, 1, 1) }), controls.gun_position, vec3(0, 0, 0), vec3(radius, radius, radius));
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.rigidbodies.push(go);

            this.bullet_idx += 1;
        }
        if (controls.shotgun)
        {
            const name1 = "Bullet1" + this.bullet_idx.toString();
            const name2 = "Bullet2" + this.bullet_idx.toString();
            const name3 = "Bullet3" + this.bullet_idx.toString();
            const gravity = -0.5;
            const speed = 10;
            const radius = 1;

            // Spawn new "bullet."
            let go1 = new GameObject(name1, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), controls.shotgun_position1, vec3(0, 0, 0), vec3(radius, radius, radius));
            go1.add_rigidbody_component();
            go1.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go1.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go1.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go1);

            let go2 = new GameObject(name2, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), controls.shotgun_position2, vec3(0, 0, 0), vec3(radius, radius, radius));
            go2.add_rigidbody_component();
            go2.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go2.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go2.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go2);

            let go3 = new GameObject(name3, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), controls.shotgun_position3, vec3(0, 0, 0), vec3(radius, radius, radius));
            go3.add_rigidbody_component();
            go3.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go3.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go3.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go3);

            this.rigidbodies.push(go1);
            this.rigidbodies.push(go2);
            this.rigidbodies.push(go3);

            this.bullet_idx += 1;
        }
        if (controls.cannon) {
            const name = "Cannon" + this.bullet_idx.toString();
            const gravity = -0.5;
            const speed = 10;
            const radius = 5;

            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), controls.gun_position, vec3(0, 0, 0), vec3(radius, radius, radius));
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.rigidbodies.push(go);

            this.bullet_idx += 1;
        }
        if (controls.low_grav) {
            const name = "Floater" + this.bullet_idx.toString();
            const gravity = -0.1;
            const speed = 5;
            const radius = 1;

            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), controls.gun_position, vec3(0, 0, 0), vec3(radius, radius, radius));
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.rigidbodies.push(go);

            this.bullet_idx += 1;
        }
    }

    display(context, program_state)
    {
        if (!context.scratchpad.controls) 
        {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-2, -7, -65));
        }

        this.shoot(context.scratchpad.controls);

        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 200);
        program_state.lights = [new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000)];

        super.display(context, program_state);
    }
}
