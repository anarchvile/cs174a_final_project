import {defs, tiny} from '../../include/common.js';
import {PhysicsSim} from "../physics/physics_simulation.js"
import {RigidBody} from "../physics/rigidbody.js";
import {Force} from "../physics/force.js"

const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene,
    Canvas_Widget, Code_Widget, Text_Widget, hex_color
} = tiny;
const { Cube, Axis_Arrows, Phong_Shader, Basic_Shader, Subdivision_Sphere } = defs

export class DemoScene extends PhysicsSim 
{
    constructor() 
    {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = 
        {
            floor: new defs.Cube(),
            sun: new defs.Subdivision_Sphere(4),
            skybox: new defs.Cube(),
            trunk: new defs.Cylindrical_Tube(30, 30),
            leaves: new defs.Closed_Cone(15, 15),
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4)
        };
        // *** Materials
        this.materials = 
        {
            sun: new Material(new defs.Phong_Shader(),
                { ambient: 1, specularity: 0, diffusivity: 0, color: hex_color("#ffffff") }),
            cube_holder: new Material(new Phong_Shader(),
                { ambient: 0.6, diffusivity: 0.6, color: hex_color("#DCDCDC") }),
            trunk: new Material(new Phong_Shader(5),
                { ambient: 0.1, diffusivity: 1, specularity: 0, color: hex_color("#725c42") }),
            leaves: new Material(new Phong_Shader(10),
                { ambient: 0.5, diffusivity: 0.5, specularity: 0, color: hex_color("4caf50") }),
            floor: new Material(new Phong_Shader(5),
                { color: hex_color("#90EE90"), ambient: .2, diffusivity: 0.9, specularity: 0.1 }),
            skybox: new Material(new Phong_Shader(),
                { ambient: 1, diffusivity: 1, color: hex_color("#0000ff") }),
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: color(1,0,0,1)}),
        }
        // ===== Camera =====
        this.initial_camera_location = Mat4.look_at(vec3(0, 15, -45), vec3(0, 5, 0), vec3(0, 1, 0)).times(Mat4.translation(0,-15,35));
        this.camera_location = vec3(0, 20, -20);
    }

    make_control_panel() 
    {

    }

    draw_tree(context, program_state, x, y, z) 
    {
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0, 0));
        model_transform = model_transform.times(Mat4.translation(x, z, -y - 10));
        model_transform = model_transform.times(Mat4.scale(2, 2, 20));
        this.shapes.trunk.draw(context, program_state, model_transform, this.materials.trunk);
        model_transform = model_transform.times(Mat4.rotation(Math.PI, 1, 0, 0));
        model_transform = model_transform.times(Mat4.translation(0, 0, 0.2));
        model_transform = model_transform.times(Mat4.scale(3, 3, 0.2));
        this.shapes.leaves.draw(context, program_state, model_transform, this.materials.leaves);
        // invert above scale, repeat transformation
        model_transform = model_transform.times(Mat4.scale(1 / 3, 1 / 3, 5));
        model_transform = model_transform.times(Mat4.translation(0, 0, 0.1));
        model_transform = model_transform.times(Mat4.scale(3, 3, 0.2));
        this.shapes.leaves.draw(context, program_state, model_transform, this.materials.leaves);
        model_transform = model_transform.times(Mat4.scale(1 / 3, 1 / 3, 5));
        model_transform = model_transform.times(Mat4.translation(0, 0, 0.1));
        model_transform = model_transform.times(Mat4.scale(3, 3, 0.2));
        this.shapes.leaves.draw(context, program_state, model_transform, this.materials.leaves);
        model_transform = model_transform.times(Mat4.scale(1 / 3, 1 / 3, 5));
        model_transform = model_transform.times(Mat4.translation(0, 0, 0.1));
        model_transform = model_transform.times(Mat4.scale(3, 3, 0.2));
        this.shapes.leaves.draw(context, program_state, model_transform, this.materials.leaves);
        model_transform = model_transform.times(Mat4.scale(1 / 3, 1 / 3, 5));
        model_transform = model_transform.times(Mat4.translation(0, 0, 0.1));
        model_transform = model_transform.times(Mat4.scale(3, 3, 0.2));
        this.shapes.leaves.draw(context, program_state, model_transform, this.materials.leaves);
    }

    draw_all_trees(context, program_state) 
    {
        this.draw_tree(context, program_state, 10, 0, 40);
        this.draw_tree(context, program_state, -20, 0, 30);
        this.draw_tree(context, program_state, 10, 0, 40);
        this.draw_tree(context, program_state, 30, 0, 25);
        this.draw_tree(context, program_state, 20, 0, 35);
        this.draw_tree(context, program_state, -30, 0, 25);
    }

    initialize(context, program_state)
    {
        //this.rigidbodies.set("Sphere1", new RigidBody(this.shapes.sphere, this.materials.plastic, "Sphere1", vec4(-20, 1, 0, 1), vec4(0, 0, 0, 0), 1, vec3(2, 2, 2), "sphere"));
        //this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(0,1,0,1) }), "Sphere2", vec4(0, 0, 0, 1), vec4(0, 0, 0, 0), 1, vec3(2, 2, 2), "sphere", false));
        //this.forces.push(new Force(["Sphere1"], vec4(0.2, 0, 0, 0), true));
        //this.forces.push(new Force(["Sphere2"], vec4(-0.2, 0, 0, 0), true));

        this.rigidbodies.set("Ground", new RigidBody(null, this.materials.cube_holder, "Ground", vec4(0, -1, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Wall1", new RigidBody(this.shapes.cube, this.materials.cube_holder, "Wall1", vec4(-21, 10, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        this.rigidbodies.set("Wall2", new RigidBody(null, this.materials.cube_holder, "Wall2", vec4(0, 10, 21, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
        this.rigidbodies.set("Wall3", new RigidBody(this.shapes.cube, this.materials.cube_holder, "Wall3", vec4(21, 10, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 20, 20), "cube", true));
        this.rigidbodies.set("Wall4", new RigidBody(null, this.materials.cube_holder, "Wall4", vec4(0, 10, -21, 1), vec4(0, 0, 0, 0), 1, vec3(20, 20, 1), "cube", true));
        this.rigidbodies.set("Ceiling", new RigidBody(this.shapes.cube, this.materials.cube_holder, "Ceiling", vec4(0, 31, 0, 1), vec4(0, 0, 0, 0), 1, vec3(20, 1, 20), "cube", true));
        this.rigidbodies.set("Sphere1", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), "Sphere1", vec4(0, 17.5, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));
        this.rigidbodies.set("Sphere2", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), "Sphere2", vec4(3, 10, 0, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));
        this.rigidbodies.set("Sphere3", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), "Sphere3", vec4(-4, 11, 2, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));
        this.rigidbodies.set("Sphere4", new RigidBody(this.shapes.sphere, this.materials.plastic.override({ color: color(1, 0, 1, 1) }), "Sphere4", vec4(0, 17.5, 5, 1), vec4(0, 0, 0, 0), 1, vec3(1, 1, 1), "sphere", false));

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

    display(context, program_state) 
    {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        //=============================================== camera section=============================================
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location.copy());
        }

        //===============================================end camera section=============================================
        let model_transform = Mat4.identity();
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 10000);

        // sun 
        let sun_transform = model_transform
            .times(Mat4.translation(-10, 20, 55))
            .times(Mat4.scale(3, 3, 3));
        let orange = hex_color("#8b4000");
        let sun_color = orange;
        let sunlight_src_pos = vec4(-30, 20, 55, 1);

        program_state.lights = [new Light(sunlight_src_pos, hex_color("#ffffff"), 10 ** 8)];


        // making skybox
        let skybox_transform = Mat4.scale(300, 300, 300);
        let skybox_color_light = color(0.4, 0.7, 1, 1);
        let skybox_color = (skybox_color_light)

        // creating floor 
        let floor_transform = Mat4.scale(60, 0.1, 50);


        let cube_transform = Mat4.identity();
        // drawing cube
        // base 
        /*let cube_transform1 = cube_transform.times(Mat4.translation(0, 0, 0)).times(Mat4.scale(10, 1, 10))
        this.shapes.floor.draw(context, program_state, cube_transform1, this.materials.cube_holder);

        // LHS
        let cube_transform2 = cube_transform.times(Mat4.translation(10, 5, 0)).times(Mat4.scale(1, 5, 10));
        this.shapes.floor.draw(context, program_state, cube_transform2, this.materials.cube_holder);

        // RHS
        let cube_transform3 = cube_transform.times(Mat4.translation(-10, 5, 0)).times(Mat4.scale(1, 5, 10));
        this.shapes.floor.draw(context, program_state, cube_transform3, this.materials.cube_holder);

        // Back side
        let cube_transform4 = cube_transform.times(Mat4.translation(0, 5, 9)).times(Mat4.scale(10, 5, 1));
        this.shapes.floor.draw(context, program_state, cube_transform4, this.materials.cube_holder);

        // Back side
        let cube_transform5 = cube_transform.times(Mat4.translation(0, 5, -9)).times(Mat4.scale(10, 5, 1));
        this.shapes.floor.draw(context, program_state, cube_transform5, this.materials.cube_holder);*/

        // draw everything 
        this.shapes.sun.draw(context, program_state, sun_transform, this.materials.sun.override({ color: sun_color }));
        this.shapes.skybox.draw(context, program_state, skybox_transform, this.materials.skybox.override({ color: skybox_color }));
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.floor);
        this.draw_all_trees(context, program_state);

        super.display(context, program_state);
    }
}