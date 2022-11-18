import {defs, tiny} from "../../include/common.js";
import { Simplex } from "../geometry/simplex.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export class GJKCollision
{
    #support(rb, d)
    {
        var highest = Number.MIN_VALUE;
        var support = vec4(0, 0, 0, 1); // Support is a point, so w = support[3] = 1.
        
        // TODO: Add general "convex polygon" type.
        if (rb.type == "cube")
        {
            for (let i = 0; i < rb.shape.arrays.position.length; ++i) 
            {
                let v = rb.shape.arrays.position[i];
                v = v.to4(true); // Vertices are points, so w = v[3] = 1.
                v = Mat4.scale(rb.size[0], rb.size[1], rb.size[2]).times(v);
                //v = Mat4.rotation(0, 1, 0, 0).times(v); // TODO: Rotate object.
                const dot = v.dot(d);
                if (dot > highest) 
                {
                    highest = dot;
                    support = v;
                }
            }
        }
        else if (rb.type == "sphere")
        {
            support = Mat4.scale(rb.size[0], rb.size[1], rb.size[2]).times(d.normalized());
        }
        
        support[3] = 1;
        support = Mat4.translation(rb.position[0], rb.position[1], rb.position[2]).times(support);
        //console.log("SUPPORT", rb.name, support);
        return support;
    }

    is_colliding(rbi, rbj)
    {
        // Invisible objects have no shape, so don't consider them for detection.
        if (rbi.shape != null && rbj.shape != null)
        {
            let nIters = 0;
            let done = false;
            let areColliding = false;
            let dir = vec4(1, 0, 0, 0);
            let simp = new Simplex();
            while (!done && nIters < 20)
            {
                nIters += 1;
                let P = this.#support(rbi, dir).minus(this.#support(rbj, dir.times(-1)));
                P[3] = 1;
                simp.add(P);
                if (simp.num_points() > 1 && P.dot(dir) < 0)
                {
                    areColliding = false;
                    done = true;
                }
                simp.process();
                if (simp.contains_origin())
                {
                    areColliding = true;
                    done = true;
                }
                dir = simp.get_next_direction();
            }

            if (areColliding)
            {
                //console.log(simp.points);
            }

            return areColliding;
        }

        else
        {
            return false;
        }
    }
}