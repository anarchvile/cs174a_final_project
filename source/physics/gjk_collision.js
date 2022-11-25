import {defs, tiny} from "../../include/common.js";
import { support } from "./support.js";
import { Simplex } from "../geometry/simplex.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

// https://apps.dtic.mil/sti/pdfs/ADA622925.pdf
export class GJKCollision
{
    is_colliding(goi, goj)
    {
        let n_iters = 0;
        let done = false;
        let are_colliding = false;
        let dir = vec4(1, 0, 0, 0);
        let simplex = new Simplex();
        while (!done && n_iters < 20)
        {
            n_iters += 1;
            let P = support(goi, dir).minus(support(goj, dir.times(-1)));
            P[3] = 1;
            simplex.add(P);
            if (simplex.num_points() > 1 && P.dot(dir) < 0)
            {
                are_colliding = false;
                done = true;
            }
            simplex.process();
            if (simplex.contains_origin())
            {
                are_colliding = true;
                done = true;
            }
            dir = simplex.get_next_direction();
        }

        return {
            are_colliding: are_colliding,
            simplex: simplex
        };
    }
}