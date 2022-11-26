import {tiny} from "../../include/common.js";
import {collider_types} from "./collider.js";
const {vec4, Mat4} = tiny;

export function support(go, d)
{
    let highest = Number.MIN_VALUE;
    let support = vec4(0, 0, 0, 1); // Support is a point, so w = support[3] = 1.
    let dir = d;
    const c = go.get_collider_component();
    // TODO: Add general "convex polygon" type.
    if (c.type == collider_types.AABB)
    {
        for (let i = 0; i < c.points.length; ++i) 
        {
            let v = c.points[i].to4(true);
            v = Mat4.scale(c.size[0], c.size[1], c.size[2]).times(v);
            //v = Mat4.rotation(0, 1, 0, 0).times(v); // TODO: Rotate object.
            const dot = v.dot(dir);
            if (dot > highest) 
            {
                highest = dot;
                support = v;
            }
        }
    }
    else if (c.type == collider_types.Sphere)
    {
        support = Mat4.scale(c.radius, c.radius, c.radius).times(dir.normalized());
    }
    
    support[3] = 1;
    support = Mat4.translation(go.position[0], go.position[1], go.position[2]).times(support);
    return support;
}