import { defs, tiny } from "../../include/common.js";
import { PhysicsSim } from "../physics/physics_simulation.js"
import { GameObject } from "../game/gameobject.js";
import { collider_types } from "../collision/collider.js";
import { Force } from "../physics/force.js";
const { Vector, vec3, vec4, color, hex_color, Mat4, Light, Material, Texture } = tiny;

export class TestScene extends PhysicsSim {
    constructor() {
        super();
        this.shapes =
        {
            cube: new defs.Cube(),
            tower_cube: new defs.Cube(),
            ground_cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
            moon: new defs.Subdivision_Sphere(4),
            cone_tip: new defs.Closed_Cone(10, 10),
            skybox: new defs.Cube(),
        };
        this.shapes.moon.arrays.texture_coord = this.shapes.moon.arrays.texture_coord.map(x => x.times(2));
        this.shapes.ground_cube.arrays.texture_coord = this.shapes.ground_cube.arrays.texture_coord.map(x => x.times(6));
        this.shapes.tower_cube.arrays.texture_coord = this.shapes.tower_cube.arrays.texture_coord.map(y => {
            return y.times(2)
        });

        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                { ambient: .4, diffusivity: .6, color: color(1, 0, 0, 1) }),
            grass_ground: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: 0.1, specularity: 0.1, color: color(0, 154 / 255, 23 / 255, 1) }),
            sun: new Material(new defs.Phong_Shader(),
                { ambient: 1, specularity: 1, diffusivity: 1, color: hex_color("#ffffff") }),
            skybox: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: 1, color: hex_color("#0000ff") }),
            skybox_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/space_texture.jpg", "NEAREST")
            }),
            box1: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: 1, specularity: 0.5, color: hex_color("#7c0a02") }),
            box2: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: 1, specularity: 0.5, color: hex_color("#533c3e") }),
            next_level_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/level_complete.png", "NEAREST")
            }),
            game_over_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/game_over.png", "NEAREST")
            }),
            welcome_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/welcome.png", "NEAREST")
            }),
            moon_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/moon_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            asteroid_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("source/textures/asteroid.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            sky_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/sky_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            pre_asteroid_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/pre_asteroid.png", "LINEAR_MIPMAP_LINEAR")
            }),
            level_8_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/level_8.png", "LINEAR_MIPMAP_LINEAR")
            }),
            moon_fail_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/moon_fail.png", "LINEAR_MIPMAP_LINEAR")
            }),
            brick_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("source/textures/brick_texture.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
        }
        this.initial_camera_positions = {
            6: Mat4.identity(),
            7: Mat4.translation(60, -20, -40),
            8: Mat4.identity(),
            9: Mat4.rotation(Math.PI, 0, 1, 0).times(Mat4.translation(-50, -5, 5)),
            10: Mat4.identity(),
            11: Mat4.identity(),
            12: Mat4.identity(),
            13: Mat4.identity(),
        }

        this.required_level_objects = {
            6: [],
            7: ["Ball1", "Ball2", "Ball3", "Ball4", "Ball5"],
            8: [],
            9: ["tower1", "tower2", "tower3", "tower4", "tower5"],
            10: [],
            11: [],
            12: [],
            13: [],
        }


        this.test_scene = 6;
        this.flag = false;
        this.direction_flag = true;
        this.bullet_idx = 0;
        this.ground;
        this.reset_flag = false;
        this.initial_message_time = -1;
        this.start_time = -1;
        this.can_win_scene_11 = true;

        this.rigidbodies = [];
    }



    make_control_panel() {
        super.make_control_panel();
        this.new_line();

        this.key_triggered_button("Restart Level", ["r"], () => {
            this.reset_flag = true;
        })
    }



    initialize(context, program_state, time) {
        this.reset_flag = true;
        if (this.test_scene == 1) {
            // Test Scene 1 - Sphere-Sphere Collision in Free Space.
            let go1 = new GameObject("Sphere1", this.shapes.sphere, this.materials.plastic, vec4(-10, 0, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            go1.add_rigidbody_component();
            let f1 = new Force("Force1", vec4(0.2, 0, 0, 0), true);
            go1.get_rigidbody_component().forces.set(f1.name, f1);
            go1.add_collider_component(collider_types.Sphere, 2);
            this.add_rigidbody(go1);

            let go2 = new GameObject("Sphere2", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(10, 1, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            go2.add_rigidbody_component();
            let f2 = new Force("Force2", vec4(-0.2, 0, 0, 0), true);
            go2.get_rigidbody_component().forces.set(f2.name, f2);
            go2.add_collider_component(collider_types.Sphere, 2);
            this.add_rigidbody(go2);
        }
        else if (this.test_scene == 2) {
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
        else if (this.test_scene == 3) {
            // Test Scene 3 - Friction (the average friction value between two rigidbodies is used for computation).
            let go1 = new GameObject("Cube1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), vec4(-19, -18, 0, 1), vec3(0, 0, 0), vec3(1, 1, 1));
            go1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 1.7, 0.5);
            go1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            go1.get_rigidbody_component().add_force("Force2", vec4(0.5, 0, 0, 0), false, 3);
            go1.add_collider_component(collider_types.AABB, go1.scale);
            this.add_rigidbody(go1);

            let go2 = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go2.add_rigidbody_component(true);
            go2.add_collider_component(collider_types.AABB, go2.scale);
            this.add_rigidbody(go2);
            let go3 = new GameObject("Wall1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(-21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go3.add_rigidbody_component(true);
            go3.add_collider_component(collider_types.AABB, go3.scale);
            this.add_rigidbody(go3);
            let go4 = new GameObject("Wall2", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, 0, -21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go4.add_rigidbody_component(true);
            go4.add_collider_component(collider_types.AABB, go4.scale);
            this.add_rigidbody(go4);
            let go5 = new GameObject("Wall3", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go5.add_rigidbody_component(true);
            go5.add_collider_component(collider_types.AABB, go5.scale);
            this.add_rigidbody(go5);
            // Note that go9 is a collider-only gameobject (no rigidbody component)!
            let go6 = new GameObject("Wall4", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, 0, 21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go6.add_collider_component(collider_types.AABB, go6.scale);
            this.add_collider(go6);
            let go7 = new GameObject("Ceiling", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, 21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go7.add_rigidbody_component(true);
            go7.add_collider_component(collider_types.AABB, go7.scale);
            this.add_rigidbody(go7);
        }
        else if (this.test_scene == 4) {
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

            let go5 = new GameObject("Ground", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, -21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
            go5.add_rigidbody_component(true);
            go5.add_collider_component(collider_types.AABB, go5.scale);
            this.add_rigidbody(go5);
            let go6 = new GameObject("Wall1", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(-21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go6.add_rigidbody_component(true);
            go6.add_collider_component(collider_types.AABB, go6.scale);
            this.add_rigidbody(go6);
            let go7 = new GameObject("Wall2", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, 0, -21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go7.add_rigidbody_component(true);
            go7.add_collider_component(collider_types.AABB, go7.scale);
            this.add_rigidbody(go7);
            let go8 = new GameObject("Wall3", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(21, 0, 0, 1), vec3(0, 0, 0), vec3(1, 20, 20));
            go8.add_rigidbody_component(true);
            go8.add_collider_component(collider_types.AABB, go8.scale);
            this.add_rigidbody(go8);
            // Note that go9 is a collider-only gameobject (no rigidbody component)!
            let go9 = new GameObject("Wall4", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, 0, 21, 1), vec3(0, 0, 0), vec3(20, 20, 1));
            go9.add_collider_component(collider_types.AABB, go9.scale);
            this.add_collider(go9);
            let go10 = new GameObject("Ceiling", this.shapes.cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, 21, 0, 1), vec3(0, 0, 0), vec3(20, 1, 20));
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
        else if (this.test_scene == 5) {
            // Test Scene 5 - A stack of bricks to shoot bullets at.
            this.ground = new GameObject("Ground", this.shapes.ground_cube, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(40, 1, 20));
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
        } else if (this.test_scene == 6) { // TEST SCENE WITH BUILDINGS + MOVABLE DOORS

        } else if (this.test_scene == 7) { // Level with multiple towers you need to "knock" spheres off of 
            this.ground = new GameObject("Ground", this.shapes.ground_cube, this.materials.asteroid_texture, vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(120, 1, 60));
            this.ground.add_rigidbody_component(true);
            this.ground.add_collider_component(collider_types.AABB, this.ground.scale);
            this.add_rigidbody(this.ground);

            //////////////////////// TOWER + BALL 1 ////////////////////////
            let tower1 = new GameObject("Tower1", this.shapes.tower_cube, this.materials.brick_texture, vec4(-40.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 14, 3));
            tower1.add_rigidbody_component(true);
            tower1.add_collider_component(collider_types.AABB, tower1.scale);
            this.add_rigidbody(tower1);

            let ball1 = new GameObject("Ball1", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(-40.5, 16, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball1.add_collider_component(collider_types.AABB, ball1.scale);
            this.add_rigidbody(ball1);

            //////////////////////// TOWER + BALL 2 ////////////////////////
            let tower2 = new GameObject("Tower2", this.shapes.tower_cube, this.materials.brick_texture, vec4(-10.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 12, 3));
            tower2.add_rigidbody_component(true);
            tower2.add_collider_component(collider_types.AABB, tower2.scale);
            this.add_rigidbody(tower2);

            let ball2 = new GameObject("Ball2", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(-10.5, 14, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball2.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball2.add_collider_component(collider_types.AABB, ball1.scale);
            this.add_rigidbody(ball2);

            //////////////////////// TOWER + BALL 3 ////////////////////////
            let tower3 = new GameObject("Tower3", this.shapes.tower_cube, this.materials.brick_texture, vec4(5.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 12, 3));
            tower3.add_rigidbody_component(true);
            tower3.add_collider_component(collider_types.AABB, tower3.scale);
            this.add_rigidbody(tower3);

            let ball3 = new GameObject("Ball3", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(5.5, 14, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball3.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball3.add_collider_component(collider_types.AABB, ball3.scale);
            this.add_rigidbody(ball3);

            //////////////////////// TOWER + BALL 4 ////////////////////////
            let tower4 = new GameObject("Tower4", this.shapes.tower_cube, this.materials.brick_texture, vec4(25.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 14, 3));
            tower4.add_rigidbody_component(true);
            tower4.add_collider_component(collider_types.AABB, tower4.scale);
            this.add_rigidbody(tower4);

            let ball4 = new GameObject("Ball4", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), vec4(25.5, 16, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball4.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball4.add_collider_component(collider_types.AABB, ball4.scale);
            this.add_rigidbody(ball4);

            //////////////////////// TOWER + BALL 5 ////////////////////////
            let tower5 = new GameObject("Tower5", this.shapes.tower_cube, this.materials.brick_texture, vec4(50, 0, 0, 1), vec3(0, 0, 0), vec3(3, 14, 3));
            tower5.add_rigidbody_component(true);
            tower5.add_collider_component(collider_types.AABB, tower5.scale);
            this.add_rigidbody(tower5);

            let ball5 = new GameObject("Ball5", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), vec4(50, 16, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball5.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball5.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball5.add_collider_component(collider_types.AABB, ball5.scale);
            this.add_rigidbody(ball5);
        } else if (this.test_scene == 8) {
            // nothing to do
        } else if (this.test_scene == 9) {
            this.ground = new GameObject("Ground2", this.shapes.cube, this.materials.grass_ground.override({ color: hex_color("#e5ebe7") }), vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(60, 1, 60));
            this.ground.add_rigidbody_component(true);
            this.ground.add_collider_component(collider_types.AABB, this.ground.scale);
            this.add_rigidbody(this.ground);


            const force_function = (time) => {
                return vec4(2 * Math.cos(time), 0, 0, 0);
            }

            let horizontal_movement_force = new Force("random_movement", vec4(0, 0, 0, 0), true, -1, true, force_function);
            //////////////////////// CREATING ALL TOWERS ////////////////////////
            let tower1 = new GameObject("tower1", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(20, -4, -55, 1), vec3(0, 0, 0), vec3(2, 5, 2));
            tower1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower1.get_rigidbody_component().add_force_object(horizontal_movement_force);
            tower1.add_collider_component(collider_types.AABB, tower1.scale);
            this.add_rigidbody(tower1);

            let tower2 = new GameObject("tower2", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(40, -4, -55, 1), vec3(0, 0, 0), vec3(2, 5, 2));
            tower2.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower2.get_rigidbody_component().add_force_object(horizontal_movement_force);
            tower2.add_collider_component(collider_types.AABB, tower2.scale);
            this.add_rigidbody(tower2);

            let tower3 = new GameObject("tower3", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(0, -4, -55, 1), vec3(0, 0, 0), vec3(2, 5, 2));
            tower3.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower3.get_rigidbody_component().add_force_object(horizontal_movement_force);
            tower3.add_collider_component(collider_types.AABB, tower3.scale);
            this.add_rigidbody(tower3);

            let tower4 = new GameObject("tower4", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(-20, -4, -55, 1), vec3(0, 0, 0), vec3(2, 5, 2));
            tower4.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower4.get_rigidbody_component().add_force_object(horizontal_movement_force);
            tower4.add_collider_component(collider_types.AABB, tower4.scale);
            this.add_rigidbody(tower4);

            let tower5 = new GameObject("tower5", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(-40, -4, -55, 1), vec3(0, 0, 0), vec3(2, 5, 2));
            tower5.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower5.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower5.get_rigidbody_component().add_force_object(horizontal_movement_force);
            tower5.add_collider_component(collider_types.AABB, tower5.scale);
            this.add_rigidbody(tower5);
        } else if (this.test_scene == 11) {
            this.start_time = time;
            this.can_win_scene_11 = true;

            let ball1 = new GameObject("Ball1", this.shapes.sphere, this.materials.asteroid_texture, vec4(0, -3, -50, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball1.add_rigidbody_component(false, 1, vec4(0, 0, 1, 0), 0, 0.75);
            ball1.add_collider_component(collider_types.AABB, ball1.scale);
            this.add_rigidbody(ball1);


            let ball2 = new GameObject("Ball2", this.shapes.sphere, this.materials.asteroid_texture, vec4(0, 30, -150, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball2.add_rigidbody_component(false, 1, vec4(0, -0.4, 2, 0), 0, 0.75);
            ball2.add_collider_component(collider_types.AABB, ball2.scale);
            this.add_rigidbody(ball2);

            let ball3 = new GameObject("Ball3", this.shapes.sphere, this.materials.asteroid_texture, vec4(50, 2, -180, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball3.add_rigidbody_component(false, 1, vec4(-0.6, 0, 2, 0), 0, 0.75);
            ball3.add_collider_component(collider_types.AABB, ball3.scale);
            this.add_rigidbody(ball3);

            let ball4 = new GameObject("Ball4", this.shapes.sphere, this.materials.asteroid_texture, vec4(-48, 2, -240, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball4.add_rigidbody_component(false, 1, vec4(0.4, 0, 2, 0), 0, 0.75);
            ball4.add_collider_component(collider_types.AABB, ball4.scale);
            this.add_rigidbody(ball4);

            let ball5 = new GameObject("Ball5", this.shapes.sphere, this.materials.asteroid_texture, vec4(48, 2, -240, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball5.add_rigidbody_component(false, 1, vec4(-0.4, 0, 2, 0), 0, 0.75);
            ball5.add_collider_component(collider_types.AABB, ball5.scale);
            this.add_rigidbody(ball5);

            let ball6 = new GameObject("Ball6", this.shapes.sphere, this.materials.asteroid_texture, vec4(0, 2, -280, 1), vec3(0, 0, 0), vec3(2, 2, 2));
            ball6.add_rigidbody_component(false, 1, vec4(0, 0, 2, 0), 0, 0.75);
            ball6.add_collider_component(collider_types.AABB, ball6.scale);
            this.add_rigidbody(ball6);

        }
    }

    update(context, program_state) {
        // Do some update stuff...
        if (this.test_scene == 4 && program_state.animation_time >= 5000 && !this.flag) {
            //this.remove_rigidbody("Cube3");
            //this.remove_rigidbody("Sphere1");
            //this.remove_collider("Wall1"); // This should fail.
            //this.remove_rigidbody("Wall4"); // This should fail.
            //this.remove_collider("Wall4");
            this.flag = true;
        }
        let all_go = this.get_all_game_objects();
        for (let i = all_go.length - 1; i >= 0; --i) {
            const go = all_go[i];
            // Get rid of any game objects that lie outside the camera frustrum.
            if
                (
                go.position[0] <= context.scratchpad.controls.gun_position[0] - 200 ||
                go.position[1] <= -200 ||
                go.position[2] < -200
            ) {
                let level = this.test_scene;
                let do_not_remove = false;
                if (this.required_level_objects[level].forEach(each => {
                    if (each == go.name) {
                        do_not_remove = true;
                    }
                }))

                    if (go.has_rigidbody_component() && !do_not_remove) {
                        this.remove_rigidbody(go.name);
                    }
                    else if (!do_not_remove) {
                        this.remove_collider(go.name);
                    }
                all_go.splice(i, 1);
            }
        }
    }

    shoot(controls) {
        if (controls.fire) {
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
        if (controls.shotgun) {
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

            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), controls.cannon_position, vec3(0, 0, 0), vec3(radius, radius, radius));
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

            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), controls.low_grav_position, vec3(0, 0, 0), vec3(radius, radius, radius));
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.rigidbodies.push(go);
            this.bullet_idx += 1;
        }
    }

    end_game(program_state) {
        this.remove_all_game_objects();
        if (this.test_scene <= 11) {
            this.test_scene = this.test_scene + 1;
        }
        let test_scene = this.test_scene
        let matrix = Mat4.identity().times(this.initial_camera_positions[test_scene]);
        program_state.set_camera(matrix);
    }

    game_over(program_state, time) {
        // note: since game objects are removed as time passes, an object might be removed
        if (this.test_scene == 7) {
            let ball1 = this.get_game_object("Ball1");
            let ball2 = this.get_game_object("Ball2");
            let ball3 = this.get_game_object("Ball3");
            let ball4 = this.get_game_object("Ball4");
            let ball5 = this.get_game_object("Ball5");
            if (ball1 && ball1.position[1] < 12 &&
                ball2 && ball2.position[1] < 12 &&
                ball3 && ball3.position[1] < 12 &&
                ball4 && ball4.position[1] < 12 &&
                ball5 && ball5.position[1] < 12) {
                this.end_game(program_state);
            }
        }
        else if (this.test_scene == 9) {
            let tower1 = this.get_rigidbody("tower1");
            let tower2 = this.get_rigidbody("tower2");
            let tower3 = this.get_rigidbody("tower3");
            let tower4 = this.get_rigidbody("tower4");
            let tower5 = this.get_rigidbody("tower5");
            if (tower1 && tower1.position[1] < -10 && // values are initially null, first "tower1" is needed for undefined check
                tower2 && tower2.position[1] < -10 &&
                tower3 && tower3.position[1] < -10 &&
                tower4 && tower4.position[1] < -10 &&
                tower5 && tower5.position[1] < -10) {
                this.end_game(program_state);
            }
        }
        else if (this.test_scene == 11) {
            if (time > 25 && this.can_win_scene_11) {
                this.end_game(program_state);
            }
        }
    }

    should_update_scene(time) {
        if (this.test_scene == 6 || this.test_scene == 8 || this.test_scene == 10 || this.test_scene == 13) {
            if (this.initial_message_time == -1) {
                this.initial_message_time = time;
            } else {
                if (time - this.initial_message_time > 6) {
                    console.log(this.test_scene);
                    if (this.test_scene == 13) {
                        this.can_win_scene_11 = true;
                        this.test_scene = 11;
                    } else {
                        this.test_scene = this.test_scene + 1;
                    }
                    this.reset_flag = true;
                    this.initial_message_time = -1;
                    this.start_time = time;
                }
            }
        }
    }

    asteroids_have_crossed_moon() {
        let ball1 = this.get_rigidbody("Ball1");
        let ball2 = this.get_rigidbody("Ball2");
        let ball3 = this.get_rigidbody("Ball3");
        let ball4 = this.get_rigidbody("Ball4");
        let ball5 = this.get_rigidbody("Ball5");
        let ball6 = this.get_rigidbody("Ball6");

        if (ball1) {
            if (ball1.position[0] < 10 && ball1.position[0] > -10 &&
                ball1.position[1] < 10 && ball1.position[1] > -10 &&
                ball1.position[2] > -10 && ball1.position[2] < 10) {
                this.can_win_scene_11 = false;
            }
        }

        if (ball2) {
            if (ball2.position[0] < 10 && ball2.position[0] > -10 &&
                ball2.position[1] < 10 && ball2.position[1] > -10 &&
                ball2.position[2] > -10 && ball2.position[2] < 10) {
                this.can_win_scene_11 = false;
            }
        }

        if (ball3) {
            if (ball3.position[0] < 10 && ball3.position[0] > -10 &&
                ball3.position[1] < 10 && ball3.position[1] > -10 &&
                ball3.position[2] > -10 && ball3.position[2] < 10) {
                this.can_win_scene_11 = false;
            }
        }

        if (ball4) {
            if (ball4.position[0] < 10 && ball4.position[0] > -10 &&
                ball4.position[1] < 10 && ball4.position[1] > -10 &&
                ball4.position[2] > -10 && ball4.position[2] < 10) {
                this.can_win_scene_11 = false;
            }
        }

        if (ball5) {
            if (ball5.position[0] < 10 && ball5.position[0] > -10 &&
                ball5.position[1] < 10 && ball5.position[1] > -10 &&
                ball5.position[2] > -10 && ball5.position[2] < 10) {
                this.can_win_scene_11 = false;
            }
        }

        if (ball6) {
            if (ball6.position[0] < 10 && ball6.position[0] > -10 &&
                ball6.position[1] < 10 && ball6.position[1] > -10 &&
                ball6.position[2] > -10 && ball6.position[2] < 10) {
                this.can_win_scene_11 = false;
            }
        }

        if (!this.can_win_scene_11) {
            this.remove_all_game_objects();
            this.test_scene = 13;
        }
    }

    is_out_of_bounds(program_state) {
        if (this.test_scene == 7) {
            if (program_state.camera_transform[0][3] >= 110) {
                return true;
            }
        } else if (this.test_scene == 9) {
            if (program_state.camera_transform[0][3] <= -110) {
                return true;
            }
        }
        return false;
    }

    display(context, program_state) {
        let t = program_state.animation_time / 1000;
        let model_transform = Mat4.identity();
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 200);
        program_state.lights = [new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000)];
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            let test_scene = this.test_scene
            let matrix = this.initial_camera_positions[test_scene];
            program_state.set_camera(matrix);
        }


        //////////////// RESET FLAG ////////////////  
        if (this.reset_flag) {
            let test_scene = this.test_scene
            let matrix = Mat4.identity().times(this.initial_camera_positions[test_scene]);
            program_state.set_camera(matrix);
            this.initialize(context, program_state, t);
            for (let i = this.rigidbodies.length - 1; i >= 0; --i) {
                this.remove_rigidbody(this.rigidbodies[i].name);
                this.rigidbodies.splice(i, 1);
            }
            context.scratchpad.controls.set_speed(0.05);
            this.start_time = t;
            this.reset_flag = false;
        }

        //////////////// MISC LOCAL FUNCTIONS ////////////////
        this.shoot(context.scratchpad.controls);
        this.should_update_scene(t);
        this.game_over(program_state, t - this.start_time);
        if (this.is_out_of_bounds(program_state)) {
            context.scratchpad.controls.set_speed(0);
        }



        //////////////// SCENE-SPECIFIC FUNCTIONS ////////////////
        if (this.test_scene == 11) {
            context.scratchpad.controls.set_speed(0);
            let moon_transform = model_transform.times(Mat4.translation(0, -2.5, -2)).times(Mat4.scale(2, 2, 2));
            this.shapes.moon.draw(context, program_state, moon_transform, this.materials.moon_texture);
            // Check if "asteroids" have been inside moon 
            this.asteroids_have_crossed_moon();
        }

        //////////////// DRAWING SCENES ////////////////
        if (this.test_scene == 7 ||
            this.test_scene == 9 ||
            this.test_scene == 11) {

            // Making Sun
            let sun_transform = model_transform
                .times(Mat4.translation(-50, 20, -20))
                .times(Mat4.scale(3, 3, 3));
            let sun_color = hex_color("#8b8000");

            // Making Lights
            let sunlight_src_pos = vec4(-50, 20, -20, 1);
            program_state.lights = [new Light(sunlight_src_pos, hex_color("#ffffff"), 10 ** 8)];

            // Skybox
            let skybox_transform = model_transform.times(Mat4.scale(120, 100, 100));
            let skybox_color_light = color(0.4, 0.7, 1, 1);
            let skybox_color = (skybox_color_light)

            this.shapes.sphere.draw(context, program_state, sun_transform, this.materials.sun.override({ color: sun_color }));
            this.shapes.skybox.draw(context, program_state, skybox_transform, this.test_scene == 11 ? this.materials.skybox_texture : this.materials.sky_texture);
        } else if (this.test_scene == 6 || this.test_scene == 8 || this.test_scene == 10 || this.test_scene == 12 || this.test_scene == 13) {
            program_state.set_camera(Mat4.identity());
            let message_transform = model_transform
                .times(Mat4.translation(0, -4, -40))
                .times(Mat4.scale(18, 18, 0.1));
            let skybox_transform = model_transform.times(Mat4.scale(80, 80, 100));

            let material;
            if (this.test_scene == 13) {
                material = this.materials.moon_fail_texture;
            }
            else if (this.test_scene == 12) {
                material = this.materials.game_over_texture;
            } else if (this.test_scene == 10) {
                material = this.materials.pre_asteroid_texture;
            } else if (this.test_scene == 8) {
                material = this.materials.level_8_texture;
            } else {
                material = this.materials.welcome_texture;
            }

            this.shapes.cube.draw(context, program_state, message_transform, material);
            this.shapes.skybox.draw(context, program_state, skybox_transform, this.materials.skybox.override({ color: hex_color("#ffffff") }));
        }


        // Calls display in parent "physics_simulation" class
        super.display(context, program_state);
    }
}