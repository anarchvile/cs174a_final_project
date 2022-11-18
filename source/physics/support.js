import {defs, tiny} from "../../include/common.js";

// Pull these names into this module's scope for convenience:
const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

export function support(rb, d)
{
    var highest = Number.MIN_VALUE;
    var support = vec4(0, 0, 0, 1); // Support is a point, so w = support[3] = 1.
    var dir = d;
    //if (dir[3] == undefined)
    {
        //dir = dir.to4(false);
    }

    // TODO: Add general "convex polygon" type.
    if (rb.type == "cube")
    {
        for (let i = 0; i < rb.vertices.length; ++i) 
        {
            let v = rb.vertices[i];
            v = Mat4.scale(rb.size[0], rb.size[1], rb.size[2]).times(v);
            //v = Mat4.rotation(0, 1, 0, 0).times(v); // TODO: Rotate object.
            const dot = v.dot(dir);
            if (dot > highest) 
            {
                highest = dot;
                support = v;
            }
        }
    }
    else if (rb.type == "sphere")
    {
        support = Mat4.scale(rb.size[0], rb.size[1], rb.size[2]).times(dir.normalized());
    }
    
    support[3] = 1;
    support = Mat4.translation(rb.position[0], rb.position[1], rb.position[2]).times(support);
    return support;
}