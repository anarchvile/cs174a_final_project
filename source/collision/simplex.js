import {tiny} from "../../include/common.js";
const {vec3, vec4} = tiny;

// https://apps.dtic.mil/sti/pdfs/ADA622925.pdf

// The Simplex class is basically just a container for storing a simplex's #points
// plus some related utility methods.
export class Simplex
{
    #points;
    #next_direction;
    #contains_origin_point;

    constructor()
    {
        this.#points = [];
        this.#next_direction = vec4(0, 0, 0, 0);
        this.#contains_origin_point = false;
    }

    add(P)
    {
        if (P.length != 4)
        {
            throw "ERROR: Can only add 4-vector to simplex!";
        }
        this.#points.push(P);
    }

    num_points()
    {
        return this.#points.length;
    }

    get_points()
    {
        return this.#points;
    }

    process()
    {
        if (this.#points.length == 1)
        {
            this.#process_0_simplex();
        }
        else if (this.#points.length == 2)
        {
            this.#process_1_simplex();
        }
        else if (this.#points.length == 3)
        {
            this.#process_2_simplex();
        }
        else if (this.#points.length == 4)
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

    // Add extra points to the simplex to turn it into 
    // a 3-simplex (tetrahedron).
    transform_into_3_simplex()
    {
        // The current simplex is already a tetrahedron;
        // return early.
        if (this.#points.length == 4)
        {
            return;
        }
        // The current simplex is a triangle; add 1
        // point in a direction normal to the plane
        // of the triangle.
        else if (this.#points.length == 3)
        {
            let A = this.#points[2].to3();
            let B = this.#points[1].to3();
            let C = this.#points[0].to3();

            let AB = B.minus(A);
            let AC = C.minus(A);

            let dir = AB.cross(AC);
            // If the triangle is so narrow/skinny (i.e. the 3 triangle 
            // points are almost collinear within a very small margin of imprecision)
            // that the resulting normal is equal to the zero vector, then just treat
            // the triangle as if it were a line and add another point in an arbitrary,
            // out-of-plane direction.
            if (dir.norm() == 0)
            {
                // First choose an arbitrary direction.
                dir = AB.cross(AB.plus(vec3(1, 1, 0)));
                // If we happened to choose a direction that lies exactly on
                // the almost-collinear triangle (i.e. AB == AC == vec3(1,1,0)),
                // then just choose a new direction.
                if (AB.cross(dir).norm() == 0 && AC.cross(dir).norm() == 0)
                {
                    dir = AB.cross(AB.plus(vec3(1, 1, 1)))
                }
            }
            
            let norm = dir.normalized();
            
            let P1 = A.plus(norm).to4(true);
            this.add(P1);
        }
        // The current simplex is a line; add 2 new points
        // to the simplex that are not collinear/coplanar.
        else if (this.#points.length == 2)
        {
            let A = this.#points[1].to3();
            let B = this.#points[0].to3();
            let AB = B.minus(A);

            // First direction away from the line on which
            // we'll add our first point.
            let dir1 = AB.plus(vec3(1, 0, 0));
            let P1 = A.plus(dir1).to4(true);
            this.add(P1);
            
            // Second direction will be a vector normal to
            // the plane formed by AB and dir1.
            let dir2 = AB.cross(dir1).normalized();
            let P2 = A.plus(dir2).to4(true);
            this.add(P2);
        }
        // The current simplex is a point; build
        // a tetrahedron around said point.
        else if (this.#points.length == 1)
        {
            let A = this.#points[0];

            this.add(A.plus(vec4(1, 0, 0, 0)));
            this.add(A.plus(vec4(0, 1, 0, 0)));
            this.add(A.plus(vec4(0, 0, 1, 0)));
        }
        else
        {
            throw "ERROR: No points in simplex!";
        }
    }

    // Process a 0-simplex, i.e. a single point.
    #process_0_simplex()
    {
        let A = this.#points[0].to3();
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
        let A = this.#points[1].to3();
        let B = this.#points[0].to3();

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
        let A = this.#points[2].to3();
        let B = this.#points[1].to3();
        let C = this.#points[0].to3();

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
            this.#points = [B.to4(true), A.to4(true)];
        }
        else if (ACn.dot(AO) > 0)
        {
            // Region 7
            this.#next_direction = AC.cross(AO.cross(AC)).to4(false);
            this.#points = [C.to4(true), A.to4(true)];
        }
        else
        {
            // Region 1. Origin could be below, or above, or in the plane of the triangle.
            let v = ABCn.dot(AO);
            if (v == 0)
            {
                // In the plane of the triangle.
                this.#contains_origin_point = true;
            }
            else if (v > 0)
            {
                // Above the plane of the triangle
                this.#next_direction = ABCn.to4(false);
            }
            else
            {
                // Below the plane of the triangle.
                // Note: we change the order of the simplex. See the
                // handling of a 3-simplex for why.
                this.#next_direction = ABCn.times(-1).to4(false);
                this.#points = [C.to4(true), A.to4(true), B.to4(true)];
            }
        }
    }

    // Process a 3-simplex, i.e. a tetrahedron.
    #process_3_simplex()
    {
        // The 3-simplex consists of the #points A, B, C, D.
        // We assume that A lies in the direction of BC??BD.
        let A = this.#points[3].to3();
        let B = this.#points[2].to3();
        let C = this.#points[1].to3();
        let D = this.#points[0].to3();

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
                this.#points = [C.to4(true), A.to4(true)];
            }
            else if (ABn.dot(AO) > 0)
            {
                this.#next_direction = AB.cross(AO.cross(AB)).to4(false);
                this.#points = [B.to4(true), A.to4(true)];
            }
            else
            {
                this.#next_direction = ABCn.to4(false);
                this.#points = [C.to4(true), B.to4(true), A.to4(true)];
            }
        }
        else if (ACDn.dot(AO) > 0)
        {
            let ADn = ACDn.cross(AD);
            let ACn = AC.cross(ACDn);
            if (ADn.dot(AO) > 0)
            {
                this.#next_direction = AD.cross(AO.cross(AD)).to4(false);
                this.#points = [D.to4(true), A.to4(true)];
            }
            else if (ACn.dot(AO) > 0)
            {
                this.#next_direction = AC.cross(AO.cross(AC)).to4(false);
                this.#points = [C.to4(true), A.to4(true)];
            }
            else
            {
                this.#next_direction = ACDn.to4(false);
                this.#points = [D.to4(true), C.to4(true), A.to4(true)];
            }
        }
        else if (ADBn.dot(AO) > 0)
        {
            let ABn = ADBn.cross(AB);
            let ADn = AD.cross(ADBn);
            if (ABn.dot(AO) > 0)
            {
                this.#next_direction = AB.cross(AO.cross(AB)).to4(false);
                this.#points = [B.to4(true), A.to4(true)];
            }
            else if (ADn.dot(AO) > 0)
            {
                this.#next_direction = AD.cross(AO.cross(AD)).to4(false);
                this.#points = [D.to4(true), A.to4(true)];
            }
            else
            {
                this.#next_direction = ADBn.to4(false);
                this.#points = [B.to4(true), D.to4(true), A.to4(true)];
            }
        }
        else
        {
            this.#contains_origin_point = true;
        }
    }
}