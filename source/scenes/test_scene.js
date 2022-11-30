import { defs, tiny } from "../../include/common.js";
import { PhysicsSim } from "../physics/physics_simulation.js"
import { GameObject, game_object_types } from "../game/gameobject.js";
import { collider_types } from "../collision/collider.js";
const { vec3, vec4, color, hex_color, Mat4, Light, Material, Texture } = tiny;

export class TestScene extends PhysicsSim {
    constructor() {
        super();
        this.shapes =
        {
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
            cone_tip: new defs.Closed_Cone(10, 10),
            skybox: new defs.Cube(),
        };
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                { ambient: .4, diffusivity: .6, color: color(1, 1, 1, 1) }),
            grass_ground: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: 0.1, specularity: 0.1, color: color(0, 154 / 255, 23 / 255, 1) }),
            sun: new Material(new defs.Phong_Shader(),
                { ambient: 1, specularity: 1, diffusivity: 1, color: hex_color("#ffffff") }),
            skybox: new Material(new defs.Phong_Shader(),
                { ambient: 1, diffusivity: 1, color: hex_color("#0000ff") }),
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

        }
        this.initial_camera_positions = {
            0: Mat4.identity(),
            1: Mat4.translation(50, -20, -40),
            2: Mat4.identity(),
            3: Mat4.rotation(Math.PI, 0, 1, 0).times(Mat4.translation(-50, -5, 5)),
            4: Mat4.identity(),
            5: Mat4.translation(50, -20, -40),
            6: Mat4.identity()
        }

        this.level = 5;
        this.bullet_idx = 0;
        this.reset_flag = false;
        this.initial_message_time = -1;

        this.bullets = new Map();
        this.targets = new Map();
    }

    make_control_panel() {
        super.make_control_panel();
        this.new_line();
        this.key_triggered_button("Next level", ["m"], () => {

        });

        this.key_triggered_button("Restart Level", ["r"], () => {
            this.reset_flag = true;
        })
    }



    initialize(context, program_state) {
        this.reset_flag = true;
        if (this.level == 1) { // Level with multiple towers you need to "knock" spheres off of 
            let ground = new GameObject("Ground", this.shapes.cube, this.materials.grass_ground, vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(60, 1, 60));
            ground.add_rigidbody_component(true);
            ground.add_collider_component(collider_types.AABB, ground.scale);
            this.add_rigidbody(ground);

            //////////////////////// TOWER + BALL 1 ////////////////////////
            let tower1 = new GameObject("Tower1", this.shapes.cube, this.materials.box1, vec4(-40.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 14, 3));
            tower1.add_rigidbody_component(true);
            tower1.add_collider_component(collider_types.AABB, tower1.scale);
            this.add_rigidbody(tower1);

            let ball1 = new GameObject("Ball1", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), vec4(-40.5, 16, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2), game_object_types.Target);
            ball1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball1.add_collider_component(collider_types.AABB, ball1.scale);
            this.add_rigidbody(ball1);
            this.targets.set(ball1.name, ball1);

            //////////////////////// TOWER + BALL 2 ////////////////////////
            let tower2 = new GameObject("Tower2", this.shapes.cube, this.materials.box1.override({ color: hex_color("#ff00ff") }), vec4(-10.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 12, 3));
            tower2.add_rigidbody_component(true);
            tower2.add_collider_component(collider_types.AABB, tower2.scale);
            this.add_rigidbody(tower2);

            let ball2 = new GameObject("Ball2", this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), vec4(-10.5, 14, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2), game_object_types.Target);
            ball2.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball2.add_collider_component(collider_types.AABB, ball1.scale);
            this.add_rigidbody(ball2);
            this.targets.set(ball2.name, ball2);

            //////////////////////// TOWER + BALL 3 ////////////////////////
            let tower3 = new GameObject("Tower3", this.shapes.cube, this.materials.box2, vec4(5.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 12, 3));
            tower3.add_rigidbody_component(true);
            tower3.add_collider_component(collider_types.AABB, tower3.scale);
            this.add_rigidbody(tower3);

            let ball3 = new GameObject("Ball3", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 1, 0, 1) }), vec4(5.5, 14, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2), game_object_types.Target);
            ball3.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball3.add_collider_component(collider_types.AABB, ball3.scale);
            this.add_rigidbody(ball3);
            this.targets.set(ball3.name, ball3);

            //////////////////////// TOWER + BALL 4 ////////////////////////
            let tower4 = new GameObject("Tower4", this.shapes.cube, this.materials.box2.override({ color: hex_color("#A47449") }), vec4(25.5, 0, 0, 1), vec3(0, 0, 0), vec3(3, 14, 3));
            tower4.add_rigidbody_component(true);
            tower4.add_collider_component(collider_types.AABB, tower4.scale);
            this.add_rigidbody(tower4);

            let ball4 = new GameObject("Ball4", this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), vec4(25.5, 16, 0, 1), vec3(0, 0, 0), vec3(2, 2, 2), game_object_types.Target);
            ball4.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            ball4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            ball4.add_collider_component(collider_types.AABB, ball4.scale);
            this.add_rigidbody(ball4);
            this.targets.set(ball4.name, ball4);

        }
            
        else if (this.level == 3) {
            let ground = new GameObject("Ground2", this.shapes.cube, this.materials.grass_ground.override({ color: hex_color("#c3834d") }), vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(60, 1, 60));
            ground.add_rigidbody_component(true);
            ground.add_collider_component(collider_types.AABB, ground.scale);
            this.add_rigidbody(ground);

            //////////////////////// CREATING ALL TOWERS ////////////////////////
            let tower1 = new GameObject("tower1", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(20, 3, -55, 1), vec3(0, 0, 0), vec3(2, 10, 2), game_object_types.Target);
            tower1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower1.add_collider_component(collider_types.AABB, tower1.scale);
            this.add_rigidbody(tower1);
            this.targets.set(tower1.name, tower1);

            let tower2 = new GameObject("tower2", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(40, 3, -55, 1), vec3(0, 0, 0), vec3(2, 10, 2), game_object_types.Target);
            tower2.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower2.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower2.add_collider_component(collider_types.AABB, tower2.scale);
            this.add_rigidbody(tower2);
            this.targets.set(tower2.name, tower2);

            let tower3 = new GameObject("tower3", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(0, 3, -55, 1), vec3(0, 0, 0), vec3(2, 10, 2), game_object_types.Target);
            tower3.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower3.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower3.add_collider_component(collider_types.AABB, tower3.scale);
            this.add_rigidbody(tower3);
            this.targets.set(tower3.name, tower3);

            let tower4 = new GameObject("tower4", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(-20, 3, -55, 1), vec3(0, 0, 0), vec3(2, 10, 2), game_object_types.Target);
            tower4.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower4.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower4.add_collider_component(collider_types.AABB, tower4.scale);
            this.add_rigidbody(tower4);
            this.targets.set(tower4.name, tower4);

            let tower5 = new GameObject("tower5", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(-40, 3, -55, 1), vec3(0, 0, 0), vec3(2, 10, 2), game_object_types.Target);
            tower5.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            tower5.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            tower5.add_collider_component(collider_types.AABB, tower5.scale);
            this.add_rigidbody(tower5);
            this.targets.set(tower5.name, tower5);
        }

        else if (this.level == 5) {
            let platform1 = new GameObject("Platform1", this.shapes.cube, this.materials.plastic, vec4(0, -10, 0, 1), vec3(0, 0, 0), vec3(60, 1, 60));
            platform1.add_rigidbody_component(true);
            platform1.add_collider_component(collider_types.AABB, platform1.scale);
            this.add_rigidbody(platform1);

            let target1 = new GameObject("Target1", this.shapes.cube, this.materials.box1.override({ color: color(Math.random(), Math.random(), Math.random(), 1) }), vec4(20, 3, -55, 1), vec3(0, 0, 0), vec3(2, 10, 2), game_object_types.Target);
            target1.add_rigidbody_component(false, 1, vec4(0, 0, 0, 0), 0, 0.75);
            target1.get_rigidbody_component().add_force("Force1", vec4(0, -0.5, 0, 0), true);
            target1.add_collider_component(collider_types.AABB, target1.scale);
            this.add_rigidbody(target1);
            this.targets.set(target1.name, target1);
        }
    }

    update(context, program_state) {
        // Get rid of any game objects that lie outside the camera frustrum.
        let all_go = this.get_all_game_objects();
        for (let i = all_go.length - 1; i >= 0; --i)
        {
            const go = all_go[i];
            if 
            (
                go.position[0] <= context.scratchpad.controls.gun_position[0] - 200 || 
                go.position[1] <= -200 || 
                go.position[2] < -200
            )
            {
                if (go.has_rigidbody_component())
                {
                    // If the object is a bullet, remove it from
                    // the internal bullet list as well.
                    if (go.type == game_object_types.Bullet)
                    {
                        this.bullets.delete(go.name);
                    }
                    this.remove_rigidbody(go.name);
                }
                else
                {
                    this.remove_collider(go.name);
                }
                all_go.splice(i, 1);
            }
        }

        // Check if our required level targets were hit by any bullets. If they were,
        // mark the target as "destroyed" by removing it from the targets list.
        const collision_names = this.collision_callback();
        for (const pair of collision_names)
        {
            if (this.get_game_object(pair[0]).type == game_object_types.Bullet && this.get_game_object(pair[1]).type == game_object_types.Target)
            {
                this.targets.delete(pair[1]);
            }
            else if (this.get_game_object(pair[1]).type == game_object_types.Bullet && this.get_game_object(pair[0]).type == game_object_types.Target)
            {
                this.targets.delete(pair[0]);
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
            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 1, 1, 1) }), controls.gun_position, vec3(0, 0, 0), vec3(radius, radius, radius), game_object_types.Bullet);
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.bullets.set(go.name, go);

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
            let go1 = new GameObject(name1, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 0, 1) }), controls.shotgun_position1, vec3(0, 0, 0), vec3(radius, radius, radius), game_object_types.Bullet);
            go1.add_rigidbody_component();
            go1.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go1.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go1.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go1);

            let go2 = new GameObject(name2, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 0, 1) }), controls.shotgun_position2, vec3(0, 0, 0), vec3(radius, radius, radius), game_object_types.Bullet);
            go2.add_rigidbody_component();
            go2.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go2.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go2.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go2);

            let go3 = new GameObject(name3, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 0, 1, 1) }), controls.shotgun_position3, vec3(0, 0, 0), vec3(radius, radius, radius), game_object_types.Bullet);
            go3.add_rigidbody_component();
            go3.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go3.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go3.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go3);

            this.bullets.set(go1.name, go1);
            this.bullets.set(go2.name, go2);
            this.bullets.set(go3.name, go3);

            this.bullet_idx += 1;
        }
        if (controls.cannon) {
            const name = "Cannon" + this.bullet_idx.toString();
            const gravity = -0.5;
            const speed = 10;
            const radius = 5;

            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), controls.gun_position, vec3(0, 0, 0), vec3(radius, radius, radius), game_object_types.Bullet);
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.bullets.set(go.name, go);

            this.bullet_idx += 1;
        }
        if (controls.low_grav) {
            const name = "Floater" + this.bullet_idx.toString();
            const gravity = -0.1;
            const speed = 5;
            const radius = 1;

            let go = new GameObject(name, this.shapes.sphere, this.materials.plastic.override({ color: color(0, 1, 1, 1) }), controls.gun_position, vec3(0, 0, 0), vec3(radius, radius, radius), game_object_types.Bullet);
            go.add_rigidbody_component();
            go.get_rigidbody_component().add_force("Shoot", controls.gun_aim.times(speed), false, 1); // Shoot it.
            go.get_rigidbody_component().add_force("Gravity", vec4(0, gravity, 0, 0), true); // Apply gravity.
            go.add_collider_component(collider_types.Sphere, radius);
            this.add_rigidbody(go);
            this.bullets.set(go.name, go);
            this.bullet_idx += 1;
        }
    }

    game_over() {
        return (this.level % 2 == 1) && this.targets.size == 0;
    }

    should_update_scene(time) {
        if (this.level == 0 || this.level == 2 || this.level == 4) {
            if (this.initial_message_time == -1) {
                this.initial_message_time = time;
            } else {
                if (time - this.initial_message_time > 6) {
                    this.level = this.level + 1;
                    this.reset_flag = true;
                    this.initial_message_time = -1;
                }
            }
        }
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            let matrix = this.initial_camera_positions[this.level];
            program_state.set_camera(matrix);
        }
        let t = program_state.animation_time / 1000
        this.should_update_scene(t);

        if (this.reset_flag) {
            let matrix = Mat4.identity().times(this.initial_camera_positions[this.level]);
            program_state.set_camera(matrix);
            this.initialize();
            
            for (const key in this.bullets.keys()) {
                this.bullets[key].delete();
            }
            this.reset_flag = false;
        }

        this.shoot(context.scratchpad.controls);

        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 200);
        // extra lights
        program_state.lights = [new Light(vec4(0, 5, 5, 1), color(1, 1, 1, 1), 1000)];

        let model_transform = Mat4.identity();
        if (this.level % 2 == 1) {
            // Making Sun
            let sun_transform = model_transform
                .times(Mat4.translation(-50, 20, -20))
                .times(Mat4.scale(3, 3, 3));
            let sun_color = hex_color("#8b8000");

            // Making Lights
            let sunlight_src_pos = vec4(-50, 20, -20, 1);
            program_state.lights = [new Light(sunlight_src_pos, hex_color("#ffffff"), 10 ** 8)];

            // Skybox
            let skybox_transform = model_transform.times(Mat4.scale(80, 80, 100));
            let skybox_color_light = color(0.4, 0.7, 1, 1);
            let skybox_color = (skybox_color_light)

            this.shapes.sphere.draw(context, program_state, sun_transform, this.materials.sun.override({ color: sun_color }));
            this.shapes.skybox.draw(context, program_state, skybox_transform, this.materials.skybox.override({ color: skybox_color }));
        } else {
            program_state.set_camera(Mat4.identity());
            let message_transform = model_transform
                .times(Mat4.translation(0, 0, -40))
                .times(Mat4.scale(20, 20, 0.1));
            let skybox_transform = model_transform.times(Mat4.scale(80, 80, 100));

            let material;
            if (this.level == 6) {
                material = this.materials.game_over_texture;
            } else if (this.level == 2 || this.level == 4) {
                material = this.materials.next_level_texture;
            } else if (this.level == 0) {
                material = this.materials.welcome_texture;
            }

            this.shapes.cube.draw(context, program_state, message_transform, material);
            this.shapes.skybox.draw(context, program_state, skybox_transform, this.materials.skybox.override({ color: hex_color("#ffffff") }));
        }

        // Calls display in parent "physics_simulation" class
        super.display(context, program_state);

        if (this.game_over()) {
            this.remove_all_game_objects();
            this.level += 1;
            let matrix = Mat4.identity().times(this.initial_camera_positions[this.level]);
            program_state.set_camera(matrix);
        }
    }
}