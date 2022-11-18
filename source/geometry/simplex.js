import {defs, tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

// The Simplex class is basically just a container for storing a simplex's points
// plus some related utility methods.
export class Simplex
{
    //points;
    #next_direction;
    #contains_origin_point;

    constructor()
    {
        this.points = [];
        this.#next_direction = vec4(0, 0, 0, 0);
        this.#contains_origin_point = false;
    }

    add(P)
    {
        this.points.push(P);
    }

    num_points()
    {
        return this.points.length;
    }

    process()
    {
        if (this.points.length == 1)
        {
            this.#process_0_simplex();
        }
        else if (this.points.length == 2)
        {
            this.#process_1_simplex();
        }
        else if (this.points.length == 3)
        {
            this.#process_2_simplex();
        }
        else if (this.points.length == 4)
        {
            this.#process_3_simplex();
        }
        else
        {
            throw "SIMPLEX ERROR";
        }
    }

    contains_origin()
    {
        return this.#contains_origin_point;
    }

    get_next_direction()
    {
        return this.#next_direction;
    }

    // Process a 0-simplex, i.e. a single point.
    #process_0_simplex()
    {
        let A = this.points[0].to3();
        if (A == vec3(0, 0, 0))
        {
            this.#contains_origin_point = true;
        }
        else
        {
            // Note that we transform the point into a direction by altering the homogeneous coordinate.
            this.#next_direction = A.times(-1).to4(false);
        }
    }
    
    // Process a 1-simplex, i.e. a line segment/edge.
    #process_1_simplex()
    {
        // Note that we convert the vectors to non-homogeneous coordinates
        // in order to eventually use them in some cross product operations.
        let A = this.points[1].to3();
        let B = this.points[0].to3();

        let AB = B.minus(A);
        let AO = A.times(-1);
        let dir = AB.cross(AO.cross(AB));
        if (dir == vec3(0, 0, 0))
        {
            this.#contains_origin_point = true;
        }
        else
        {
            this.#next_direction = dir.to4(false);
        }
    }

    // Process a 2-simplex, i.e. a triangle.
    #process_2_simplex()
    {
        let A = this.points[2].to3();
        let B = this.points[1].to3();
        let C = this.points[0].to3();

        let AB = B.minus(A);
        let AC = C.minus(A);
        let ABCn = AB.cross(AC);
        let ACn = ABCn.cross(AC);
        let ABn = AB.cross(ABCn);
        let AO = A.times(-1);

        if (ABn.dot(AO) > 0)
        {
            // Region 3.
            this.#next_direction = AB.cross(AO.cross(AB)).to4(false);
            this.points = [B.to4(true), A.to4(true)];
        }
        else if (ACn.dot(AO) > 0)
        {
            // Region 7
            this.#next_direction = AC.cross(AO.cross(AC)).to4(false);
            this.points = [C.to4(true), A.to4(true)];
        }
        else
        {
            // Region 1. Origin could be below, or above, or in the plane of the triangle.
            let v = ABCn.dot(AO);
            if (v == 0)
            {
                // In the plane of the triangle
                console.log("AO", AO, "ABCn", ABCn);
                this.#contains_origin_point = true;
            }
            else if (v > 0)
            {
                // Above the plane of the triangle
                this.#next_direction = ABCn.to4(false);
            }
            else
            {
                // Below the plane of the triangle
                // Note: we change the order of the simplex. See the
                // handling of a 3-simplex for why.
                this.#next_direction = ABCn.times(-1).to4(false);
                this.points = [C.to4(true), A.to4(true), B.to4(true)];
            }
        }
    }

    // Process a 3-simplex, i.e. a tetrahedron.
    #process_3_simplex()
    {
        // The 3-simplex consists of the points A, B, C, D.
        // We assume that A lies in the direction of BC×BD.
        let A = this.points[3].to3();
        let B = this.points[2].to3();
        let C = this.points[1].to3();
        let D = this.points[0].to3();

        let AB = B.minus(A);
        let AC = C.minus(A);
        let AD = D.minus(A);
        let AO = A.times(-1);
        let ABCn = AB.cross(AC);
        let ACDn = AC.cross(AD);
        let ADBn = AD.cross(AB);

        if (ABCn.dot(AO) > 0)
        {
            let ACn = ABCn.cross(AC);
            let ABn = AB.cross(ABCn);
            if (ACn.dot(AO) > 0)
            {
                this.#next_direction = AC.cross(AO.cross(AC)).to4(false);
                this.points = [C.to4(true), A.to4(true)];
            }
            else if (ABn.dot(AO) > 0)
            {
                this.#next_direction = AB.cross(AO.cross(AB)).to4(false);
                this.points = [B.to4(true), A.to4(true)];
            }
            else
            {
                this.#next_direction = ABCn.to4(false);
                this.points = [C.to4(true), B.to4(true), A.to4(true)];
            }
        }
        else if (ACDn.dot(AO) > 0)
        {
            let ADn = ACDn.cross(AD);
            let ACn = AC.cross(ACDn);
            if (ADn.dot(AO) > 0)
            {
                this.#next_direction = AD.cross(AO.cross(AD)).to4(false);
                this.points = [D.to4(true), A.to4(true)];
            }
            else if (ACn.dot(AO) > 0)
            {
                this.#next_direction = AC.cross(AO.cross(AC)).to4(false);
                this.points = [C.to4(true), A.to4(true)];
            }
            else
            {
                this.#next_direction = ACDn.to4(false);
                this.points = [D.to4(true), C.to4(true), A.to4(true)];
            }
        }
        else if (ADBn.dot(AO) > 0)
        {
            let ABn = ADBn.cross(AB);
            let ADn = AD.cross(ADBn);
            if (ABn.dot(AO) > 0)
            {
                this.#next_direction = AB.cross(AO.cross(AB)).to4(false);
                this.points = [B.to4(true), A.to4(true)];
            }
            else if (ADn.dot(AO) > 0)
            {
                this.#next_direction = AD.cross(AO.cross(AD)).to4(false);
                this.points = [D.to4(true), A.to4(true)];
            }
            else
            {
                this.#next_direction = ADBn.to4(false);
                this.points = [B.to4(true), D.to4(true), A.to4(true)];
            }
        }
        else
        {
            this.#contains_origin_point = true;
        }
    }
}